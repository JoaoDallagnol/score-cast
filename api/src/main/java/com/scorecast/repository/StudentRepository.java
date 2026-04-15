package com.scorecast.repository;

import com.scorecast.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    List<Student> findByChampionshipIdOrderByNameAsc(UUID championshipId);

    @Query("""
            SELECT s FROM Student s
            WHERE s.championship.id = :championshipId
            AND (:schoolId IS NULL OR s.school.id = :schoolId)
            AND (:serie IS NULL OR LOWER(s.serie) = LOWER(:serie))
            ORDER BY s.name ASC
            """)
    List<Student> findForRanking(
            @Param("championshipId") UUID championshipId,
            @Param("schoolId") UUID schoolId,
            @Param("serie") String serie
    );
}
