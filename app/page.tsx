"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

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

  const toggleApplicantSelection = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto p-6 bg-gray-950 text-gray-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Rush Applicant Tracker</h1>
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-9 pr-4 rounded-md border border-gray-700 bg-gray-800 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className={`rounded-lg border bg-gray-900 text-gray-100 shadow-sm transition-all duration-200 ${
              selectedApplicants.includes(applicant.id)
                ? "border-gray-700 bg-gray-800"
                : "border-gray-800"
            } hover:border-gray-700`}
            onClick={() => toggleApplicantSelection(applicant.id)}
          >
            <div className="p-6 flex flex-col space-y-1.5">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {applicant.name || "No Name"}
              </h3>
              <p className="text-sm text-gray-400">
                {applicant.major || "No Major"} - {applicant.year || "No Year"}
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-gray-300">{applicant.email || "No Email"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}