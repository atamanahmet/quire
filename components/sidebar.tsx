import { prisma } from "@/lib/prisma";
import { findAll } from "@/lib/services/page-service";
import { NewPageButton } from "@/components/new-page-button";
import { SidebarPageList } from "@/components/sidebar-page-list";

export async function Sidebar() {
  const pages = await findAll(prisma);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-foreground/10">
      <NewPageButton />
      {pages.length === 0 ? (
        <p className="px-3 py-2 text-sm text-foreground/50">No pages yet</p>
      ) : (
        <SidebarPageList
          pages={pages.map((page) => ({
            id: page.id,
            title: page.title,
          }))}
        />
      )}
    </aside>
  );
}
