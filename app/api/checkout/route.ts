import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_RATINGS_TABLE_NAME = "ratings"; // Create this table in Airtable

export async function POST(request: NextRequest) {
  try {
    const ratings = await request.json();

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_RATINGS_TABLE_NAME}`;

    const records = Object.entries(ratings).map(([applicantId, rating]) => ({
      fields: {
        ApplicantId: applicantId,
        Rating: rating,
        Timestamp: new Date().toISOString(),
      },
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save ratings: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Checkout successful" });
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to checkout" },
      { status: 500 }
    );
  }
}
