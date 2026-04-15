package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import org.springframework.stereotype.Service;

@Service
public class ScoringService {

    /**
     * Returns 10 for exact score, 5 for correct winner/draw with wrong score, 0 otherwise.
     */
    public int computePoints(ChampionshipMatch match, Prediction prediction) {
        if (!match.hasOfficialResult()) {
            return 0;
        }
        if (prediction.getPredHome() == null || prediction.getPredAway() == null) {
            return 0;
        }

        int sh = match.getScoreHome(), sa = match.getScoreAway();
        int ph = prediction.getPredHome(), pa = prediction.getPredAway();

        // Placar exato
        if (ph == sh && pa == sa) {
            return 10;
        }

        // Acerto do vencedor ou do empate
        int resultSign = Integer.signum(sh - sa);
        int predSign   = Integer.signum(ph - pa);
        if (resultSign == predSign) {
            return 5;
        }

        return 0;
    }

    public void applyPoints(Prediction prediction, ChampionshipMatch match) {
        prediction.setPointsAwarded(computePoints(match, prediction));
    }
}
