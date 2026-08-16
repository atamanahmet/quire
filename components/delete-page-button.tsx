"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePageResponse =
  | { data: { id: string } }
  | { error: { message: string; code?: string } };

type DeletePageButtonProps = {
  pageId: string;
};

export function DeletePageButton({ pageId }: DeletePageButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm(
      "Delete this page? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      });

      const body = (await response.json()) as DeletePageResponse;

      if (!response.ok || !("data" in body)) {
        const message =
          "error" in body ? body.error.message : "Failed to delete page";
        setErrorMessage(message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Failed to delete page");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded px-2 py-1 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {errorMessage !== null ? (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
