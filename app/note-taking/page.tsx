"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Applicant {
  id: string;
  name: string;
  major: string;
  year: string;
}

export default function NoteTaking() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [notes, setNotes] = useState("");
  const searchParams = useSearchParams();
  const applicantIds = searchParams.get("ids")?.split(",") || [];
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await fetch(
        `/api/applicants?ids=${applicantIds.join(",")}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const insertApplicantMention = (applicant: Applicant) => {
    const mention = `@${applicant.name} `;
    const textarea = textAreaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      setNotes(before + mention + after);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + mention.length;
    }
  };

  const handleAddToCart = async () => {
    const applicantNotes = {};
    applicants.forEach((applicant) => {
      const regex = new RegExp(`@${applicant.name}([^@]*)`, "g");
      const matches = notes.match(regex);
      if (matches) {
        applicantNotes[applicant.id] = matches
          .map((match) => match.replace(`@${applicant.name}`, "").trim())
          .join(" ");
      }
    });

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicantNotes),
      });

      if (!response.ok) {
        throw new Error("Failed to save notes");
      }

      router.push("/cart"); // Redirect to cart page after saving
    } catch (error) {
      console.error("Error saving notes:", error);
      // Here you might want to show an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">
        Group Discussion Notes
      </h1>
      <div className="flex mb-4">
        {applicants.map((applicant) => (
          <button
            key={applicant.id}
            onClick={() => insertApplicantMention(applicant)}
            className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            @{applicant.name}
          </button>
        ))}
      </div>
      <textarea
        ref={textAreaRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full p-4 min-h-[400px] bg-gray-800 text-white border rounded"
        placeholder="Enter your group discussion notes here. Use the buttons above to mention specific applicants."
      />
      <button
        onClick={handleAddToCart}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}
