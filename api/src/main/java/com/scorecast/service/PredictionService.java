package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import com.scorecast.domain.Student;
import com.scorecast.repository.ChampionshipMatchRepository;
import com.scorecast.repository.PredictionRepository;
import com.scorecast.dto.MatchWithPredictionResponse;
import com.scorecast.dto.PredictionBatchItem;
import com.scorecast.dto.PredictionRequest;
import com.scorecast.dto.PredictionResponse;
import com.scorecast.error.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final StudentService studentService;
    private final ChampionshipMatchService matchService;
    private final ChampionshipMatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    private final ScoringService scoringService;

    public PredictionService(
            StudentService studentService,
            ChampionshipMatchService matchService,
            ChampionshipMatchRepository matchRepository,
            PredictionRepository predictionRepository,
            ScoringService scoringService
    ) {
        this.studentService = studentService;
        this.matchService = matchService;
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.scoringService = scoringService;
    }

    @Transactional(readOnly = true)
    public List<MatchWithPredictionResponse> listMatchesWithPredictions(UUID studentId, UUID championshipId, String sort) {
        log.info("Listing matches with predictions for student: {} championship: {} sort: {}", studentId, championshipId, sort);
        studentService.require(studentId);
        List<ChampionshipMatch> matches = "asc".equalsIgnoreCase(sort)
                ? matchRepository.findByChampionshipIdOrderByCreatedAtAsc(championshipId)
                : matchRepository.findByChampionshipIdOrderByCreatedAtDesc(championshipId);
        List<UUID> matchIds = matches.stream().map(ChampionshipMatch::getId).toList();
        Map<UUID, Prediction> predictionByMatchId = predictionRepository
                .findByStudentIdAndMatchIdIn(studentId, matchIds)
                .stream()
                .collect(Collectors.toMap(p -> p.getMatch().getId(), p -> p));

        return matches.stream().map(m -> {
            Prediction p = predictionByMatchId.get(m.getId());
            return new MatchWithPredictionResponse(
                    m.getId(),
                    m.getTitle(),
                    m.getTeamHome().getId(),
                    m.getTeamHome().getName(),
                    m.getTeamAway().getId(),
                    m.getTeamAway().getName(),
                    m.getScoreHome(),
                    m.getScoreAway(),
                    p != null ? p.getPredHome() : null,
                    p != null ? p.getPredAway() : null,
                    p != null ? p.getPointsAwarded() : null
            );
        }).toList();
    }

    @Transactional
    public List<PredictionResponse> batchUpsert(UUID studentId, List<PredictionBatchItem> items) {
        log.info("Batch upsert {} predictions for student: {}", items.size(), studentId);
        Student student = studentService.require(studentId);

        return items.stream()
                .filter(item -> item.predHome() != null && item.predAway() != null)
                .map(item -> {
                    if (item.predHome() < 0 || item.predAway() < 0) {
                        log.warn("Invalid prediction scores from student {}: {}x{}", studentId, item.predHome(), item.predAway());
                        throw new BadRequestException("Predicted scores must be non-negative");
                    }
                    ChampionshipMatch match = matchService.require(item.matchId());
                    if (!student.getChampionship().getId().equals(match.getChampionship().getId())) {
                        log.warn("Student {} and match {} belong to different championships", studentId, item.matchId());
                        throw new BadRequestException("Match does not belong to the same championship as the student");
                    }
                    Prediction p = predictionRepository.findByStudentIdAndMatchId(studentId, item.matchId()).orElseGet(Prediction::new);
                    p.setStudent(student);
                    p.setMatch(match);
                    p.setPredHome(item.predHome());
                    p.setPredAway(item.predAway());
                    scoringService.applyPoints(p, match);
                    predictionRepository.save(p);
                    log.info("Prediction saved for student: {} match: {}, points: {}", studentId, item.matchId(), p.getPointsAwarded());
                    return new PredictionResponse(p.getId(), student.getId(), match.getId(), p.getPredHome(), p.getPredAway(), p.getPointsAwarded());
                })
                .toList();
    }

    @Transactional
    public PredictionResponse upsert(UUID studentId, UUID matchId, PredictionRequest request) {
        log.info("Upserting prediction for student: {} on match: {} -> {}x{}", studentId, matchId, request.predHome(), request.predAway());
        Student student = studentService.require(studentId);
        ChampionshipMatch match = matchService.require(matchId);

        if (!student.getChampionship().getId().equals(match.getChampionship().getId())) {
            log.warn("Student {} and match {} belong to different championships", studentId, matchId);
            throw new BadRequestException("Match does not belong to the same championship as the student");
        }

        if (request.predHome() != null && request.predHome() < 0 || request.predAway() != null && request.predAway() < 0) {
            log.warn("Invalid prediction scores from student {}: {}x{}", studentId, request.predHome(), request.predAway());
            throw new BadRequestException("Predicted scores must be non-negative");
        }

        Prediction p = predictionRepository.findByStudentIdAndMatchId(studentId, matchId).orElseGet(Prediction::new);
        p.setStudent(student);
        p.setMatch(match);
        p.setPredHome(request.predHome());
        p.setPredAway(request.predAway());
        scoringService.applyPoints(p, match);
        predictionRepository.save(p);
        log.info("Prediction saved for student: {} on match: {}, points awarded: {}", studentId, matchId, p.getPointsAwarded());

        return new PredictionResponse(p.getId(), student.getId(), match.getId(), p.getPredHome(), p.getPredAway(), p.getPointsAwarded());
    }
}
