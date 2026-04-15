package com.scorecast.service;

import com.scorecast.domain.ChampionshipMatch;
import com.scorecast.domain.Prediction;
import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests for ScoringService.computePoints() — scoring-refactor spec.
 */
class ScoringServiceTest {

    private ScoringService scoringService;

    @BeforeEach
    void setUp() {
        scoringService = new ScoringService();
    }

    // -------------------------------------------------------------------------
    // Helper factories
    // -------------------------------------------------------------------------

    private ChampionshipMatch matchWithResult(int scoreHome, int scoreAway) {
        ChampionshipMatch m = new ChampionshipMatch();
        m.setScoreHome(scoreHome);
        m.setScoreAway(scoreAway);
        return m;
    }

    private ChampionshipMatch matchWithoutResult() {
        return new ChampionshipMatch();
    }

    private Prediction prediction(Integer predHome, Integer predAway) {
        Prediction p = new Prediction();
        p.setPredHome(predHome);
        p.setPredAway(predAway);
        return p;
    }

    // -------------------------------------------------------------------------
    // Example-based unit tests
    // -------------------------------------------------------------------------

    @Test
    void exactScore_2x1_returns10() {
        assertEquals(10, scoringService.computePoints(matchWithResult(2, 1), prediction(2, 1)));
    }

    @Test
    void sameWinner_3x1_vs_2x1_returns5() {
        assertEquals(5, scoringService.computePoints(matchWithResult(2, 1), prediction(3, 1)));
    }

    @Test
    void wrongWinner_1x2_vs_2x1_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithResult(2, 1), prediction(1, 2)));
    }

    @Test
    void drawPrediction_1x1_vs_2x1_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithResult(2, 1), prediction(1, 1)));
    }

    @Test
    void exactDraw_1x1_returns10() {
        assertEquals(10, scoringService.computePoints(matchWithResult(1, 1), prediction(1, 1)));
    }

    @Test
    void correctDraw_wrongScore_0x0_vs_1x1_returns5() {
        assertEquals(5, scoringService.computePoints(matchWithResult(1, 1), prediction(0, 0)));
    }

    @Test
    void predictionWithWinner_2x1_vs_1x1_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithResult(1, 1), prediction(2, 1)));
    }

    @Test
    void noOfficialResult_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithoutResult(), prediction(1, 0)));
    }

    @Test
    void nullPredHome_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithResult(2, 1), prediction(null, 1)));
    }

    @Test
    void nullPredAway_returns0() {
        assertEquals(0, scoringService.computePoints(matchWithResult(2, 1), prediction(2, null)));
    }

    // -------------------------------------------------------------------------
    // Property-based tests (jqwik)
    // -------------------------------------------------------------------------

    /**
     * Property 1: For any exact score match, computePoints == 10
     * Validates: Requirements 1.1, 2.1
     */
    @Property(tries = 100)
    void property1_exactScore_alwaysReturns10(
            @ForAll @IntRange(min = 0, max = 20) int sh,
            @ForAll @IntRange(min = 0, max = 20) int sa) {
        ChampionshipMatch match = matchWithResult(sh, sa);
        Prediction pred = prediction(sh, sa);
        assertEquals(10, scoringService.computePoints(match, pred),
                "Exact score should always return 10");
    }

    /**
     * Property 2: For any correct winner/draw with wrong score, computePoints == 5
     * Validates: Requirements 1.2, 2.2
     */
    @Property(tries = 100)
    void property2_correctWinnerWrongScore_alwaysReturns5(
            @ForAll("correctWinnerWrongScoreCases") int[] scores) {
        int sh = scores[0], sa = scores[1], ph = scores[2], pa = scores[3];
        ChampionshipMatch match = matchWithResult(sh, sa);
        Prediction pred = prediction(ph, pa);
        assertEquals(5, scoringService.computePoints(match, pred),
                "Correct winner/draw with wrong score should return 5");
    }

    @Provide
    Arbitrary<int[]> correctWinnerWrongScoreCases() {
        // Generate cases where signum(ph-pa) == signum(sh-sa) but (ph,pa) != (sh,sa)
        Arbitrary<Integer> score = Arbitraries.integers().between(0, 20);
        return Combinators.combine(score, score, score, score)
                .as((sh, sa, ph, pa) -> new int[]{sh, sa, ph, pa})
                .filter(s -> {
                    int sh = s[0], sa = s[1], ph = s[2], pa = s[3];
                    return Integer.signum(ph - pa) == Integer.signum(sh - sa)
                            && !(ph == sh && pa == sa);
                });
    }

    /**
     * Property 3: For any wrong winner, computePoints == 0
     * Validates: Requirements 1.3, 1.4, 2.3
     */
    @Property(tries = 100)
    void property3_wrongWinner_alwaysReturns0(
            @ForAll("wrongWinnerCases") int[] scores) {
        int sh = scores[0], sa = scores[1], ph = scores[2], pa = scores[3];
        ChampionshipMatch match = matchWithResult(sh, sa);
        Prediction pred = prediction(ph, pa);
        assertEquals(0, scoringService.computePoints(match, pred),
                "Wrong winner should always return 0");
    }

    @Provide
    Arbitrary<int[]> wrongWinnerCases() {
        Arbitrary<Integer> score = Arbitraries.integers().between(0, 20);
        return Combinators.combine(score, score, score, score)
                .as((sh, sa, ph, pa) -> new int[]{sh, sa, ph, pa})
                .filter(s -> Integer.signum(s[2] - s[3]) != Integer.signum(s[0] - s[1]));
    }

    /**
     * Property 4: For any prediction with no official result, computePoints == 0
     * Validates: Requirements 3.1, 5.1
     */
    @Property(tries = 100)
    void property4_noOfficialResult_alwaysReturns0(
            @ForAll @IntRange(min = 0, max = 20) int ph,
            @ForAll @IntRange(min = 0, max = 20) int pa) {
        ChampionshipMatch match = matchWithoutResult();
        Prediction pred = prediction(ph, pa);
        assertEquals(0, scoringService.computePoints(match, pred),
                "No official result should always return 0");
    }

    /**
     * Property 5: For any prediction with null predHome or predAway, computePoints == 0
     * Validates: Requirements 3.2
     */
    @Property(tries = 100)
    void property5_nullPrediction_alwaysReturns0(
            @ForAll @IntRange(min = 0, max = 20) int sh,
            @ForAll @IntRange(min = 0, max = 20) int sa,
            @ForAll boolean nullHome) {
        ChampionshipMatch match = matchWithResult(sh, sa);
        Prediction pred = nullHome ? prediction(null, 1) : prediction(1, null);
        assertEquals(0, scoringService.computePoints(match, pred),
                "Null predHome or predAway should always return 0");
    }
}
