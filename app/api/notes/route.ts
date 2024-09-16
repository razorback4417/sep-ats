// app/api/notes/route.ts

import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

export async function POST(request: Request) {
  try {
    const { applicantIds, notes } = await request.json();

    const result = await base("Notes").create({
      ApplicantIds: applicantIds.join(","),
      Notes: notes,
      Timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Notes added successfully",
      id: result.id,
    });
  } catch (error) {
    console.error("Error saving notes:", error);
    return NextResponse.json(
      { error: "Failed to save notes" },
      { status: 500 }
    );
  }
}
