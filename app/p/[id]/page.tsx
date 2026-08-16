import { notFound } from "next/navigation";
import { DeletePageButton } from "@/components/delete-page-button";
import { prisma } from "@/lib/prisma";
import {
  findByIdWithBlocks,
  PageNotFoundError,
} from "@/lib/services/page-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

function previewBlockContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  const texts: string[] = [];

  function walk(node: unknown) {
    if (node === null || typeof node !== "object") {
      return;
    }

    const record = node as Record<string, unknown>;

    if (typeof record.text === "string") {
      texts.push(record.text);
    }

    if (Array.isArray(record.content)) {
      for (const child of record.content) {
        walk(child);
      }
    }
  }

  walk(content);

  if (texts.length > 0) {
    return texts.join("");
  }

  return JSON.stringify(content);
}

export default async function PageById({ params }: PageProps) {
  const { id } = await params;

  let page;

  try {
    page = await findByIdWithBlocks(prisma, id);
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
        <DeletePageButton pageId={page.id} />
      </div>
      <div className="flex flex-col gap-2">
        {page.blocks.map((block) => (
          <div
            key={block.id}
            className="border-b border-foreground/10 py-2 text-sm"
          >
            <span className="font-mono text-foreground/50">{block.type}</span>
            <p className="mt-1 text-foreground/80">
              {previewBlockContent(block.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
