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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChampionshipMatchService {

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
        Championship ch = championshipService.require(championshipId);
        ChampionshipMatch m = new ChampionshipMatch();
        m.setChampionship(ch);
        m.setTeamHome(request.teamHome().trim());
        m.setTeamAway(request.teamAway().trim());
        matchRepository.save(m);
        return toResponse(m);
    }

    @Transactional(readOnly = true)
    public List<ChampionshipMatchResponse> listByChampionship(UUID championshipId) {
        championshipService.require(championshipId);
        return matchRepository.findByChampionshipIdOrderById(championshipId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChampionshipMatchResponse updateResult(UUID matchId, MatchResultRequest request) {
        ChampionshipMatch m = matchRepository.findById(matchId).orElseThrow(() -> new NotFoundException("Match not found"));
        if (request.scoreHome() < 0 || request.scoreAway() < 0) {
            throw new BadRequestException("Scores must be non-negative");
        }
        m.setScoreHome(request.scoreHome());
        m.setScoreAway(request.scoreAway());
        matchRepository.save(m);
        recalculatePredictionsForMatch(m);
        return toResponse(m);
    }

    @Transactional(readOnly = true)
    public ChampionshipMatch require(UUID id) {
        return matchRepository.findById(id).orElseThrow(() -> new NotFoundException("Match not found"));
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
                m.getTeamHome(),
                m.getTeamAway(),
                m.getScoreHome(),
                m.getScoreAway()
        );
    }
}
