# ScoreCast

Aplicação desktop local para gerenciar campeonatos, palpites e ranking de alunos. Roda inteiramente na máquina do usuário — sem necessidade de internet, servidor externo ou instalação de Java/Node.

**Stack:** React + Vite (frontend) · Spring Boot + H2 (backend) · empacotado em um único executável.

---

## Como gerar o executável

O build é feito automaticamente pelo **GitHub Actions** ao criar uma tag no repositório. Não é necessário ter Java ou Node instalados localmente para gerar o build.

### Pré-requisitos

- Conta no GitHub com o repositório clonado/forkado
- Git instalado na sua máquina de desenvolvimento

### Passo a passo

#### 1. Faça commit e push de todas as suas alterações

```bash
git add .
git commit -m "versão final"
git push origin main
```

#### 2. Crie uma tag para disparar o build

**Para Linux (gera um `.jar` executável):**
```bash
git tag linux-v1.0.0
git push origin linux-v1.0.0
```

**Para Windows (gera um `.exe` instalador):**
```bash
git tag win-v1.0.0
git push origin win-v1.0.0
```

> Você pode usar qualquer número de versão, ex: `linux-v1.0.1`, `win-v2.0.0`.

#### 3. Acompanhe o build

1. Acesse seu repositório no GitHub
2. Clique na aba **Actions**
3. Aguarde o workflow terminar (geralmente 3–5 minutos)

#### 4. Baixe o executável

1. No GitHub, clique na aba **Releases** (ou acesse `github.com/SEU_USUARIO/score-cast/releases`)
2. Encontre a release com a tag que você criou
3. Baixe o arquivo (`.jar` para Linux, `.exe` para Windows)

---

## Como rodar

### Linux (`.jar`)

O `.jar` já inclui o Java embutido — não precisa instalar nada.

```bash
java -jar scorecast-api-0.0.1-SNAPSHOT.jar
```

> Se a máquina não tiver Java, use o build Windows que gera um `.exe` com tudo embutido.

### Windows (`.exe`)

Execute o instalador `.exe`. Ele instala o ScoreCast com Java embutido e cria atalho no menu Iniciar.

Após instalar, abra o **ScoreCast** pelo menu Iniciar. O aplicativo abrirá automaticamente no navegador em `http://localhost:8080/api`.

---

## Dados

O banco de dados fica salvo em `./data/scorecast.mv.db` na pasta onde o app roda. Os dados persistem entre execuções. Para resetar, basta apagar esse arquivo.

---

## Desenvolvimento local

### Requisitos

- Java 21
- Node.js 20+
- Maven

### Rodando o backend

```bash
cd api
mvn spring-boot:run
```

### Rodando o frontend

```bash
cd web
npm install
npm run dev
```

O frontend estará em `http://localhost:5173` e se comunicará com o backend em `http://localhost:8080/api`.

---

## URL da aplicação

A aplicação (frontend + backend) fica disponível em:

- **Desenvolvimento:** `http://localhost:8080/api`
- **Produção (Linux):** `http://localhost:8080/api`
- **Produção (Windows):** `http://localhost:8080/api`

---

## Sobre o GitHub Actions

Os workflows usam a infraestrutura do GitHub para compilar o projeto. Qualquer pessoa que clonar o repositório pode gerar seu próprio build criando uma tag — o processo usa os minutos de Actions da conta de quem disparou o build, não do dono original do repositório.
