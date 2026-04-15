# Implementation Plan: student-school-filter

## Overview

Implementação mínima e cirúrgica do filtro opcional por escola na listagem de alunos. O backend expõe um `@RequestParam(required = false) UUID schoolId` reutilizando a query `findForRanking` já existente; o frontend adiciona um `Select` de escola em `Students.jsx` seguindo o padrão de `RankingTab.jsx`.

## Tasks

- [x] 1. Atualizar backend: `StudentService` e `StudentController`
  - [x] 1.1 Atualizar `StudentService.listByChampionship()` para aceitar `UUID schoolId`
    - Alterar a assinatura do método para `listByChampionship(UUID championshipId, UUID schoolId)`
    - Substituir a chamada `findByChampionshipIdOrderByNameAsc(championshipId)` por `findForRanking(championshipId, schoolId, null)`
    - _Requirements: 1.4, 1.5_

  - [x] 1.2 Atualizar `StudentController.list()` para aceitar `@RequestParam(required = false) UUID schoolId`
    - Adicionar `@RequestParam(required = false) UUID schoolId` ao método `list()`
    - Repassar `schoolId` para `studentService.listByChampionship(championshipId, schoolId)`
    - _Requirements: 1.1, 1.2, 1.3, 3.2_

  - [ ]* 1.3 Escrever testes de propriedade para `StudentService.listByChampionship()` (jqwik)
    - **Property 1: Listagem sem filtro retorna todos os alunos do campeonato ordenados por nome**
    - **Validates: Requirements 1.1, 3.2**
    - **Property 2: Filtro por escola retorna apenas alunos daquela escola**
    - **Validates: Requirements 1.2**
    - Usar `@Property` do jqwik com `@ForAll` para gerar campeonatos e alunos aleatórios
    - Verificar contagem, pertencimento ao campeonato/escola e ordenação ASC

  - [ ]* 1.4 Escrever testes de exemplo para o endpoint (Spring Boot Test)
    - `GET /championships/{id}/students` sem `schoolId` retorna todos os alunos (regressão)
    - `GET /championships/{id}/students?schoolId=<uuid-sem-alunos>` retorna `[]` com HTTP 200
    - _Requirements: 1.1, 1.3_

- [x] 2. Checkpoint — Garantir que todos os testes do backend passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 3. Atualizar frontend: `api.js`
  - [x] 3.1 Atualizar `getStudents` em `api.js` para aceitar `params` opcionais
    - Alterar a assinatura para `getStudents: (championshipId, params = {})`
    - Construir query string com `new URLSearchParams(params).toString()` seguindo o padrão de `getRanking`
    - _Requirements: 2.6_

  - [ ]* 3.2 Escrever teste de propriedade para construção de URL em `api.js` (fast-check + Vitest)
    - **Property 3: Construção de query string pelo API client**
    - **Validates: Requirements 2.6**
    - Gerar UUIDs aleatórios como `schoolId` e verificar que a URL contém `schoolId=<uuid>`
    - Verificar que sem `schoolId` a URL não contém query params

- [x] 4. Atualizar frontend: `Students.jsx`
  - [x] 4.1 Adicionar estado `filterSchoolId` e função `loadStudents` em `Students.jsx`
    - Adicionar `const [filterSchoolId, setFilterSchoolId] = useState('')` (separado do `schoolId` do formulário)
    - Criar função `loadStudents(params)` que centraliza a chamada `api.getStudents(championshipId, params)`
    - _Requirements: 2.2, 2.3, 3.1_

  - [x] 4.2 Adicionar o componente `School_Filter` (Select de escola) acima da lista
    - Renderizar o `Select` de escola apenas quando `championshipId` estiver selecionado
    - Incluir a opção "Todas" como primeiro item (valor vazio `""`)
    - Seguir as escolas carregadas via `api.getSchools()` na ordem recebida
    - Ao selecionar uma escola, chamar `loadStudents({ schoolId: filterSchoolId || undefined })`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.3 Atualizar operações CRUD para respeitar o filtro ativo
    - Em `onChampionshipChange`: chamar `loadStudents({})` ao trocar de campeonato e resetar `filterSchoolId`
    - Em `handleCreate`, `handleUpdate`, `handleDelete`: substituir `api.getStudents(championshipId)` por `loadStudents({ schoolId: filterSchoolId || undefined })`
    - _Requirements: 3.3_

  - [ ]* 4.4 Escrever teste de propriedade para o contador de alunos (fast-check + Vitest)
    - **Property 4: Contador de alunos reflete o tamanho da lista filtrada**
    - **Validates: Requirements 2.5**
    - Gerar listas de alunos de tamanhos variados e verificar que o contador exibido é sempre igual a `students.length`

  - [ ]* 4.5 Escrever teste de propriedade para preservação do filtro em operações CRUD (fast-check + Vitest)
    - **Property 5: Operações CRUD preservam o filtro ativo**
    - **Validates: Requirements 3.3**
    - Para qualquer escola selecionada e qualquer operação CRUD, verificar que `api.getStudents` é chamado com o mesmo `filterSchoolId` ativo

  - [ ]* 4.6 Escrever teste de propriedade para o `School_Filter` (fast-check + Vitest)
    - **Property 6: School_Filter sempre exibe "Todas" como primeira opção**
    - **Validates: Requirements 2.4**
    - Gerar listas de escolas de tamanhos variados e verificar que "Todas" é sempre o primeiro item renderizado

  - [ ]* 4.7 Escrever testes de exemplo para `Students.jsx` (Vitest)
    - Selecionar "Todas" chama `api.getStudents` sem params (Requirement 2.3)
    - `School_Filter` aparece quando `championshipId` está selecionado (Requirement 2.1)
    - Sem filtro ativo, comportamento idêntico ao anterior (Requirement 3.1)

- [x] 5. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- `StudentRepository` não requer nenhuma alteração — a query `findForRanking` já suporta `schoolId = null`
- O estado `filterSchoolId` é separado do `schoolId` do formulário de criação para evitar conflitos
- Testes de propriedade usam jqwik (backend) e fast-check + Vitest (frontend), mínimo 100 iterações cada
