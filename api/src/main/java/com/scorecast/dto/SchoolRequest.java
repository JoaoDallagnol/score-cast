package com.scorecast.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolRequest(
        @NotBlank String name
) {
}
