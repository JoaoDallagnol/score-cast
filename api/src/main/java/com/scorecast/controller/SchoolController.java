package com.scorecast.controller;

import com.scorecast.dto.SchoolRequest;
import com.scorecast.dto.SchoolResponse;
import com.scorecast.service.SchoolService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping
    public List<SchoolResponse> list() {
        return schoolService.list();
    }
}
