package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.domain.Team;
import com.scorecast.dto.TeamRequest;
import com.scorecast.dto.TeamResponse;
import com.scorecast.error.BadRequestException;
import com.scorecast.error.NotFoundException;
import com.scorecast.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamService.class);

    private final TeamRepository teamRepository;
    private final ChampionshipService championshipService;

    public TeamService(TeamRepository teamRepository, ChampionshipService championshipService) {
        this.teamRepository = teamRepository;
        this.championshipService = championshipService;
    }

    @Transactional
    public TeamResponse create(UUID championshipId, TeamRequest request) {
        log.info("Creating team: {} in championship: {}", request.name(), championshipId);
        Championship championship = championshipService.require(championshipId);
        if (teamRepository.existsByNameAndChampionshipId(request.name().trim(), championshipId)) {
            log.warn("Team name already exists in championship {}: {}", championshipId, request.name());
            throw new BadRequestException("Team name already exists in this championship");
        }
        Team team = new Team();
        team.setName(request.name().trim());
        team.setChampionship(championship);
        teamRepository.save(team);
        log.info("Team created with id: {}", team.getId());
        return toResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listByChampionship(UUID championshipId) {
        championshipService.require(championshipId);
        return teamRepository.findByChampionshipIdOrderByNameAsc(championshipId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public TeamResponse update(UUID championshipId, UUID teamId, TeamRequest request) {
        log.info("Updating team: {} in championship: {}", teamId, championshipId);
        Team team = require(teamId, championshipId);
        if (teamRepository.existsByNameAndChampionshipId(request.name().trim(), championshipId)
                && !team.getName().equalsIgnoreCase(request.name().trim())) {
            log.warn("Team name already exists in championship {}: {}", championshipId, request.name());
            throw new BadRequestException("Team name already exists in this championship");
        }
        team.setName(request.name().trim());
        teamRepository.save(team);
        log.info("Team updated: {}", teamId);
        return toResponse(team);
    }

    @Transactional
    public void delete(UUID championshipId, UUID teamId) {
        log.info("Deleting team: {} from championship: {}", teamId, championshipId);
        Team team = require(teamId, championshipId);
        teamRepository.delete(team);
        log.info("Team deleted: {}", teamId);
    }

    public Team require(UUID teamId, UUID championshipId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> {
            log.warn("Team not found: {}", teamId);
            return new NotFoundException("Team not found");
        });
        if (!team.getChampionship().getId().equals(championshipId)) {
            log.warn("Team {} does not belong to championship {}", teamId, championshipId);
            throw new NotFoundException("Team not found in this championship");
        }
        return team;
    }

    private TeamResponse toResponse(Team team) {
        return new TeamResponse(team.getId(), team.getName(), team.getChampionship().getId());
    }
}
