package com.scorecast.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record StudentRequest(
        @NotBlank String name,
        @NotBlank String serie,
        @NotNull UUID schoolId
) {
}
