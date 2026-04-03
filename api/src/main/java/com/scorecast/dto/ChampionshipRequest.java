package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;

public record ChampionshipRequest(
        @NotBlank String name
) {
}
