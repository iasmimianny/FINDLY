import Sidebar from "./Sidebar";
import UserHeader from "../../../components/UserHeader";
import type { ReactNode } from "react";

export default function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-black font-sans">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-gray-900">
        <UserHeader />

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
}