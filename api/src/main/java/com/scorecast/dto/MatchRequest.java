package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;

public record MatchRequest(
        String title,
        @NotBlank String teamHome,
        @NotBlank String teamAway
) {
}
