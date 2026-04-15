# Implementation Plan: ranking-screen

## Overview

Criar a página standalone de Ranking no ScoreCast. As alterações são exclusivamente de frontend: adicionar item de menu em `Layout.jsx`, registrar rota em `App.jsx` e criar o componente `Ranking.jsx` reutilizando a lógica de filtros já presente em `RankingTab.jsx`. O backend não é alterado.

## Tasks

- [x] 1. Adicionar item "Ranking" ao menu lateral em `Layout.jsx`
  - Importar o ícone `BarChart2` de `lucide-react` junto aos demais ícones já importados
  - Inserir `{ to: '/ranking', label: 'Ranking', icon: BarChart2 }` no array `links`, após o item `{ to: '/predictions', ... }` e antes de `{ to: '/management', ... }`
  - Verificar que o `NavLink` gerado recebe `to="/ranking"` e exibe o label "Ranking" — sem alterar nenhum outro item existente
  - _Requirements: 1.1_

- [x] 2. Registrar a rota `/ranking` em `App.jsx`
  - Adicionar `import Ranking from './pages/Ranking'` junto aos demais imports de páginas
  - Adicionar `<Route path="/ranking" element={<Ranking />} />` dentro do bloco `<Route element={<Layout />}>`, após a rota `/predictions`
  - _Requirements: 1.2_

- [x] 3. Criar o componente `Ranking.jsx` com estrutura base e carregamento de campeonatos
  - Criar o arquivo `web/src/pages/Ranking.jsx`
  - Declarar os estados: `championships`, `schools`, `ranking`, `championshipId`, `schoolId`, `serie`, `error` — seguindo o mesmo padrão de `Students.jsx` e `Predictions.jsx`
  - Implementar o `useEffect` de mount que chama `api.getChampionships()` e popula `championships`; em caso de falha, chama `setError(e.message)`
  - Renderizar o título `<h1>Ranking</h1>` e o `Championship_Selector` (Select com `SelectTrigger`, `SelectContent`, `SelectItem`) mapeando `championships`
  - Exibir `{error && <p className="text-sm text-red-600">{error}</p>}` abaixo do seletor
  - Enquanto `championshipId` estiver vazio, não renderizar filtros nem tabela
  - _Requirements: 1.2, 1.3, 1.4, 2.5_

- [x] 4. Implementar `onChampionshipChange` e exibição condicional de filtros
  - Implementar a função `onChampionshipChange(val)`: setar `championshipId`, resetar `ranking`, `schoolId`, `serie`, `error`; chamar `Promise.all([api.getRanking(val, {}), api.getSchools()])` e popular `ranking` e `schools`; em caso de falha, chamar `setError(e.message)`
  - Conectar `onChampionshipChange` ao `onValueChange` do `Championship_Selector`
  - Quando `championshipId` estiver preenchido, renderizar o bloco de filtros: `School_Filter` (Select com opção "Todas" como primeiro `SelectItem` com `value=""`, seguida das escolas de `schools`) e `Serie_Filter` (Input com `placeholder="Ex: 9A"`)
  - Envolver filtros em `<form onSubmit={handleFilter}>` com botão `<Button type="submit">Filtrar</Button>`
  - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 5. Implementar `handleFilter` e lógica de construção de params
  - Implementar `handleFilter(e)`: chamar `e.preventDefault()`, construir `params = {}` incluindo `schoolId` apenas se não vazio e `serie.trim()` apenas se não vazio, chamar `api.getRanking(championshipId, params).then(setRanking).catch((e) => setError(e.message))`
  - Verificar que ao selecionar "Todas" no `School_Filter` (`schoolId === ""`), o param `schoolId` não é incluído na chamada
  - Verificar que ao deixar `Serie_Filter` vazio, o param `serie` não é incluído na chamada
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 6. Implementar a `Ranking_Table`
  - Dentro do bloco condicional `{championshipId && (...)}`, renderizar a tabela com a mesma estrutura de `RankingTab.jsx`: `<table>` com `<thead>` contendo colunas `#`, `Aluno`, `Escola`, `Série`, `Pontos` (coluna Pontos com `text-right`)
  - No `<tbody>`, quando `ranking.length === 0`, exibir `<tr><td colSpan={5} className="... text-center ...">Sem dados.</td></tr>`
  - Quando `ranking.length > 0`, mapear `ranking.map((r, i) => ...)` exibindo `i + 1` na coluna `#`, `r.studentName`, `r.schoolName`, `r.serie`, `r.totalPoints` (alinhado à direita); usar `r.studentId` como `key`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Checkpoint — Verificar integração completa
  - Garantir que o item "Ranking" aparece no menu lateral e navega para `/ranking`
  - Garantir que `Ranking.jsx` carrega campeonatos, exibe filtros após seleção e renderiza a tabela corretamente
  - Garantir que `RankingTab.jsx` não importa nada de `Ranking.jsx` (isolamento total)
  - _Requirements: 1.1, 1.2, 5.1_

## Notes

- A lógica de filtros em `Ranking.jsx` é idêntica à de `RankingTab.jsx` — use-a como referência direta
- `api.getRanking` já existe em `api.js` e já suporta `params` opcionais — nenhuma alteração necessária
- `api.getChampionships` e `api.getSchools` também já existem — sem alterações
- O campo de colocação (`#`) é calculado no frontend como `index + 1`; não vem da API
