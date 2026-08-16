"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarPage = {
  id: string;
  title: string;
};

type SidebarPageListProps = {
  pages: SidebarPage[];
};

export function SidebarPageList({ pages }: SidebarPageListProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-2" aria-label="Pages">
      {pages.map((page) => {
        const href = `/p/${page.id}`;
        const isActive = pathname === href;

        return (
          <Link
            key={page.id}
            href={href}
            className={
              isActive
                ? "rounded px-2 py-1.5 text-sm bg-foreground/10 font-medium"
                : "rounded px-2 py-1.5 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
            }
          >
            {page.title}
          </Link>
        );
      })}
    </nav>
  );
}
