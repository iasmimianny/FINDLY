# 🔎 Findly Frontend — Documentação

O **Findly** é uma plataforma de achados e perdidos desenvolvida para facilitar o cadastro, a localização e a recuperação de objetos, conectando usuários e pontos oficiais de coleta de maneira prática, segura e organizada.

Este diretório contém o **frontend da aplicação**, responsável pela interface, navegação, interação com os usuários e comunicação com a API do backend.

## 🛠️ 1. Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| Next.js | Framework React utilizado na aplicação web |
| React | Construção de interfaces e componentes |
| TypeScript | Tipagem estática e organização do código |
| Tailwind CSS | Estilização e responsividade |
| Lucide React | Biblioteca de ícones |
| ESLint | Padronização e análise do código |

## 📂 2. Estrutura de Diretórios

```text
frontend/
├── app/                  # Páginas e rotas da aplicação
├── components/           # Componentes reutilizáveis
├── lib/                  # Funções auxiliares e integrações
├── public/               # Arquivos estáticos
├── .gitignore
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

O projeto utiliza o **App Router** do Next.js, permitindo organizar as páginas e os layouts por meio da estrutura de diretórios.

## ⚙️ 3. Instalação e Execução

### Pré-requisitos

- Node.js instalado
- npm
- Git

### 3.1. Clonar o repositório

```bash
git clone https://github.com/iasmimianny/FINDLY.git
cd FINDLY/frontend
```

Esse comando clona o repositório completo do Findly e acessa a pasta do frontend.


### 3.2. Instalar as dependências

```bash
npm install
```

### 3.3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse a aplicação em:

**http://localhost:3000**

O Next.js atualiza automaticamente as páginas durante o desenvolvimento.

## 🧩 4. Organização da Aplicação

O frontend é organizado em três diretórios principais:

### `app/`

Responsável pelas páginas, rotas e layouts da aplicação.

### `components/`

Contém componentes reutilizáveis da interface, contribuindo para a padronização visual e a manutenção do código.

### `lib/`

Destinado às funções auxiliares, utilitários e recursos de integração utilizados pela aplicação.

## 🔗 5. Integração com o Backend

O frontend é desenvolvido separadamente do backend, mas ambos fazem parte do mesmo sistema.

A comunicação é realizada por meio de requisições HTTP à API REST desenvolvida com **Django e Django REST Framework**.

O backend é responsável pelo processamento das regras de negócio, autenticação, persistência de dados e gerenciamento dos objetos cadastrados.

A documentação específica está disponível em:

`../backend/README.md`

## 🎯 6. Funcionalidades do Sistema

O Findly contempla funcionalidades relacionadas ao gerenciamento de achados e perdidos, incluindo:

- Cadastro de objetos perdidos e encontrados.
- Cadastro preventivo de objetos com QR Code.
- Consulta e busca de objetos.
- Gerenciamento dos itens cadastrados.
- Histórico de objetos e devoluções.
- Pontos oficiais de coleta.
- Gerenciamento de informações e configurações do usuário.

As funcionalidades estão sujeitas às etapas de desenvolvimento e integração com o backend.

## 💻 7. Padrões de Desenvolvimento

Para manter a organização e facilitar a manutenção do frontend, são adotadas as seguintes práticas:

1. **Componentização:** reutilização de elementos de interface.
2. **Tipagem:** utilização de TypeScript para definir estruturas e propriedades.
3. **Responsividade:** adaptação das interfaces para diferentes tamanhos de tela.
4. **Organização:** separação entre páginas, componentes e funções auxiliares.
5. **Padronização:** utilização de ESLint para manter a consistência do código.

## 📚 8. Documentação Complementar

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide](https://lucide.dev/)

---

**Findly — Plataforma de Achados e Perdidos**

Projeto em desenvolvimento.