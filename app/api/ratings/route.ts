import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_RATINGS_TABLE_NAME = process.env.AIRTABLE_RATINGS_TABLE_NAME;

export async function POST(request: NextRequest) {
  console.log("POST request received for ratings");
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.log("User not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const newRatings = await request.json();
    console.log("Received ratings:", newRatings);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_RATINGS_TABLE_NAME}`;

    for (const [applicantId, rating] of Object.entries(newRatings)) {
      // Step 1: Fetch existing rating for this applicant and user
      const existingRatingResponse = await fetch(
        `${url}?filterByFormula=${encodeURIComponent(
          `AND({ApplicantId}='${applicantId}', {UserId}='${session.user.id}')`
        )}`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!existingRatingResponse.ok) {
        throw new Error(
          `Failed to fetch existing rating: ${existingRatingResponse.status}`
        );
      }

      const existingRatingData = await existingRatingResponse.json();

      if (existingRatingData.records.length > 0) {
        // Update existing rating
        const updateResponse = await fetch(
          `${url}/${existingRatingData.records[0].id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${AIRTABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                Rating: rating,
              },
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.text();
          console.error("Airtable API error response (update):", errorBody);
          throw new Error(
            `Failed to update rating: ${updateResponse.status}. Error: ${errorBody}`
          );
        }
      } else {
        // Create new rating
        const createResponse = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  ApplicantId: applicantId,
                  UserId: session.user.id,
                  Rating: rating,
                },
              },
            ],
          }),
        });

        if (!createResponse.ok) {
          const errorBody = await createResponse.text();
          console.error("Airtable API error response (create):", errorBody);
          throw new Error(
            `Failed to create new rating: ${createResponse.status}. Error: ${errorBody}`
          );
        }
      }
    }

    return NextResponse.json({ message: "Ratings updated successfully" });
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to update ratings" },
      { status: 500 }
    );
  }
}
