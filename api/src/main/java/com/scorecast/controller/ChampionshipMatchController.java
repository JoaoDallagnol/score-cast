package com.scorecast.controller;

import com.scorecast.dto.ChampionshipMatchResponse;
import com.scorecast.dto.MatchRequest;
import com.scorecast.service.ChampionshipMatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
        return matchService.update(matchId, championshipId, request);
    }

    @DeleteMapping("/{matchId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID championshipId,
            @PathVariable UUID matchId
    ) {
        matchService.delete(matchId);
    }

    @GetMapping
    public List<ChampionshipMatchResponse> list(
            @PathVariable UUID championshipId,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        return matchService.listByChampionship(championshipId, sort);
    }
}
