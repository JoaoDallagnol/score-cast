package com.scorecast.controller;

import com.scorecast.dto.MatchWithPredictionResponse;
import com.scorecast.dto.PredictionBatchItem;
import com.scorecast.dto.PredictionRequest;
import com.scorecast.dto.PredictionResponse;
import com.scorecast.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students/{studentId}/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping
    public List<MatchWithPredictionResponse> listMatchesWithPredictions(
            @PathVariable UUID studentId,
            @RequestParam UUID championshipId,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        return predictionService.listMatchesWithPredictions(studentId, championshipId, sort);
    }

    @PostMapping("/batch")
    public List<PredictionResponse> batchUpsert(
            @PathVariable UUID studentId,
            @RequestBody List<PredictionBatchItem> items
    ) {
        return predictionService.batchUpsert(studentId, items);
    }

    @PutMapping("/{matchId}")
    public PredictionResponse upsert(
            @PathVariable UUID studentId,
            @PathVariable UUID matchId,
            @Valid @RequestBody PredictionRequest request
    ) {
        return predictionService.upsert(studentId, matchId, request);
    }
}
