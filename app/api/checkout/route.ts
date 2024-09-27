// app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_RATINGS_TABLE_NAME = "ratings";

export async function POST(request: NextRequest) {
  console.log("Checkout POST request received");

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("User not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { ratings } = await request.json();
    console.log("Received ratings:", JSON.stringify(ratings, null, 2));

    if (!Array.isArray(ratings)) {
      return NextResponse.json(
        { error: "Invalid ratings format" },
        { status: 400 }
      );
    }

    const records = ratings.map((rating) => ({
      fields: {
        ApplicantId: rating.fields.ApplicantId,
        UserId: session.user.id,
        Rating: rating.fields.Rating, // Ensure this matches Airtable's options
        Timestamp: new Date().toISOString(),
      },
    }));

    console.log("Records to create:", JSON.stringify(records, null, 2));

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_RATINGS_TABLE_NAME}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Airtable API error:", errorData);
      return NextResponse.json(
        { error: `Failed to save ratings: ${errorData}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Airtable response:", JSON.stringify(result, null, 2));

    return NextResponse.json({ message: "Checkout successful" });
  } catch (e) {
    console.error("Checkout Error:", e);
    return NextResponse.json(
      { error: e.message || "An unexpected error occurred during checkout" },
      { status: 500 }
    );
  }
}
