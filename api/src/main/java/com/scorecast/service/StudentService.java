package com.scorecast.service;

import com.scorecast.domain.Championship;
import com.scorecast.domain.School;
import com.scorecast.domain.Student;
import com.scorecast.repository.StudentRepository;
import com.scorecast.dto.StudentRequest;
import com.scorecast.dto.StudentResponse;
import com.scorecast.dto.StudentUpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);

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
        log.info("Creating student: {} in championship: {}", request.name(), championshipId);
        Championship ch = championshipService.require(championshipId);
        School school = schoolService.require(request.schoolId());
        Student s = new Student();
        s.setChampionship(ch);
        s.setSchool(school);
        s.setName(request.name().trim());
        s.setSerie(request.serie().trim());
        studentRepository.save(s);
        log.info("Student created with id: {}", s.getId());
        return toResponse(s);
    }

    @Transactional
    public StudentResponse update(UUID id, StudentUpdateRequest request) {
        log.info("Updating student: {}", id);
        Student s = require(id);
        School school = schoolService.require(request.schoolId());
        s.setName(request.name().trim());
        s.setSerie(request.serie().trim());
        s.setSchool(school);
        studentRepository.save(s);
        log.info("Student updated: {}", id);
        return toResponse(s);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> listByChampionship(UUID championshipId, UUID schoolId) {
        championshipService.require(championshipId);
        return studentRepository.findForRanking(championshipId, schoolId, null)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(UUID id) {
        log.info("Deleting student: {}", id);
        Student s = require(id);
        studentRepository.delete(s);
        log.info("Student deleted: {}", id);
    }

    @Transactional(readOnly = true)
    public Student require(UUID id) {
        return studentRepository.findById(id).orElseThrow(() -> {
            log.warn("Student not found: {}", id);
            return new com.scorecast.error.NotFoundException("Student not found");
        });
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
