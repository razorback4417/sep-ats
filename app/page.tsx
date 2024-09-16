"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Applicant {
  id: string;
  name?: string; // Make name optional
  major?: string; // Make major optional
  year?: string;
}

export default function Home() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredApplicants = applicants.filter(
    (applicant) =>
      (applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (applicant.major?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rush Applicant Tracker</h1>
      <input
        type="text"
        placeholder="Search applicants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className={`p-4 border rounded cursor-pointer ${
              selectedApplicants.includes(applicant.id) ? "bg-blue-100" : ""
            }`}
            onClick={() => handleApplicantSelect(applicant.id)}
          >
            <h2 className="font-bold">{applicant.name || "No Name"}</h2>
            <p>
              {applicant.major || "No Major"} - {applicant.year || "No Year"}
            </p>
          </div>
        ))}
      </div>
      {selectedApplicants.length >= 4 && selectedApplicants.length <= 6 && (
        <Link
          href={`/note-taking?ids=${selectedApplicants.join(",")}`}
          className="mt-4 bg-blue-500 text-white p-2 rounded inline-block"
        >
          Start Note-Taking
        </Link>
      )}
    </div>
  );
}
