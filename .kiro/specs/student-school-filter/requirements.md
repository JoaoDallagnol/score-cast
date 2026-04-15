# Requirements Document

## Introduction

Esta feature adiciona um filtro opcional por escola na listagem de alunos do ScoreCast. O objetivo é permitir que o usuário visualize apenas os alunos de uma escola específica dentro de um campeonato, sem quebrar nenhuma regra de negócio existente. A mudança envolve duas partes: o backend (API Java/Spring Boot) expõe um query param opcional `schoolId` no endpoint de listagem de alunos, e o frontend (React) adiciona um Select de escola na tela `Students.jsx`, seguindo o padrão já adotado na tela de Ranking.

## Glossary

- **StudentController**: Controlador REST responsável pelo endpoint `GET /championships/{championshipId}/students`.
- **StudentService**: Serviço de domínio que encapsula a lógica de negócio de alunos.
- **StudentRepository**: Repositório JPA que acessa os dados de alunos no banco.
- **Students_Page**: Componente React `Students.jsx` que exibe a listagem e o formulário de alunos.
- **API_Client**: Módulo `api.js` do frontend responsável pelas chamadas HTTP à API.
- **School_Filter**: Componente Select de escola adicionado à tela de listagem de alunos.
- **schoolId**: Identificador único de uma escola, do tipo UUID no backend e string no frontend.

## Requirements

### Requirement 1: Filtro opcional por escola no endpoint de listagem

**User Story:** Como usuário da API, quero passar um `schoolId` opcional no endpoint `GET /championships/{championshipId}/students`, para que eu possa obter apenas os alunos de uma escola específica dentro de um campeonato.

#### Acceptance Criteria

1. WHEN a requisição `GET /championships/{championshipId}/students` é recebida sem o parâmetro `schoolId`, THE StudentController SHALL retornar todos os alunos do campeonato ordenados por nome ascendente.
2. WHEN a requisição `GET /championships/{championshipId}/students?schoolId={schoolId}` é recebida com um `schoolId` válido, THE StudentController SHALL retornar apenas os alunos do campeonato que pertencem à escola informada, ordenados por nome ascendente.
3. WHEN a requisição `GET /championships/{championshipId}/students?schoolId={schoolId}` é recebida com um `schoolId` que não corresponde a nenhum aluno do campeonato, THE StudentController SHALL retornar uma lista vazia com status HTTP 200.
4. THE StudentService SHALL delegar a filtragem ao StudentRepository sem alterar nenhuma outra regra de negócio existente (criação, atualização, exclusão de alunos).
5. THE StudentRepository SHALL utilizar a query `findForRanking` existente — ou uma query equivalente — para aplicar o filtro opcional por `schoolId`, mantendo a ordenação por nome ascendente.

---

### Requirement 2: Select de escola na tela de listagem de alunos

**User Story:** Como usuário do ScoreCast, quero filtrar a lista de alunos por escola na tela de Alunos, para que eu possa visualizar rapidamente os alunos de uma escola específica dentro de um campeonato.

#### Acceptance Criteria

1. WHEN um campeonato está selecionado na Students_Page, THE School_Filter SHALL ser exibido acima da lista de alunos.
2. WHEN o usuário seleciona uma escola no School_Filter, THE Students_Page SHALL recarregar a lista de alunos passando o `schoolId` selecionado para a API_Client.
3. WHEN o usuário seleciona a opção "Todas" no School_Filter, THE Students_Page SHALL recarregar a lista de alunos sem passar nenhum `schoolId`, retornando todos os alunos do campeonato.
4. THE School_Filter SHALL exibir a opção "Todas" como primeira opção, seguida das escolas disponíveis carregadas via `api.getSchools()`.
5. WHEN a lista de alunos é recarregada após seleção de escola, THE Students_Page SHALL atualizar o contador de alunos exibido para refletir o número de alunos filtrados.
6. THE API_Client SHALL aceitar um parâmetro opcional `schoolId` na função `getStudents(championshipId, params)` e construir a query string correspondente quando o parâmetro for fornecido.

---

### Requirement 3: Preservação do comportamento existente

**User Story:** Como desenvolvedor do ScoreCast, quero garantir que o filtro por escola seja estritamente opcional, para que nenhuma funcionalidade existente seja quebrada.

#### Acceptance Criteria

1. WHEN o School_Filter não está com nenhuma escola selecionada (valor vazio), THE Students_Page SHALL se comportar de forma idêntica ao comportamento anterior à implementação desta feature.
2. THE StudentController SHALL continuar aceitando requisições sem query params e retornar a lista completa de alunos do campeonato, preservando a compatibilidade com outros clientes da API.
3. WHEN um aluno é criado, atualizado ou excluído na Students_Page, THE Students_Page SHALL recarregar a lista de alunos respeitando o filtro de escola atualmente selecionado no School_Filter.
