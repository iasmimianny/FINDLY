import Sidebar from "./Sidebar";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="min-h-screen bg-gray-50 md:ml-64">
        {children}
      </main>
    </div>
  );
}