import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";

export default function MainLayout() {
  const [headerConfig, setHeaderConfig] = useState({
    title: "Dashboard",
    showNewAction: false,
    onNewAction: null,
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header
          title={headerConfig.title}
          showNewAction={headerConfig.showNewAction}
          onNuevaAccion={headerConfig.onNewAction}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* 👇 pasamos setter a las páginas */}
          <Outlet context={{ setHeaderConfig }} />
        </main>
      </div>
    </div>
  );
}
