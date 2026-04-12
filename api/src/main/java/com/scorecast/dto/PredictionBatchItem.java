package com.scorecast.dto;

import java.util.UUID;

public record PredictionBatchItem(
        UUID matchId,
        Integer predHome,
        Integer predAway
) {
}
