'use client';

import {useState, FormEvent} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CreatePartyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const { data: session, status } = useSession();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const userId = session?.user?.id;

    if (!name) {
      setError("Party name is required");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, createdById: Number(userId) }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to create party");
      return;
    }

    const body = await res.json();
    router.push(`/party/${body.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Enter a party name"
        className="border p-2 rounded w-full"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        className="block rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}