"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== "/login"; // hide header on login page

  return (
    <>
      {showHeader && <Header />}
      <main className="p-6">{children}</main>
    </>
  );
}