"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

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
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div className="container mx-auto p-6 bg-gray-950 text-gray-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Rush Applicant Tracker</h1>
      <div className="relative mb-6" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full py-2 pl-9 pr-4 rounded-md border border-gray-700 bg-gray-800 text-gray-100 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          />
        </div>
        {isDropdownOpen && (
          <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-60 overflow-auto">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="p-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                onClick={() => handleSelectApplicant(applicant)}
              >
                {applicant.name} - {applicant.major} ({applicant.year})
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">Selected Applicants:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="rounded-lg border bg-gray-900 text-gray-100 shadow-sm transition-all duration-200 border-gray-800 hover:border-gray-700"
            >
              <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  {applicant.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {applicant.major} - {applicant.year}
                </p>
              </div>
              <div className="p-6 pt-0 flex justify-between items-center">
                <p className="text-sm text-gray-300">{applicant.email}</p>
                <button
                  onClick={() => handleRemoveApplicant(applicant.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedApplicants.length > 0 && (
        <Link
          href={`/note-taking?ids=${selectedApplicants.map((a) => a.id).join(",")}`}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Note-Taking
        </Link>
      )}
    </div>
  );
}