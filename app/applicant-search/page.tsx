// app/applicant-search/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Applicant from "../../models/Applicant";

export default function ApplicantSearch() {
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
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Applicant Search</h1>
      <input
        type="text"
        placeholder="Search by name or major"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplicants.map((applicant) => (
          <div key={applicant._id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{applicant.name}</h2>
            <p>
              {applicant.major} - Year {applicant.year}
            </p>
            <input
              type="checkbox"
              checked={selectedApplicants.includes(applicant._id!)}
              onChange={() => handleSelectApplicant(applicant._id!)}
              className="mt-2"
            />
            <label className="ml-2">Select for note-taking</label>
          </div>
        ))}
      </div>
      {selectedApplicants.length >= 4 && selectedApplicants.length <= 6 && (
        <Link
          href={`/note-taking?ids=${selectedApplicants.join(",")}`}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Start Note-Taking
        </Link>
      )}
    </div>
  );
}
