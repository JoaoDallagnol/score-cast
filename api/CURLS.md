# Exemplos `curl` — ScoreCast

Base URL (com o app rodando em `localhost:8080`):

```text
http://localhost:8080/api
```

Substitua os IDs pelos retornados nas respostas anteriores.

## Campeonatos

```bash
# Listar
curl -sS http://localhost:8080/api/championships

# Criar
curl -sS -X POST http://localhost:8080/api/championships \
  -H 'Content-Type: application/json' \
  -d '{"name":"Brasileirão 2026"}'

# Obter por id
curl -sS http://localhost:8080/api/championships/CHAMPIONSHIP_ID
```

## Escolas

```bash
# Listar
curl -sS http://localhost:8080/api/schools

# Criar
curl -sS -X POST http://localhost:8080/api/schools \
  -H 'Content-Type: application/json' \
  -d '{"name":"Colégio Central"}'
```

## Jogos (matches)

```bash
# Listar jogos do campeonato
curl -sS http://localhost:8080/api/championships/CHAMPIONSHIP_ID/matches

# Criar jogo (title é opcional)
curl -sS -X POST http://localhost:8080/api/championships/CHAMPIONSHIP_ID/matches \
  -H 'Content-Type: application/json' \
  -d '{"title":"Rodada 1","teamHome":"Flamengo","teamAway":"Palmeiras"}'

# Editar jogo
curl -sS -X PUT http://localhost:8080/api/championships/CHAMPIONSHIP_ID/matches/MATCH_ID \
  -H 'Content-Type: application/json' \
  -d '{"title":"Rodada 1 - Editada","teamHome":"Flamengo","teamAway":"Corinthians"}'

# Definir / atualizar placar oficial
curl -sS -X PATCH http://localhost:8080/api/matches/MATCH_ID/result \
  -H 'Content-Type: application/json' \
  -d '{"scoreHome":2,"scoreAway":1}'

# Deletar jogo (remove também todos os palpites vinculados)
curl -sS -X DELETE http://localhost:8080/api/championships/CHAMPIONSHIP_ID/matches/MATCH_ID
```

## Alunos

```bash
# Listar alunos do campeonato
curl -sS http://localhost:8080/api/championships/CHAMPIONSHIP_ID/students

# Cadastrar aluno
curl -sS -X POST http://localhost:8080/api/championships/CHAMPIONSHIP_ID/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"Maria Silva","serie":"3º ano","schoolId":"SCHOOL_ID"}'
```

## Palpites

```bash
# Listar todos os jogos do campeonato com o palpite do aluno embutido
# predHome/predAway serão null se o aluno ainda não apostou naquele jogo
curl -sS "http://localhost:8080/api/students/STUDENT_ID/predictions?championshipId=CHAMPIONSHIP_ID"

# Salvar múltiplos palpites de uma vez (batch)
# Itens com predHome ou predAway null são ignorados automaticamente
curl -sS -X POST http://localhost:8080/api/students/STUDENT_ID/predictions/batch \
  -H 'Content-Type: application/json' \
  -d '[
    {"matchId":"MATCH_ID_1","predHome":2,"predAway":1},
    {"matchId":"MATCH_ID_2","predHome":0,"predAway":0}
  ]'

# Salvar palpite individual (upsert)
curl -sS -X PUT http://localhost:8080/api/students/STUDENT_ID/predictions/MATCH_ID \
  -H 'Content-Type: application/json' \
  -d '{"predHome":2,"predAway":1}'
```

## Ranking

```bash
# Todos
curl -sS "http://localhost:8080/api/championships/CHAMPIONSHIP_ID/rankings"

# Filtrar por escola
curl -sS "http://localhost:8080/api/championships/CHAMPIONSHIP_ID/rankings?schoolId=SCHOOL_ID"

# Filtrar por série (e opcionalmente também por escola)
curl -sS "http://localhost:8080/api/championships/CHAMPIONSHIP_ID/rankings?serie=3%C2%BA%20ano"
curl -sS "http://localhost:8080/api/championships/CHAMPIONSHIP_ID/rankings?schoolId=SCHOOL_ID&serie=3%C2%BA%20ano"
```

## Fluxo mínimo (cole na ordem e troque os IDs)

```bash
BASE=http://localhost:8080/api

# 1) Campeonato
CURL_OUT=$(curl -sS -X POST "$BASE/championships" -H 'Content-Type: application/json' -d '{"name":"Teste"}')
echo "$CURL_OUT"
CID=$(echo "$CURL_OUT" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 2) Escola
CURL_OUT=$(curl -sS -X POST "$BASE/schools" -H 'Content-Type: application/json' -d '{"name":"Escola A"}')
echo "$CURL_OUT"
SID=$(echo "$CURL_OUT" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 3) Jogo
CURL_OUT=$(curl -sS -X POST "$BASE/championships/$CID/matches" -H 'Content-Type: application/json' -d '{"teamHome":"A","teamAway":"B"}')
echo "$CURL_OUT"
MID=$(echo "$CURL_OUT" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 4) Aluno
CURL_OUT=$(curl -sS -X POST "$BASE/championships/$CID/students" -H 'Content-Type: application/json' -d "{\"name\":\"João\",\"serie\":\"1\",\"schoolId\":\"$SID\"}")
echo "$CURL_OUT"
STID=$(echo "$CURL_OUT" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

# 5) Placar oficial
curl -sS -X PATCH "$BASE/matches/$MID/result" -H 'Content-Type: application/json' -d '{"scoreHome":1,"scoreAway":0}'

# 6) Palpite (igual ao oficial = 1 ponto)
curl -sS -X PUT "$BASE/students/$STID/predictions/$MID" -H 'Content-Type: application/json' -d '{"predHome":1,"predAway":0}'

# 7) Ranking
curl -sS "$BASE/championships/$CID/rankings"
```

Rodar o backend a partir da pasta do projeto:

```bash
cd api && mvn spring-boot:run
```
