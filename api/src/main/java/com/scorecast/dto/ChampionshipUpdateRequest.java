package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;

public record ChampionshipUpdateRequest(
        @NotBlank String name
) {
}
