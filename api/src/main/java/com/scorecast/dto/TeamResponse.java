package com.scorecast.dto;

import java.util.UUID;

public record TeamResponse(
        UUID id,
        String name,
        UUID championshipId
) {
}
