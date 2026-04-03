package com.scorecast.web.dto;

import java.time.Instant;
import java.util.UUID;

public record ChampionshipResponse(
        UUID id,
        String name,
        Instant createdAt
) {
}
