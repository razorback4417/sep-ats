"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Applicant {
  _id: string;
  name: string;
  notes: string;
}

export default function Home() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/applicants");
      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }
      const data = await response.json();
      setApplicants(data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Rush Applicant Tracker</h1>
      <Link
        href="/add-applicant"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 inline-block"
      >
        Add New Applicant
      </Link>
      <div className="mt-6">
        {isLoading ? (
          <p className="text-gray-600">Loading applicants...</p>
        ) : applicants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applicants.map((applicant) => (
              <div
                key={applicant._id}
                className="border rounded-lg p-4 shadow-md"
              >
                <h2 className="text-xl font-semibold mb-2">{applicant.name}</h2>
                <p className="text-gray-600">{applicant.notes}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No applicants found. Add some to get started!
          </p>
        )}
      </div>
    </div>
  );
}
