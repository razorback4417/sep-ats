// app/note-taking/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Applicant from "../../models/Applicant";

export default function NoteTaking() {
  const searchParams = useSearchParams();
  const applicantIds = searchParams.get("ids")?.split(",") || [];
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const promises = applicantIds.map((id) =>
        fetch(`/api/applicants/${id}`).then((res) => res.json())
      );
      const fetchedApplicants = await Promise.all(promises);
      setApplicants(fetchedApplicants);
      // Initialize notes state
      const initialNotes = fetchedApplicants.reduce((acc, applicant) => {
        acc[applicant._id!] = "";
        return acc;
      }, {});
      setNotes(initialNotes);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      const promises = Object.entries(notes).map(([id, content]) =>
        fetch(`/api/applicants/${id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
      );
      await Promise.all(promises);
      // Redirect to cart or confirmation page
    } catch (error) {
      console.error("Error submitting notes:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Note-Taking Session</h1>
      {applicants.map((applicant) => (
        <div key={applicant._id} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold">{applicant.name}</h2>
          <p>
            {applicant.major} - Year {applicant.year}
          </p>
          <img
            src={applicant.profilePhotoUrl}
            alt={applicant.name}
            className="w-32 h-32 object-cover mt-2"
          />
          <div className="mt-2">
            <a
              href={applicant.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Resume
            </a>
            {" | "}
            <a
              href={applicant.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              Portfolio
            </a>
          </div>
          <textarea
            value={notes[applicant._id!] || ""}
            onChange={(e) => handleNoteChange(applicant._id!, e.target.value)}
            className="w-full h-32 mt-2 p-2 border rounded"
            placeholder="Enter notes here..."
          />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Add Notes to Cart
      </button>
    </div>
  );
}
