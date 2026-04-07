package com.scorecast.service;

import com.scorecast.domain.School;
import com.scorecast.repository.SchoolRepository;
import com.scorecast.dto.SchoolRequest;
import com.scorecast.dto.SchoolResponse;
import com.scorecast.error.NotFoundException;
import com.scorecast.error.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SchoolService {

    private static final Logger log = LoggerFactory.getLogger(SchoolService.class);

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @Transactional
    public SchoolResponse create(SchoolRequest request) {
        log.info("Creating school: {}", request.name());
        School s = new School();
        s.setName(request.name().trim());
        try {
            schoolRepository.save(s);
            log.info("School created with id: {}", s.getId());
        } catch (DataIntegrityViolationException e) {
            log.warn("School name already exists: {}", request.name());
            throw new BadRequestException("School name already exists");
        }
        return toResponse(s);
    }

    @Transactional(readOnly = true)
    public List<SchoolResponse> list() {
        return schoolRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public School require(UUID id) {
        return schoolRepository.findById(id).orElseThrow(() -> {
            log.warn("School not found: {}", id);
            return new NotFoundException("School not found");
        });
    }

    private SchoolResponse toResponse(School s) {
        return new SchoolResponse(s.getId(), s.getName());
    }
}
