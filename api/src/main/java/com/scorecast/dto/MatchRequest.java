package com.scorecast.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MatchRequest(
        String title,
        @NotNull UUID teamHomeId,
        @NotNull UUID teamAwayId
) {
}
