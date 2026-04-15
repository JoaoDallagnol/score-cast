# Requirements Document

## Introduction

Esta feature cria uma página standalone de Ranking no ScoreCast, acessível pelo menu lateral. O objetivo é permitir que o usuário visualize o ranking de alunos de qualquer campeonato — com colocação numerada, filtros por escola e por série — sem precisar navegar até o detalhe de um campeonato específico. A mudança é exclusivamente de frontend: o backend (`RankingController`, `RankingService`) já suporta todos os filtros necessários. A nova página segue o mesmo padrão de layout e estilo das páginas existentes (`Students.jsx`, `Predictions.jsx`).

## Glossary

- **Ranking_Page**: Componente React `Ranking.jsx` — nova página standalone de ranking acessível via `/ranking`.
- **Championship_Selector**: Componente Select de campeonato exibido no topo da Ranking_Page, análogo ao seletor presente em `Students.jsx` e `Predictions.jsx`.
- **School_Filter**: Componente Select de escola para filtrar o ranking por escola, seguindo o padrão já adotado em `RankingTab.jsx` e `Students.jsx`.
- **Serie_Filter**: Componente Input de texto para filtrar o ranking por série, seguindo o padrão já adotado em `RankingTab.jsx`.
- **Ranking_Table**: Tabela de resultados exibida na Ranking_Page, com colunas de colocação, nome, escola, série e pontos.
- **Colocação**: Número ordinal (1, 2, 3...) que representa a posição do aluno no ranking, calculado a partir da posição na lista retornada pela API.
- **RankingController**: Controlador REST existente que expõe `GET /championships/{championshipId}/ranking` com parâmetros opcionais `schoolId` e `serie`.
- **RankingService**: Serviço existente que calcula e ordena o ranking por pontos decrescentes e, em caso de empate, por nome ascendente.
- **API_Client**: Módulo `api.js` do frontend responsável pelas chamadas HTTP à API.
- **Layout**: Componente `Layout.jsx` que define o menu lateral de navegação do ScoreCast.

## Requirements

### Requirement 1: Página standalone de Ranking no menu lateral

**User Story:** Como usuário do ScoreCast, quero acessar o ranking de alunos diretamente pelo menu lateral, para que eu possa visualizar o ranking sem precisar navegar até o detalhe de um campeonato específico.

#### Acceptance Criteria

1. THE Layout SHALL exibir um item "Ranking" no menu lateral de navegação, com ícone e rota `/ranking`, seguindo o mesmo padrão visual dos demais itens do menu.
2. WHEN o usuário acessa a rota `/ranking`, THE Ranking_Page SHALL ser renderizada com o título "Ranking" e o Championship_Selector visível.
3. THE Ranking_Page SHALL carregar a lista de campeonatos disponíveis via `api.getChampionships()` ao ser montada.
4. IF a chamada a `api.getChampionships()` falhar, THEN THE Ranking_Page SHALL exibir uma mensagem de erro descritiva ao usuário.

---

### Requirement 2: Seleção de campeonato

**User Story:** Como usuário do ScoreCast, quero selecionar um campeonato na página de Ranking, para que eu possa visualizar o ranking dos alunos daquele campeonato.

#### Acceptance Criteria

1. THE Championship_Selector SHALL exibir todos os campeonatos disponíveis carregados via `api.getChampionships()`.
2. WHEN o usuário seleciona um campeonato no Championship_Selector, THE Ranking_Page SHALL carregar o ranking daquele campeonato via `api.getRanking(championshipId, params)`.
3. WHEN o usuário troca de campeonato no Championship_Selector, THE Ranking_Page SHALL limpar os filtros ativos (School_Filter e Serie_Filter) e recarregar o ranking sem filtros.
4. IF a chamada a `api.getRanking()` falhar, THEN THE Ranking_Page SHALL exibir uma mensagem de erro descritiva ao usuário.
5. WHILE nenhum campeonato está selecionado no Championship_Selector, THE Ranking_Table SHALL permanecer oculta e nenhuma chamada à API de ranking SHALL ser realizada.

---

### Requirement 3: Filtros de escola e série

**User Story:** Como usuário do ScoreCast, quero filtrar o ranking por escola e por série, para que eu possa comparar o desempenho dos alunos dentro de um grupo específico.

#### Acceptance Criteria

1. WHEN um campeonato está selecionado na Ranking_Page, THE School_Filter SHALL ser exibido com a opção "Todas" como primeira opção, seguida das escolas disponíveis carregadas via `api.getSchools()`.
2. WHEN um campeonato está selecionado na Ranking_Page, THE Serie_Filter SHALL ser exibido como um campo de texto com placeholder indicativo (ex: "Ex: 9A").
3. WHEN o usuário clica no botão "Filtrar", THE Ranking_Page SHALL chamar `api.getRanking(championshipId, params)` passando `schoolId` e/ou `serie` conforme os valores preenchidos nos filtros ativos.
4. WHEN o usuário seleciona "Todas" no School_Filter e clica em "Filtrar", THE Ranking_Page SHALL chamar `api.getRanking(championshipId, params)` sem o parâmetro `schoolId`.
5. WHEN o usuário deixa o Serie_Filter vazio e clica em "Filtrar", THE Ranking_Page SHALL chamar `api.getRanking(championshipId, params)` sem o parâmetro `serie`.
6. THE API_Client SHALL aceitar parâmetros opcionais `schoolId` e `serie` na função `getRanking(championshipId, params)` e construir a query string correspondente apenas para os parâmetros fornecidos.

---

### Requirement 4: Exibição do ranking com colocação

**User Story:** Como usuário do ScoreCast, quero visualizar o ranking com a colocação numerada de cada aluno, para que eu saiba exatamente a posição de cada participante.

#### Acceptance Criteria

1. THE Ranking_Table SHALL exibir as colunas: colocação (#), nome do aluno, escola, série e pontos.
2. THE Ranking_Table SHALL exibir a colocação de cada aluno como o número ordinal correspondente à sua posição na lista retornada pela API (1 para o primeiro, 2 para o segundo, e assim por diante).
3. THE Ranking_Table SHALL exibir os alunos na ordem retornada pela API, que é pontos decrescentes e, em caso de empate, nome ascendente.
4. WHEN a lista de ranking retornada pela API está vazia, THE Ranking_Table SHALL exibir uma mensagem "Sem dados." centralizada na tabela.
5. THE Ranking_Table SHALL exibir o total de pontos de cada aluno na coluna "Pontos", alinhado à direita.

---

### Requirement 5: Preservação do comportamento existente do RankingTab

**User Story:** Como desenvolvedor do ScoreCast, quero garantir que a criação da nova página de Ranking não altere o comportamento do `RankingTab.jsx` existente, para que a aba de ranking no detalhe do campeonato continue funcionando normalmente.

#### Acceptance Criteria

1. THE RankingTab SHALL continuar funcionando de forma independente da Ranking_Page, sem compartilhar estado ou lógica.
2. THE RankingController SHALL continuar aceitando requisições com e sem os parâmetros `schoolId` e `serie`, preservando a compatibilidade com todos os clientes existentes.
3. THE RankingService SHALL continuar ordenando os resultados por pontos decrescentes e, em caso de empate, por nome ascendente, sem nenhuma alteração.
