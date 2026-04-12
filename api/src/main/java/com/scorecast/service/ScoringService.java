package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import org.springframework.stereotype.Service;

@Service
public class ScoringService {

    /**
     * MVP: 1 point if official result exists and predicted score equals official; otherwise 0.
     */
    public int computePoints(ChampionshipMatch match, Prediction prediction) {
        if (!match.hasOfficialResult()) {
            return 0;
        }
        if (prediction.getPredHome() == null || prediction.getPredAway() == null) {
            return 0;
        }
        if (prediction.getPredHome().equals(match.getScoreHome()) && prediction.getPredAway().equals(match.getScoreAway())) {
            return 1;
        }
        return 0;
    }

    public void applyPoints(Prediction prediction, ChampionshipMatch match) {
        prediction.setPointsAwarded(computePoints(match, prediction));
    }
}
