package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolUpdateRequest(
        @NotBlank String name
) {
}
