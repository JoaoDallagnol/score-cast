package com.scorecast.web.dto;

import jakarta.validation.constraints.Min;

public record PredictionRequest(
        @Min(0) int predHome,
        @Min(0) int predAway
) {
}
