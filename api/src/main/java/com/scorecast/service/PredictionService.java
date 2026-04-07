package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import com.scorecast.domain.Student;
import com.scorecast.repository.PredictionRepository;
import com.scorecast.dto.PredictionRequest;
import com.scorecast.dto.PredictionResponse;
import com.scorecast.error.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final StudentService studentService;
    private final ChampionshipMatchService matchService;
    private final PredictionRepository predictionRepository;
    private final ScoringService scoringService;

    public PredictionService(
            StudentService studentService,
            ChampionshipMatchService matchService,
            PredictionRepository predictionRepository,
            ScoringService scoringService
    ) {
        this.studentService = studentService;
        this.matchService = matchService;
        this.predictionRepository = predictionRepository;
        this.scoringService = scoringService;
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

        if (request.predHome() < 0 || request.predAway() < 0) {
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

        return new PredictionResponse(
                p.getId(),
                student.getId(),
                match.getId(),
                p.getPredHome(),
                p.getPredAway(),
                p.getPointsAwarded()
        );
    }
}
