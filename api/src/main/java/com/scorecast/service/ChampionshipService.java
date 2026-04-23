package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.repository.ChampionshipRepository;
import com.scorecast.dto.ChampionshipRequest;
import com.scorecast.dto.ChampionshipResponse;
import com.scorecast.dto.ChampionshipUpdateRequest;
import com.scorecast.error.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChampionshipService {

    private static final Logger log = LoggerFactory.getLogger(ChampionshipService.class);

    private final ChampionshipRepository championshipRepository;

    public ChampionshipService(ChampionshipRepository championshipRepository) {
        this.championshipRepository = championshipRepository;
    }

    @Transactional
    public ChampionshipResponse create(ChampionshipRequest request) {
        log.info("Creating championship: {}", request.name());
        Championship c = new Championship();
        c.setName(request.name().trim());
        championshipRepository.save(c);
        log.info("Championship created with id: {}", c.getId());
        return toResponse(c);
    }

    @Transactional
    public ChampionshipResponse update(UUID id, ChampionshipUpdateRequest request) {
        log.info("Updating championship: {}", id);
        Championship c = require(id);
        c.setName(request.name().trim());
        championshipRepository.save(c);
        log.info("Championship updated: {}", id);
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public List<ChampionshipResponse> list() {
        return championshipRepository.findAll().stream()
                .sorted((a, b) -> a.getName().toLowerCase().compareTo(b.getName().toLowerCase()))
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ChampionshipResponse get(UUID id) {
        return toResponse(championshipRepository.findById(id).orElseThrow(() -> new NotFoundException("Championship not found")));
    }

    @Transactional
    public void delete(UUID id) {
        log.info("Deleting championship: {}", id);
        Championship c = require(id);
        championshipRepository.delete(c);
        log.info("Championship deleted: {}", id);
    }

    @Transactional(readOnly = true)
    public Championship require(UUID id) {
        return championshipRepository.findById(id).orElseThrow(() -> {
            log.warn("Championship not found: {}", id);
            return new NotFoundException("Championship not found");
        });
    }

    private ChampionshipResponse toResponse(Championship c) {
        return new ChampionshipResponse(c.getId(), c.getName(), c.getCreatedAt());
    }
}
