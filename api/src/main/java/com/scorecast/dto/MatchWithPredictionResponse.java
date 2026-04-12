package com.scorecast.dto;

import java.util.UUID;

public record MatchWithPredictionResponse(
        UUID matchId,
        String title,
        UUID teamHomeId,
        String teamHomeName,
        UUID teamAwayId,
        String teamAwayName,
        Integer scoreHome,
        Integer scoreAway,
        Integer predHome,
        Integer predAway,
        Integer pointsAwarded
) {
}
