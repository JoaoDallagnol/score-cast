package com.scorecast.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SchoolRequest(
        @NotBlank String name
) {
}
