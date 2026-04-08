package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record StudentUpdateRequest(
        @NotBlank String name,
        @NotBlank String serie,
        @NotNull UUID schoolId
) {
}
