package com.scorecast.dto;

import java.util.UUID;

public record ChampionshipMatchResponse(
        UUID id,
        UUID championshipId,
        String teamHome,
        String teamAway,
        Integer scoreHome,
        Integer scoreAway
) {
}
