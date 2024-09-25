// app/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Note {
  id: string;
  applicantId: string;
  notes: string;
  timestamp: string;
}

interface Applicant {
  id: string;
  name: string;
  major: string;
  year: string;
}

export default function Cart() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [applicants, setApplicants] = useState<{ [key: string]: Applicant }>(
    {}
  );

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);

      // Fetch applicant details for each unique applicantId
      const uniqueApplicantIds = [
        ...new Set(data.map((note) => note.applicantId)),
      ];
      const applicantsResponse = await fetch(
        `/api/applicants?ids=${uniqueApplicantIds.join(",")}`
      );
      if (!applicantsResponse.ok) {
        throw new Error("Failed to fetch applicants");
      }
      const applicantsData = await applicantsResponse.json();
      const applicantsMap = applicantsData.reduce((acc, applicant) => {
        acc[applicant.id] = applicant;
        return acc;
      }, {});
      setApplicants(applicantsMap);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Notes Cart</h1>
      {notes.map((note) => (
        <div key={note.id} className="mb-4 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold text-white">
            {applicants[note.applicantId]?.name || "Unknown Applicant"}
          </h2>
          <p className="text-gray-300">{note.notes}</p>
          <p className="text-sm text-gray-400 mt-2">
            Noted on: {new Date(note.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
      <Link
        href="/applicant-search"
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
      >
        Back to Applicant Search
      </Link>
    </div>
  );
}
