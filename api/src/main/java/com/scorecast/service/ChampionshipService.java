package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.repository.ChampionshipRepository;
import com.scorecast.web.dto.ChampionshipRequest;
import com.scorecast.web.dto.ChampionshipResponse;
import com.scorecast.web.error.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChampionshipService {

    private final ChampionshipRepository championshipRepository;

    public ChampionshipService(ChampionshipRepository championshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    @Transactional
    public ChampionshipResponse create(ChampionshipRequest request) {
        Championship c = new Championship();
        c.setName(request.name().trim());
        championshipRepository.save(c);
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public List<ChampionshipResponse> list() {
        return championshipRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ChampionshipResponse get(UUID id) {
        return toResponse(championshipRepository.findById(id).orElseThrow(() -> new NotFoundException("Championship not found")));
    }

    @Transactional(readOnly = true)
    public Championship require(UUID id) {
        return championshipRepository.findById(id).orElseThrow(() -> new NotFoundException("Championship not found"));
    }

    private ChampionshipResponse toResponse(Championship c) {
        return new ChampionshipResponse(c.getId(), c.getName(), c.getCreatedAt());
    }
}
