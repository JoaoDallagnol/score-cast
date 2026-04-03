package com.scorecast.web.dto;

import jakarta.validation.constraints.NotBlank;

public record MatchRequest(
        @NotBlank String teamHome,
        @NotBlank String teamAway
) {
}
