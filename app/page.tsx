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
      <h1 className="text-2xl font-bold mb-4">Rush Applicant Tracker</h1>
      <Link
        href="/add-applicant"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add New Applicant
      </Link>
      <div className="mt-4">
        {isLoading ? (
          <p>Loading applicants...</p>
        ) : applicants.length > 0 ? (
          applicants.map((applicant) => (
            <div key={applicant._id} className="border p-2 mb-2">
              <h2 className="font-bold">{applicant.name}</h2>
              <p>{applicant.notes}</p>
            </div>
          ))
        ) : (
          <p>No applicants found.</p>
        )}
      </div>
    </div>
  );
}
