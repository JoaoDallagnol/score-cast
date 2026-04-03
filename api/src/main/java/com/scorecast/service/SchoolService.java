package com.scorecast.service;

import com.scorecast.domain.School;
import com.scorecast.repository.SchoolRepository;
import com.scorecast.web.dto.SchoolRequest;
import com.scorecast.web.dto.SchoolResponse;
import com.scorecast.web.error.NotFoundException;
import com.scorecast.web.error.BadRequestException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @Transactional
    public SchoolResponse create(SchoolRequest request) {
        School s = new School();
        s.setName(request.name().trim());
        try {
            schoolRepository.save(s);
        } catch (DataIntegrityViolationException e) {
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
        return schoolRepository.findById(id).orElseThrow(() -> new NotFoundException("School not found"));
    }

    private SchoolResponse toResponse(School s) {
        return new SchoolResponse(s.getId(), s.getName());
    }
}
