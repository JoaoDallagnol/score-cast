# Requirements Document

## Introduction

Esta feature refatora a lógica de pontuação dos palpites dos alunos no ScoreCast. Atualmente, acertar o placar exato concede 1 ponto e qualquer erro concede 0 pontos. A nova lógica introduz uma escala de pontuação mais granular: 10 pontos para placar exato, 5 pontos para acerto do vencedor (ou do empate) com placar errado, e 0 pontos para erro do vencedor. A mudança é centralizada no `ScoringService` do backend e impacta o recálculo de pontuações existentes, o ranking e a exibição de pontos no frontend.

## Glossary

- **ScoringService**: Serviço de domínio responsável por calcular e aplicar os pontos de um palpite com base no resultado oficial de uma partida.
- **Prediction**: Entidade que representa o palpite de um aluno para uma partida, contendo `predHome`, `predAway` e `pointsAwarded`.
- **ChampionshipMatch**: Entidade que representa uma partida do campeonato, contendo `scoreHome`, `scoreAway` e o estado do resultado oficial.
- **PredictionService**: Serviço que orquestra a criação e atualização de palpites, delegando o cálculo de pontos ao `ScoringService`.
- **ChampionshipMatchService**: Serviço que orquestra a atualização de partidas e o recálculo de pontos de todos os palpites associados.
- **RankingService**: Serviço que agrega os pontos dos palpites para gerar o ranking do campeonato.
- **Placar_Exato**: Situação em que `predHome == scoreHome` e `predAway == scoreAway`.
- **Vencedor_Correto**: Situação em que o sinal de `(predHome - predAway)` é igual ao sinal de `(scoreHome - scoreAway)`, excluindo empates (tratados separadamente).
- **Empate_Correto**: Situação em que o resultado oficial é empate (`scoreHome == scoreAway`) e o palpite também é empate (`predHome == predAway`), mas os placares diferem.

## Requirements

### Requirement 1: Nova lógica de pontuação para resultados com vencedor

**User Story:** Como aluno do ScoreCast, quero receber 10 pontos ao acertar o placar exato de uma partida com vencedor, 5 pontos ao acertar apenas o vencedor e 0 pontos ao errar o vencedor, para que minha pontuação reflita com mais precisão a qualidade do meu palpite.

#### Acceptance Criteria

1. WHEN o resultado oficial de uma partida tem vencedor e o palpite do aluno corresponde ao placar exato, THE ScoringService SHALL retornar 10 pontos.
2. WHEN o resultado oficial de uma partida tem vencedor e o palpite do aluno indica o mesmo vencedor mas com placar diferente do exato, THE ScoringService SHALL retornar 5 pontos.
3. WHEN o resultado oficial de uma partida tem vencedor e o palpite do aluno indica o vencedor errado, THE ScoringService SHALL retornar 0 pontos.
4. WHEN o resultado oficial de uma partida tem vencedor e o palpite do aluno indica empate, THE ScoringService SHALL retornar 0 pontos.

---

### Requirement 2: Nova lógica de pontuação para resultados de empate

**User Story:** Como aluno do ScoreCast, quero receber 10 pontos ao acertar o placar exato de um empate, 5 pontos ao acertar que seria empate com placar diferente e 0 pontos ao errar que seria empate, para que palpites de empate sejam avaliados com a mesma granularidade que palpites com vencedor.

#### Acceptance Criteria

1. WHEN o resultado oficial de uma partida é empate e o palpite do aluno corresponde ao placar exato do empate, THE ScoringService SHALL retornar 10 pontos.
2. WHEN o resultado oficial de uma partida é empate e o palpite do aluno também é empate mas com placar diferente do exato, THE ScoringService SHALL retornar 5 pontos.
3. WHEN o resultado oficial de uma partida é empate e o palpite do aluno indica um vencedor (qualquer placar não-empate), THE ScoringService SHALL retornar 0 pontos.

---

### Requirement 3: Ausência de resultado oficial

**User Story:** Como desenvolvedor do ScoreCast, quero que o `ScoringService` retorne 0 pontos quando a partida ainda não tem resultado oficial ou quando o palpite está incompleto, para que pontuações inválidas não sejam registradas.

#### Acceptance Criteria

1. WHEN a partida não possui resultado oficial, THE ScoringService SHALL retornar 0 pontos independentemente do palpite.
2. WHEN o palpite do aluno não possui `predHome` ou `predAway` preenchidos, THE ScoringService SHALL retornar 0 pontos independentemente do resultado oficial.

---

### Requirement 4: Recálculo de pontuações existentes ao atualizar resultado de partida

**User Story:** Como administrador do ScoreCast, quero que ao registrar ou atualizar o resultado oficial de uma partida todos os palpites associados sejam recalculados com a nova lógica de pontuação, para que o ranking reflita sempre os pontos corretos.

#### Acceptance Criteria

1. WHEN o resultado oficial de uma partida é registrado ou atualizado, THE ChampionshipMatchService SHALL recalcular os pontos de todos os palpites associados à partida utilizando o ScoringService.
2. WHEN o recálculo é concluído, THE ChampionshipMatchService SHALL persistir os novos valores de `pointsAwarded` de cada Prediction no banco de dados.
3. THE RankingService SHALL utilizar os valores de `pointsAwarded` já calculados e persistidos pelo ScoringService, sem implementar lógica de pontuação própria.

---

### Requirement 5: Preservação do comportamento existente para palpites sem resultado

**User Story:** Como desenvolvedor do ScoreCast, quero garantir que palpites de partidas sem resultado oficial continuem com 0 pontos após a refatoração, para que nenhuma pontuação indevida seja atribuída antes do jogo terminar.

#### Acceptance Criteria

1. WHILE uma partida não possui resultado oficial, THE ScoringService SHALL retornar 0 pontos para qualquer palpite associado a essa partida.
2. THE PredictionService SHALL chamar o ScoringService ao salvar ou atualizar um palpite, garantindo que `pointsAwarded` seja sempre calculado pela lógica centralizada do ScoringService.
