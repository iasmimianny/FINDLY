
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ========================================
// TIPOS DO CADASTRO
// ========================================

export type CadastroDados = {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirm: string;
};

export type CadastroResposta = {
  detail: string;
  user: {
    id: string | number;
    email: string;
    full_name: string;
  };
};

// ========================================
// TIPOS DO LOGIN
// ========================================

export type LoginDados = {
  email: string;
  password: string;
};

export type LoginResposta = {
  detail: string;
  user: {
    id: string | number;
    email: string;
    full_name: string;
    role?: string;
  };
};

// ========================================
// TRATAMENTO DE ERROS
// ========================================

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string | string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ========================================
// CADASTRO
// ========================================

export async function cadastrarUsuario(
  dados: CadastroDados
): Promise<CadastroResposta> {
  const resposta = await fetch(`${API_URL}/api/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      typeof resultado.detail === "string"
        ? resultado.detail
        : "Não foi possível realizar o cadastro.";

    throw new ApiError(mensagem, resposta.status, resultado);
  }

  return resultado as CadastroResposta;
}

// ========================================
// LOGIN COM COOKIES HTTPONLY
// ========================================

export async function loginUsuario(
  dados: LoginDados
): Promise<LoginResposta> {
  const resposta = await fetch("/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
    credentials: "same-origin",
    cache: "no-store",
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      typeof resultado.detail === "string"
        ? resultado.detail
        : "Não foi possível realizar o login.";

    throw new ApiError(mensagem, resposta.status, resultado);
  }

  return resultado as LoginResposta;
}
