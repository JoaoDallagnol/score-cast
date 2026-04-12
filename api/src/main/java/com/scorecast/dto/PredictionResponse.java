package com.scorecast.dto;

import java.util.UUID;

public record PredictionResponse(
        UUID id,
        UUID studentId,
        UUID matchId,
        Integer predHome,
        Integer predAway,
        int pointsAwarded
) {
}
