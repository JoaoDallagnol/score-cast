package com.scorecast.controller;

import com.scorecast.dto.RankingEntryResponse;
import com.scorecast.service.RankingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/championships/{championshipId}/ranking")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping
    public List<RankingEntryResponse> ranking(
            @PathVariable UUID championshipId,
            @RequestParam(required = false) UUID schoolId,
            @RequestParam(required = false) String serie
    ) {
        return rankingService.ranking(championshipId, schoolId, serie);
    }
}
