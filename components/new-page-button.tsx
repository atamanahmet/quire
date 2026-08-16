"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatePageResponse =
  | { data: { id: string } }
  | { error: { message: string; code?: string } };

export function NewPageButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled" }),
      });

      const body = (await response.json()) as CreatePageResponse;

      if (!response.ok || !("data" in body)) {
        const message =
          "error" in body ? body.error.message : "Failed to create page";
        setErrorMessage(message);
        return;
      }

      router.push(`/p/${body.data.id}`);
      router.refresh();
    } catch {
      setErrorMessage("Failed to create page");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded px-2 py-1.5 text-left text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating…" : "New Page"}
      </button>
      {errorMessage !== null ? (
        <p className="px-2 text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
