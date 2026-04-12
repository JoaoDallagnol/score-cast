package com.scorecast.dto;

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
        Integer scoreAway
) {
}
