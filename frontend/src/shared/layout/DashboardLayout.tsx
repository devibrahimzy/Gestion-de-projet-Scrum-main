import React from "react";
import { Outlet } from "react-router-dom";
import { AppTopbar } from "./AppTopbar";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";

export const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        
        <SidebarInset>
          <AppTopbar />
          <main className="">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
