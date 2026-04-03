package com.scorecast.web.dto;

import java.util.UUID;

public record SchoolResponse(
        UUID id,
        String name
) {
}
