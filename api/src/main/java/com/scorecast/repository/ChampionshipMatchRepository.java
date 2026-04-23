package com.scorecast.repository;

import com.scorecast.domain.ChampionshipMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChampionshipMatchRepository extends JpaRepository<ChampionshipMatch, UUID> {

    List<ChampionshipMatch> findByChampionshipIdOrderById(UUID championshipId);

    List<ChampionshipMatch> findByChampionshipIdOrderByCreatedAtAsc(UUID championshipId);

    List<ChampionshipMatch> findByChampionshipIdOrderByCreatedAtDesc(UUID championshipId);
}
