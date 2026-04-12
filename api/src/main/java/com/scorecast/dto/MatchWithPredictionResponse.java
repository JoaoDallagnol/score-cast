package com.scorecast.dto;

import java.util.UUID;

public record MatchWithPredictionResponse(
        UUID matchId,
        String title,
        String teamHome,
        String teamAway,
        Integer scoreHome,
        Integer scoreAway,
        Integer predHome,
        Integer predAway,
        Integer pointsAwarded
) {
}
