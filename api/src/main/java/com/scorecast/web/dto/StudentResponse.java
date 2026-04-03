package com.scorecast.web.dto;

import java.util.UUID;

public record StudentResponse(
        UUID id,
        UUID championshipId,
        UUID schoolId,
        String schoolName,
        String name,
        String serie
) {
}
