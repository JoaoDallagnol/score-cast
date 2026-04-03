package com.scorecast.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ChampionshipRequest(
        @NotBlank String name
) {
}
