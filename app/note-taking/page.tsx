// app/note-taking/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Applicant {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
}

export default function NoteTaking() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await fetch("/api/applicants");
      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleApplicantSelect = (id: string) => {
    setSelectedApplicants((prev) => {
      if (prev.includes(id)) {
        return prev.filter((appId) => appId !== id);
      } else if (prev.length < 6) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (selectedApplicants.length < 4 || selectedApplicants.length > 6) {
      alert("Please select 4-6 applicants");
      return;
    }
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantIds: selectedApplicants,
          notes,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to save notes");
      }
      router.push("/cart");
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Applicant Selection and Note-Taking
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className={`p-4 border rounded ${
              selectedApplicants.includes(applicant.id) ? "bg-blue-100" : ""
            }`}
            onClick={() => handleApplicantSelect(applicant.id)}
          >
            <h2 className="font-bold">{applicant.name}</h2>
            <p>
              {applicant.major} - {applicant.year}
            </p>
            <p>{applicant.email}</p>
          </div>
        ))}
      </div>
      <p className="mb-2">Selected: {selectedApplicants.length}/6</p>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={10}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter your notes here..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
        disabled={
          selectedApplicants.length < 4 || selectedApplicants.length > 6
        }
      >
        Add Notes to Cart
      </button>
    </div>
  );
}
