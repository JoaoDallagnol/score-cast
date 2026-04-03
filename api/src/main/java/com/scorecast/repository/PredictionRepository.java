package com.scorecast.repository;

import com.scorecast.domain.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PredictionRepository extends JpaRepository<Prediction, UUID> {

    Optional<Prediction> findByStudentIdAndMatchId(UUID studentId, UUID matchId);

    List<Prediction> findByMatchId(UUID matchId);

    @Query("SELECT COALESCE(SUM(p.pointsAwarded), 0) FROM Prediction p WHERE p.student.id = :studentId")
    Long sumPointsByStudentId(@Param("studentId") UUID studentId);
}
