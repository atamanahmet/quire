import { notFound } from "next/navigation";
import { DeletePageButton } from "@/components/delete-page-button";
import { PageBlocks } from "@/components/page-blocks";
import { prisma } from "@/lib/prisma";
import {
  findByIdWithBlocks,
  PageNotFoundError,
} from "@/lib/services/page-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

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
      <PageBlocks blocks={page.blocks} />
    </div>
  );
}
