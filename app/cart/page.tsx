// app/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Note {
  _id: string;
  applicantIds: string[];
  content: string;
}

export default function Cart() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchNotes();
    }
  }, [status, router]);

  const fetchNotes = async () => {
    // Implement logic to fetch notes from your backend
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
  };

  const handleRemove = async (noteId: string) => {
    // Implement logic to remove a note from the cart
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setNotes(notes.filter((note) => note._id !== noteId));
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Notes Cart</h1>
      {notes.map((note) => (
        <div key={note._id} className="border p-4 rounded shadow mb-4">
          <p className="mb-2">{note.content.substring(0, 100)}...</p>
          <button
            onClick={() => handleRemove(note._id)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleProceedToCheckout}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
