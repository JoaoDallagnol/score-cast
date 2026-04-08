package com.scorecast.controller;

import com.scorecast.dto.ChampionshipMatchResponse;
import com.scorecast.dto.MatchRequest;
import com.scorecast.service.ChampionshipMatchService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/championships/{championshipId}/matches")
public class ChampionshipMatchController {

    private final ChampionshipMatchService matchService;

    public ChampionshipMatchController(ChampionshipMatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping
    public ChampionshipMatchResponse create(
            @PathVariable UUID championshipId,
            @Valid @RequestBody MatchRequest request
    ) {
        return matchService.create(championshipId, request);
    }

    @PutMapping("/{matchId}")
    public ChampionshipMatchResponse update(
            @PathVariable UUID championshipId,
            @PathVariable UUID matchId,
            @Valid @RequestBody MatchRequest request
    ) {
        return matchService.update(matchId, request);
    }

    @GetMapping
    public List<ChampionshipMatchResponse> list(@PathVariable UUID championshipId) {
        return matchService.listByChampionship(championshipId);
    }
}
