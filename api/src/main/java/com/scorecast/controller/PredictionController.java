package com.scorecast.controller;

import com.scorecast.dto.PredictionRequest;
import com.scorecast.dto.PredictionResponse;
import com.scorecast.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/students/{studentId}/predictions/{matchId}")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PutMapping
    public PredictionResponse upsert(
            @PathVariable UUID studentId,
            @PathVariable UUID matchId,
            @Valid @RequestBody PredictionRequest request
    ) {
        return predictionService.upsert(studentId, matchId, request);
    }
}
