// app/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  fields: {
    ApplicantId: string;
    Notes: string;
    Timestamp: string;
  };
}

interface Applicant {
  id: string;
  name: string;
  major: string;
  year: string;
}

type Rating = "thumbsUp" | "neutral" | "thumbsDown";

interface GroupedNotes {
  [applicantId: string]: {
    applicant: Applicant;
    notes: Note[];
  };
}

export default function Cart() {
  const [groupedNotes, setGroupedNotes] = useState<GroupedNotes>({});
  // New state for ratings
  const [ratings, setRatings] = useState<{ [key: string]: Rating }>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/signin");
    } else {
      fetchNotesAndRatings();
    }
  }, [session, router]);

  // New function to fetch notes and ratings
  const fetchNotesAndRatings = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data: Note[] = await response.json();

      const applicantIds = [
        ...new Set(data.map((note) => note.fields.ApplicantId)),
      ];
      const applicantsResponse = await fetch(
        `/api/applicants?ids=${applicantIds.join(",")}`
      );
      if (!applicantsResponse.ok) {
        throw new Error("Failed to fetch applicants");
      }
      const applicantsData: Applicant[] = await applicantsResponse.json();

      const grouped: GroupedNotes = {};
      data.forEach((note) => {
        if (!grouped[note.fields.ApplicantId]) {
          const applicant = applicantsData.find(
            (a) => a.id === note.fields.ApplicantId
          );
          if (applicant) {
            grouped[note.fields.ApplicantId] = { applicant, notes: [] };
          }
        }
        if (grouped[note.fields.ApplicantId]) {
          grouped[note.fields.ApplicantId].notes.push(note);
        }
      });

      setGroupedNotes(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Updated handleRating function
  const handleRating = async (applicantId: string, rating: Rating) => {
    if (!session?.user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [applicantId]: rating }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`Failed to save rating: ${errorData}`);
      }

      const data = await response.json();
      console.log("Rating saved successfully:", data);

      // Update the local state to reflect the new rating
      setRatings((prevRatings) => ({
        ...prevRatings,
        [applicantId]: rating,
      }));
    } catch (error) {
      console.error("Error saving rating:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleCheckout = async () => {
    setCheckoutError(null);
    try {
      console.log("Ratings before conversion:", ratings);

      // Convert ratings object to array format expected by the API
      const ratingsArray = Object.entries(ratings).map(
        ([applicantId, rating]) => ({
          fields: {
            ApplicantId: applicantId,
            Rating: rating,
          },
        })
      );

      console.log("Ratings array being sent:", ratingsArray);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ratings: ratingsArray }),
      });

      const responseData = await response.json();
      console.log("Checkout API response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to checkout");
      }

      console.log(responseData.message);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during checkout:", error);
      setCheckoutError(
        error.message || "An unexpected error occurred during checkout"
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Notes Cart</h1>
      {Object.entries(groupedNotes).map(
        ([applicantId, { applicant, notes }]) => (
          <div key={applicantId} className="mb-4 p-4 bg-gray-800 rounded">
            <h2 className="text-xl font-bold text-white">{applicant.name}</h2>
            <p className="text-gray-300">
              {applicant.major} - {applicant.year}
            </p>
            {notes.map((note, index) => (
              <div key={note.id} className="mt-2">
                <p className="text-gray-300">{note.fields.Notes}</p>
                <p className="text-sm text-gray-400">
                  Noted on: {new Date(note.fields.Timestamp).toLocaleString()}
                </p>
                {index < notes.length - 1 && (
                  <hr className="my-2 border-gray-600" />
                )}
              </div>
            ))}
            <div className="mt-2">
              <button
                onClick={() => handleRating(applicantId, "thumbsUp")}
                className={`mr-2 p-2 rounded ${
                  ratings[applicantId] === "thumbsUp"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              >
                👍
              </button>
              <button
                onClick={() => handleRating(applicantId, "neutral")}
                className={`mr-2 p-2 rounded ${
                  ratings[applicantId] === "neutral"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              >
                😐
              </button>
              <button
                onClick={() => handleRating(applicantId, "thumbsDown")}
                className={`p-2 rounded ${
                  ratings[applicantId] === "thumbsDown"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              >
                👎
              </button>
            </div>
          </div>
        )
      )}

      {checkoutError && (
        <div className="mt-4 p-4 bg-red-500 text-white rounded">
          Error: {checkoutError}
        </div>
      )}

      <button
        onClick={handleCheckout}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        disabled={
          Object.keys(ratings).length !== Object.keys(groupedNotes).length
        }
      >
        Checkout
      </button>
      <Link
        href="/applicant-search"
        className="mt-4 ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-block"
      >
        Back to Applicant Search
      </Link>
    </div>
  );
}
