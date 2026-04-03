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
        int officialHome = match.getScoreHome();
        int officialAway = match.getScoreAway();
        if (prediction.getPredHome() == officialHome && prediction.getPredAway() == officialAway) {
            return 1;
        }
        return 0;
    }

    public void applyPoints(Prediction prediction, ChampionshipMatch match) {
        prediction.setPointsAwarded(computePoints(match, prediction));
    }
}
