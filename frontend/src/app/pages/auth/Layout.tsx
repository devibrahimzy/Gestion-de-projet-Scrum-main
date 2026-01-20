import React, { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  bgColor?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  bgColor = "bg-gradient-to-br from-background via-background to-muted",
}) => {
  return (
    <div className={`h-screen w-screen ${bgColor} animate-fade-in`}>
      {children}
    </div>
  );
};

export default Layout;
