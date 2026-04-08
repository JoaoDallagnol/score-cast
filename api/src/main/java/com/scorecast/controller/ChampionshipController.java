package com.scorecast.controller;

import com.scorecast.dto.ChampionshipRequest;
import com.scorecast.dto.ChampionshipResponse;
import com.scorecast.dto.ChampionshipUpdateRequest;
import com.scorecast.dto.RankingEntryResponse;
import com.scorecast.service.ChampionshipService;
import com.scorecast.service.RankingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/championships")
public class ChampionshipController {

    private final ChampionshipService championshipService;
    private final RankingService rankingService;

    public ChampionshipController(ChampionshipService championshipService, RankingService rankingService) {
        this.championshipService = championshipService;
        this.rankingService = rankingService;
    }

    @PostMapping
    public ChampionshipResponse create(@Valid @RequestBody ChampionshipRequest request) {
        return championshipService.create(request);
    }

    @PutMapping("/{id}")
    public ChampionshipResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody ChampionshipUpdateRequest request
    ) {
        return championshipService.update(id, request);
    }

    @GetMapping
    public List<ChampionshipResponse> list() {
        return championshipService.list();
    }

    @GetMapping("/{id}")
    public ChampionshipResponse get(@PathVariable UUID id) {
        return championshipService.get(id);
    }

    @GetMapping("/{id}/rankings")
    public List<RankingEntryResponse> rankings(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID schoolId,
            @RequestParam(required = false) String serie
    ) {
        return rankingService.ranking(id, schoolId, serie);
    }
}
