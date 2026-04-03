package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.domain.School;
import com.scorecast.domain.Student;
import com.scorecast.repository.StudentRepository;
import com.scorecast.dto.StudentRequest;
import com.scorecast.dto.StudentResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    private final ChampionshipService championshipService;
    private final SchoolService schoolService;
    private final StudentRepository studentRepository;

    public StudentService(
            ChampionshipService championshipService,
            SchoolService schoolService,
            StudentRepository studentRepository
    ) {
        this.championshipService = championshipService;
        this.schoolService = schoolService;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public StudentResponse create(UUID championshipId, StudentRequest request) {
        Championship ch = championshipService.require(championshipId);
        School school = schoolService.require(request.schoolId());
        Student s = new Student();
        s.setChampionship(ch);
        s.setSchool(school);
        s.setName(request.name().trim());
        s.setSerie(request.serie().trim());
        studentRepository.save(s);
        return toResponse(s);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> listByChampionship(UUID championshipId) {
        championshipService.require(championshipId);
        return studentRepository.findByChampionshipIdOrderByNameAsc(championshipId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Student require(UUID id) {
        return studentRepository.findById(id).orElseThrow(() -> new com.scorecast.error.NotFoundException("Student not found"));
    }

    private StudentResponse toResponse(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getChampionship().getId(),
                s.getSchool().getId(),
                s.getSchool().getName(),
                s.getName(),
                s.getSerie()
        );
    }
}
