# 🔎 Findly — Plataforma de Achados e Perdidos

O **Findly** é uma plataforma web de achados e perdidos desenvolvida para facilitar o cadastro, a localização e a recuperação de objetos.

O sistema busca conectar pessoas que perderam pertences, pessoas que encontraram objetos e pontos oficiais de coleta, oferecendo uma experiência prática, segura e organizada.

## 🎯 Objetivo

Centralizar o gerenciamento de achados e perdidos, proporcionando maior segurança, rastreabilidade e praticidade durante os processos de registro, busca e devolução de objetos.

## ✨ Funcionalidades

O Findly contempla as seguintes funcionalidades, em diferentes etapas de desenvolvimento:

- **Cadastro de objetos:** registro de itens perdidos, encontrados ou cadastrados preventivamente.
- **QR Code:** identificação de objetos por meio de códigos que podem ser impressos e fixados nos pertences.
- **Busca de objetos:** consulta de itens registrados na plataforma.
- **Gerenciamento de itens:** acompanhamento dos objetos vinculados ao usuário.
- **Pontos de coleta:** integração com locais oficiais de entrega e retirada.
- **Histórico:** acompanhamento dos registros e devoluções.
- **Autenticação:** controle de acesso e gerenciamento de usuários.
- **Notificações:** comunicação sobre atualizações relacionadas aos objetos.

## 🛠️ Tecnologias Utilizadas

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Docker e Docker Compose

## 📂 Estrutura do Repositório

O Findly utiliza uma organização **monorepo**, mantendo frontend e backend no mesmo repositório, com estruturas e dependências independentes.

```text
FINDLY/
├── backend/              # API e regras de negócio
│   ├── src/
│   ├── docker/
│   ├── docs/
│   ├── postman/
│   ├── manage.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/             # Interface web
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── README.md             # Documentação principal
```

## ⚙️ Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/iasmimianny/FINDLY.git
cd FINDLY
```

### 2. Executar o backend

Acesse a pasta do backend:

```bash
cd backend
```

Configure as variáveis de ambiente conforme o arquivo `.env.example` e siga as instruções de execução com Docker disponíveis na documentação do backend.

### 3. Executar o frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

Acesse:

**http://localhost:3000**

Para utilizar as funcionalidades integradas, o backend também deve estar configurado e em execução.

## 📚 Documentação

Cada aplicação possui sua própria documentação técnica:

- [📘 Documentação do Frontend](./frontend/README.md)
- [📗 Documentação do Backend](./backend/README.md)

## 🔐 Segurança

O Findly tem como princípios a proteção dos dados dos usuários, a validação da propriedade dos objetos e a rastreabilidade dos processos de custódia e devolução.

## 🚧 Status do Projeto

**Em desenvolvimento.**

O projeto está em processo de implementação, integração e aprimoramento de suas funcionalidades.

---

**Findly — Seus pertences, mais seguros e fáceis de encontrar.**
