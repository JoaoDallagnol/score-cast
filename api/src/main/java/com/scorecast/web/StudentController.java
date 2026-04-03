package com.scorecast.web;

import com.scorecast.service.StudentService;
import com.scorecast.web.dto.StudentRequest;
import com.scorecast.web.dto.StudentResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/championships/{championshipId}/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public StudentResponse create(
            @PathVariable UUID championshipId,
            @Valid @RequestBody StudentRequest request
    ) {
        return studentService.create(championshipId, request);
    }

    @GetMapping
    public List<StudentResponse> list(@PathVariable UUID championshipId) {
        return studentService.listByChampionship(championshipId);
    }
}
