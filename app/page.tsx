"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Applicant {
  id: string;
  name?: string;
  email?: string;
  major?: string;
  year?: string;
}

export default function Home() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

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
      console.log("Fetched applicants:", data);
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const nameMatch =
      applicant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const majorMatch =
      applicant.major?.toLowerCase().includes(searchTerm.toLowerCase()) ??
      false;
    return nameMatch || majorMatch;
  });

  console.log("Filtered applicants:", filteredApplicants);

  // ... rest of your component code

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
            onClick={() => toggleApplicantSelection(applicant.id)}
          >
            <h2 className="font-bold">{applicant.name || "No Name"}</h2>
            <p>
              {applicant.major || "No Major"} - {applicant.year || "No Year"}
            </p>
            <p>{applicant.email || "No Email"}</p>
          </div>
        ))}
      </div>
      {/* ... rest of your JSX */}
    </div>
  );
}
