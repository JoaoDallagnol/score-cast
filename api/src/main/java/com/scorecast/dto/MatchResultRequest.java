package com.scorecast.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MatchResultRequest(
        @NotNull @Min(0) Integer scoreHome,
        @NotNull @Min(0) Integer scoreAway
) {
}
