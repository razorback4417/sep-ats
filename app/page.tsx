"use client";

import { useState } from "react";
import Link from "next/link";

interface Applicant {
  name: string;
  notes: string;
}

export default function Home() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);

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
        {applicants.map((applicant, index) => (
          <div key={index} className="border p-2 mb-2">
            <h2 className="font-bold">{applicant.name}</h2>
            <p>{applicant.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
