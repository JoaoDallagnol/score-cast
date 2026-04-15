# Implementation Plan: scoring-refactor

## Overview

Refatoração cirúrgica do `ScoringService.computePoints()` para substituir a escala binária MVP (0 ou 1 ponto) pela escala granular de três níveis (10 / 5 / 0). A mudança é isolada em um único método; toda a orquestração existente (`PredictionService`, `ChampionshipMatchService`, `RankingService`) permanece intacta.

## Tasks

- [x] 1. Refatorar `ScoringService.computePoints()`
  - Substituir a lógica binária atual (retorna 0 ou 1) pela lógica de três níveis:
    - Retornar 10 quando `predHome == scoreHome && predAway == scoreAway`
    - Retornar 5 quando `Integer.signum(predHome - predAway) == Integer.signum(scoreHome - scoreAway)` e o placar não é exato
    - Retornar 0 nos demais casos
  - Manter os guards existentes: `!match.hasOfficialResult()` e `predHome == null || predAway == null` retornam 0
  - O método `applyPoints()` não requer nenhuma alteração
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2_

- [x] 2. Verificar integração com `ChampionshipMatchService` e `PredictionService`
  - Confirmar que `ChampionshipMatchService.recalculatePredictionsForMatch()` já chama `scoringService.applyPoints()` para cada palpite — nenhuma alteração necessária
  - Confirmar que `PredictionService.batchUpsert()` e `upsert()` já chamam `scoringService.applyPoints()` — nenhuma alteração necessária
  - Confirmar que `RankingService` agrega `pointsAwarded` persistidos sem lógica de pontuação própria — nenhuma alteração necessária
  - _Requirements: 4.1, 4.2, 4.3, 5.2_

## Notes

- A única alteração de código de produção é em `ScoringService.computePoints()` — todos os outros serviços permanecem intactos
- O frontend (`Predictions.jsx`, `RankingTab.jsx`) não requer nenhuma alteração — já exibe `pointsAwarded` diretamente da API
