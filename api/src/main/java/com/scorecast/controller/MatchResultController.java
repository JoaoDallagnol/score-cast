package com.scorecast.controller;

import com.scorecast.dto.ChampionshipMatchResponse;
import com.scorecast.dto.MatchResultRequest;
import com.scorecast.service.ChampionshipMatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/matches")
public class MatchResultController {

    private final ChampionshipMatchService matchService;

    public MatchResultController(ChampionshipMatchService matchService) {
        this.matchService = matchService;
    }

    @PatchMapping("/{matchId}/result")
    public ChampionshipMatchResponse updateResult(
            @PathVariable UUID matchId,
            @Valid @RequestBody MatchResultRequest request
    ) {
        return matchService.updateResult(matchId, request);
    }
}
