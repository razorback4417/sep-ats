"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Applicant {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
}

export default function ApplicantSearch() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApplicants();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectApplicant = (applicant: Applicant) => {
    if (!selectedApplicants.some((a) => a.id === applicant.id)) {
      setSelectedApplicants([...selectedApplicants, applicant]);
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveApplicant = (id: string) => {
    setSelectedApplicants(selectedApplicants.filter((a) => a.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">
        Rush Applicant Tracker
      </h1>
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search applicants..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full p-2 mb-2 border rounded bg-gray-800 text-white"
        />
        {isDropdownOpen && (
          <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-60 overflow-auto">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                onClick={() => handleSelectApplicant(applicant)}
              >
                {applicant.name} - {applicant.major} ({applicant.year})
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2 text-white">
          Selected Applicants:
        </h2>
        {selectedApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className="bg-gray-700 p-2 mb-2 rounded flex justify-between items-center"
          >
            <span className="text-white">
              {applicant.name} - {applicant.major} ({applicant.year})
            </span>
            <button
              onClick={() => handleRemoveApplicant(applicant.id)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {selectedApplicants.length > 0 && (
        <Link
          href={`/note-taking?ids=${selectedApplicants
            .map((a) => a.id)
            .join(",")}`}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-block"
        >
          Start Note-Taking
        </Link>
      )}
    </div>
  );
}
