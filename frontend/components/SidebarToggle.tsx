"use client";

import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { serverSidebarSnapshot, setSidebarCollapsed, sidebarSnapshot, subscribeSidebar } from "../lib/sidebar-state";

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribeSidebar, sidebarSnapshot, serverSidebarSnapshot);
  return { collapsed, toggle: () => setSidebarCollapsed(!collapsed) };
}

export default function SidebarToggle({ collapsed, onToggle, controls }: { collapsed: boolean; onToggle: () => void; controls: string }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return <button type="button" onClick={onToggle} aria-expanded={!collapsed} aria-controls={controls}
    aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"} title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-700 text-gray-300 transition hover:bg-gray-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
    <Icon size={19} aria-hidden="true" />
  </button>;
}
