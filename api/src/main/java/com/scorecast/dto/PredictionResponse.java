package com.scorecast.dto;

import java.util.UUID;

public record PredictionResponse(
        UUID id,
        UUID studentId,
        UUID matchId,
        int predHome,
        int predAway,
        int pointsAwarded
) {
}
