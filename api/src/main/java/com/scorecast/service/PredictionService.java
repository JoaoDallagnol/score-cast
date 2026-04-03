package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import com.scorecast.domain.Student;
import com.scorecast.repository.PredictionRepository;
import com.scorecast.dto.PredictionRequest;
import com.scorecast.dto.PredictionResponse;
import com.scorecast.error.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PredictionService {

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
        Student student = studentService.require(studentId);
        ChampionshipMatch match = matchService.require(matchId);

        if (!student.getChampionship().getId().equals(match.getChampionship().getId())) {
            throw new BadRequestException("Match does not belong to the same championship as the student");
        }

        if (request.predHome() < 0 || request.predAway() < 0) {
            throw new BadRequestException("Predicted scores must be non-negative");
        }

        Prediction p = predictionRepository.findByStudentIdAndMatchId(studentId, matchId).orElseGet(Prediction::new);
        p.setStudent(student);
        p.setMatch(match);
        p.setPredHome(request.predHome());
        p.setPredAway(request.predAway());
        scoringService.applyPoints(p, match);
        predictionRepository.save(p);

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
