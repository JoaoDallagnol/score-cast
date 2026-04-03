package com.scorecast.web.dto;

import java.util.UUID;

public record RankingEntryResponse(
        UUID studentId,
        String studentName,
        UUID schoolId,
        String schoolName,
        String serie,
        long totalPoints
) {
}
