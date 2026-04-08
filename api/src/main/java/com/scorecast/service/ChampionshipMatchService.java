package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.repository.ChampionshipMatchRepository;
import com.scorecast.repository.PredictionRepository;
import com.scorecast.dto.ChampionshipMatchResponse;
import com.scorecast.dto.MatchRequest;
import com.scorecast.dto.MatchResultRequest;
import com.scorecast.error.BadRequestException;
import com.scorecast.error.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChampionshipMatchService {

    private static final Logger log = LoggerFactory.getLogger(ChampionshipMatchService.class);

    private final ChampionshipService championshipService;
    private final ChampionshipMatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    private final ScoringService scoringService;

    public ChampionshipMatchService(
            ChampionshipService championshipService,
            ChampionshipMatchRepository matchRepository,
            PredictionRepository predictionRepository,
            ScoringService scoringService
    ) {
        this.championshipService = championshipService;
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.scoringService = scoringService;
    }

    @Transactional
    public ChampionshipMatchResponse create(UUID championshipId, MatchRequest request) {
        log.info("Creating match: {} vs {} in championship: {}", request.teamHome(), request.teamAway(), championshipId);
        Championship ch = championshipService.require(championshipId);
        ChampionshipMatch m = new ChampionshipMatch();
        m.setChampionship(ch);
        m.setTitle(request.title() != null ? request.title().trim() : null);
        m.setTeamHome(request.teamHome().trim());
        m.setTeamAway(request.teamAway().trim());
        matchRepository.save(m);
        log.info("Match created with id: {}", m.getId());
        return toResponse(m);
    }

    @Transactional
    public ChampionshipMatchResponse update(UUID matchId, MatchRequest request) {
        log.info("Updating match: {}", matchId);
        ChampionshipMatch m = require(matchId);
        m.setTitle(request.title() != null ? request.title().trim() : null);
        m.setTeamHome(request.teamHome().trim());
        m.setTeamAway(request.teamAway().trim());
        matchRepository.save(m);
        log.info("Match updated: {}", matchId);
        return toResponse(m);
    }

    @Transactional(readOnly = true)
    public List<ChampionshipMatchResponse> listByChampionship(UUID championshipId) {
        championshipService.require(championshipId);
        return matchRepository.findByChampionshipIdOrderById(championshipId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChampionshipMatchResponse updateResult(UUID matchId, MatchResultRequest request) {
        log.info("Updating result for match: {} -> {}x{}", matchId, request.scoreHome(), request.scoreAway());
        ChampionshipMatch m = matchRepository.findById(matchId).orElseThrow(() -> {
            log.warn("Match not found: {}", matchId);
            return new NotFoundException("Match not found");
        });
        if (request.scoreHome() < 0 || request.scoreAway() < 0) {
            log.warn("Invalid scores for match {}: {}x{}", matchId, request.scoreHome(), request.scoreAway());
            throw new BadRequestException("Scores must be non-negative");
        }
        m.setScoreHome(request.scoreHome());
        m.setScoreAway(request.scoreAway());
        matchRepository.save(m);
        log.info("Recalculating predictions for match: {}", matchId);
        recalculatePredictionsForMatch(m);
        return toResponse(m);
    }

    @Transactional(readOnly = true)
    public ChampionshipMatch require(UUID id) {
        return matchRepository.findById(id).orElseThrow(() -> {
            log.warn("Match not found: {}", id);
            return new NotFoundException("Match not found");
        });
    }

    private void recalculatePredictionsForMatch(ChampionshipMatch match) {
        predictionRepository.findByMatchId(match.getId()).forEach(p -> {
            scoringService.applyPoints(p, match);
            predictionRepository.save(p);
        });
    }

    private ChampionshipMatchResponse toResponse(ChampionshipMatch m) {
        return new ChampionshipMatchResponse(
                m.getId(),
                m.getChampionship().getId(),
                m.getTitle(),
                m.getTeamHome(),
                m.getTeamAway(),
                m.getScoreHome(),
                m.getScoreAway()
        );
    }
}
