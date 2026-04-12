package com.scorecast.controller;

import com.scorecast.dto.TeamRequest;
import com.scorecast.dto.TeamResponse;
import com.scorecast.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/championships/{championshipId}/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamResponse create(
            @PathVariable UUID championshipId,
            @Valid @RequestBody TeamRequest request
    ) {
        return teamService.create(championshipId, request);
    }

    @GetMapping
    public List<TeamResponse> list(@PathVariable UUID championshipId) {
        return teamService.listByChampionship(championshipId);
    }

    @PutMapping("/{teamId}")
    public TeamResponse update(
            @PathVariable UUID championshipId,
            @PathVariable UUID teamId,
            @Valid @RequestBody TeamRequest request
    ) {
        return teamService.update(championshipId, teamId, request);
    }

    @DeleteMapping("/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID championshipId,
            @PathVariable UUID teamId
    ) {
        teamService.delete(championshipId, teamId);
    }
}
