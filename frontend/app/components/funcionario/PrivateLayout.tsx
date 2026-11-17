"use client";

import Sidebar from "./Sidebar";
import { useSidebarCollapsed } from "../../../components/SidebarToggle";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const { collapsed } = useSidebarCollapsed();
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className={`findly-sidebar-content min-h-screen min-w-0 bg-gray-50 transition-[margin-left] duration-200 motion-reduce:transition-none ${collapsed ? "ml-20" : "ml-64"}`}>
        {children}
      </div>
    </div>
  );
}
