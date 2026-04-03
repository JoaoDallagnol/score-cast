package com.scorecast.repository;

import com.scorecast.domain.Championship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChampionshipRepository extends JpaRepository<Championship, UUID> {
}
