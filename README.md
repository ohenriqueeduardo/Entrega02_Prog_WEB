# 📰 Sistema de Notícias (CLI em TypeScript)

## 📌 Descrição

Este projeto implementa um sistema completo de gerenciamento de notícias via **linha de comando (CLI)**, desenvolvido em **TypeScript** e utilizando **SQLite** como banco de dados local.

O sistema permite cadastrar, consultar e organizar notícias por **estado (UF)** e **cidade**, com navegação interativa no terminal.

---

## 🛠️ Tecnologias Utilizadas

* Node.js
* TypeScript
* SQLite
* Drizzle ORM
* better-sqlite3
* readline (CLI)

---

## 📁 Estrutura do Projeto

```bash
src/
 ├── db/
 │    ├── index.ts        # Conexão com banco
 │    └── setup.ts        # Criação das tabelas
 │
 ├── services/            # Backend (regras de negócio)
 │    ├── ufService.ts
 │    ├── cidadeService.ts
 │    └── noticiaService.ts
 │
 ├── cli/
 │    ├── menu.ts         # Fluxos do sistema (telas e lógica CLI)
 │    └── prompts.ts      # Entrada de dados (readline)
 │
 ├── index.ts             # Loop principal do sistema (entrypoint)

```

---

## 🧠 Arquitetura do Sistema

O sistema segue uma separação clara em camadas:

### 🔹 Banco (`db/`)

* Conexão com SQLite
* Criação das tabelas

---

### 🔹 Services (`services/`)

Responsável por toda a lógica:

* Inserção de dados
* Consultas com JOIN
* Filtros e ordenações

---

### 🔹 CLI (`cli/`)

Divide-se em duas partes:

#### 📄 `prompts.ts`

* Gerencia entrada do usuário (`readline`)
* Funções:

  * `perguntar()`
  * `pedirTextoObrigatorio()`
  * `selecionarDaLista()`
* Faz validação de entrada

---

#### 📄 `menu.ts`

Responsável por TODOS os fluxos do sistema:

* Cadastro de UF
* Cadastro de cidade
* Cadastro de notícia
* Listagem de notícias
* Filtro por estado
* Agrupamento por estado
* Detalhamento de notícia

Também contém:

* formatação de saída
* controle de navegação (detalhar, voltar, etc.)

---

### 🔹 `index.ts` (Entry Point)

Controla o loop principal do sistema:

* Exibe menu
* Lê opção do usuário
* Chama os fluxos do `menu.ts`
* Mantém o sistema rodando até o usuário sair

---

## 🗄️ Banco de Dados

### Tabela: `uf`

* id
* nome
* sigla

---

### Tabela: `cidade`

* id
* nome
* uf_id (FK)

---

### Tabela: `noticia`

* id
* titulo
* texto
* cidade_id (FK)
* data_criacao (automática)

---

## ⚙️ Como Executar o Projeto

### 1️⃣ Instalar dependências

```bash
npm install
```

---

### 2️⃣ Criar o banco de dados

```bash
npm run setup
```

✔️ Cria:

* arquivo `.db`
* tabelas automaticamente

---

### 3️⃣ Executar o sistema CLI

```bash
npx ts-node src/index.ts
```

---

### 4️⃣ (Opcional) Testar backend

```bash
npm run dev
```

---

## 🖥️ Funcionalidades do Sistema

### 📌 Menu principal

```text
[0] Cadastrar notícia
[1] Listar notícias (recentes primeiro)
[2] Listar notícias (antigas primeiro)
[3] Notícias por estado
[4] Agrupadas por estado
[5] Cadastrar UF
[6] Cadastrar cidade
[7] Sair
```

---

## 🔁 Fluxos do Sistema

### ✔️ Cadastro de UF

* Nome
* Sigla (convertida para maiúscula)

---

### ✔️ Cadastro de Cidade

* Nome
* Seleção de UF (lista interativa)

---

### ✔️ Cadastro de Notícia

* Título
* Texto
* Seleção de cidade

---

### ✔️ Listagem de Notícias

* Ordenação:

  * Mais recentes
  * Mais antigas
* Exibe:

  * título
  * cidade
  * data

---

### ✔️ Detalhamento de Notícia

* Seleção via lista
* Exibe:

  * título
  * cidade
  * data
  * texto completo formatado

---

### ✔️ Notícias por Estado

* Seleção de UF
* Lista notícias vinculadas

---

### ✔️ Agrupamento por Estado

* Agrupa por sigla da UF
* Exibição organizada

---

## ⚠️ Regras do Sistema

* Não é possível:

  * criar cidade sem UF
  * criar notícia sem cidade
* Listas são numeradas (não correspondem ao ID do banco)

---

## 🚨 Possíveis Problemas

### ❌ Erro com better-sqlite3

✔️ Use Node 20 LTS

---

### ❌ “no such table”

✔️ Execute:

```bash
npm run setup
```

---

### ❌ Erros de tipagem (unknown)

✔️ Resolvido com `as Tipo[]`

---

## 👥 Divisão do Projeto

### 🧑‍💻 Backend

* Banco de dados
* Services
* Queries SQL

---

### 🧑‍💻 CLI

* Interface
* Fluxos
* Interação com usuário

---

## 🎯 Conclusão

O sistema implementa um CRUD completo com:

* relacionamento entre tabelas
* interface interativa em terminal
* arquitetura modular
* separação clara de responsabilidades

---

## 🚀 Possíveis Melhorias

* Interface web
* API REST
* Paginação
* Validação avançada

---

## 📊 Status

✔️ Sistema funcional
✔️ CLI completo
✔️ Banco integrado
✔️ Fluxos implementados

---

## 📄 Licença

Projeto acadêmico.
