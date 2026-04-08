package com.scorecast.controller;

import com.scorecast.dto.SchoolRequest;
import com.scorecast.dto.SchoolResponse;
import com.scorecast.dto.SchoolUpdateRequest;
import com.scorecast.service.SchoolService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/schools")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    @PostMapping
    public SchoolResponse create(@Valid @RequestBody SchoolRequest request) {
        return schoolService.create(request);
    }

    @PutMapping("/{id}")
    public SchoolResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody SchoolUpdateRequest request
    ) {
        return schoolService.update(id, request);
    }

    @GetMapping
    public List<SchoolResponse> list() {
        return schoolService.list();
    }
}
