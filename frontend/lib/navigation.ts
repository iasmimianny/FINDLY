export type NavigationArea = "user" | "staff";
export function accountLinks(area: NavigationArea) {
  return area === "staff"
    ? { home: "/funcionario/painel", profile: "/funcionario/perfil", settings: "/funcionario/configuracao", help: "/funcionario/faq", notifications: "/funcionario/notificacoes" }
    : { home: "/dashboard", profile: "/perfil", settings: "/configuracao", help: "/faq", notifications: "/notificacoes" };
}
export function isActiveNavigation(pathname: string, href: string) { return pathname === href || pathname.startsWith(`${href}/`); }
export function staffAccountRedirect(pathname: string, role: string) {
  if (role !== "operator" && role !== "admin") return null;
  const routes: Record<string, string> = { "/dashboard": "/funcionario/painel", "/perfil": "/funcionario/perfil", "/configuracao": "/funcionario/configuracao", "/faq": "/funcionario/faq", "/notificacoes": "/funcionario/notificacoes" };
  return routes[pathname.replace(/\/$/, "")] ?? null;
}
export const navigationMenus = {
  user: [
    { label: "Início", href: "/dashboard", icon: "House", color: "text-cyan-400" },
    { label: "Mural", href: "/itens-perdidos", icon: "PanelsTopLeft", color: "text-red-400" },
    { label: "Minhas solicitações", href: "/minhas-solicitacoes", icon: "Handshake", color: "text-blue-400" },
    { label: "Meus itens", href: "/meus-itens", icon: "Package", color: "text-purple-400" },
    { label: "Pontos de coleta", href: "/pontos-coleta", icon: "MapPin", color: "text-blue-400" },
  ],
  staff: [
    { label: "Visão geral", href: "/funcionario/painel", icon: "House", color: "text-cyan-400" },
    { label: "Receber item", href: "/funcionario/recebimento", icon: "PlusCircle", color: "text-cyan-400" },
    { label: "Inventário", href: "/funcionario/inventario", icon: "Package", color: "text-purple-400" },
    { label: "Devoluções", href: "/funcionario/devolucoes", icon: "Handshake", color: "text-blue-400" },
    { label: "Histórico", href: "/funcionario/historico", icon: "History", color: "text-amber-400" },
    { label: "Pontos de coleta", href: "/funcionario/pontos-coleta", icon: "MapPin", color: "text-blue-400" },
  ],
} as const;
