package com.scorecast.dto;

import java.time.Instant;
import java.util.UUID;

public record ChampionshipMatchResponse(
        UUID id,
        UUID championshipId,
        String title,
        UUID teamHomeId,
        String teamHomeName,
        UUID teamAwayId,
        String teamAwayName,
        Integer scoreHome,
        Integer scoreAway,
        Instant createdAt
) {
}
