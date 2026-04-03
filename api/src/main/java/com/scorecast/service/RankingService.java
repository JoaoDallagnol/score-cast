package com.scorecast.service;

import com.scorecast.domain.Student;
import com.scorecast.repository.PredictionRepository;
import com.scorecast.repository.StudentRepository;
import com.scorecast.dto.RankingEntryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class RankingService {

    private final ChampionshipService championshipService;
    private final StudentRepository studentRepository;
    private final PredictionRepository predictionRepository;

    public RankingService(
            ChampionshipService championshipService,
            StudentRepository studentRepository,
            PredictionRepository predictionRepository
    ) {
        this.championshipService = championshipService;
        this.studentRepository = studentRepository;
        this.predictionRepository = predictionRepository;
    }

    @Transactional(readOnly = true)
    public List<RankingEntryResponse> ranking(UUID championshipId, UUID schoolId, String serie) {
        championshipService.require(championshipId);
        List<Student> students = studentRepository.findForRanking(championshipId, schoolId, emptyToNull(serie));
        return students.stream()
                .map(s -> {
                    long total = predictionRepository.sumPointsByStudentId(s.getId()).longValue();
                    return new RankingEntryResponse(
                            s.getId(),
                            s.getName(),
                            s.getSchool().getId(),
                            s.getSchool().getName(),
                            s.getSerie(),
                            total
                    );
                })
                .sorted(Comparator.comparingLong(RankingEntryResponse::totalPoints).reversed()
                        .thenComparing(RankingEntryResponse::studentName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private static String emptyToNull(String serie) {
        if (serie == null || serie.isBlank()) {
            return null;
        }
        return serie.trim();
    }
}
