// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_NOTES_TABLE_NAME = "Notes";

export async function GET() {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_NOTES_TABLE_NAME}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const notes = data.records.map(
      (record: {
        id: string;
        fields: { ApplicantId: string; Notes: string; Timestamp: string };
      }) => ({
        id: record.id,
        applicantId: record.fields.ApplicantId,
        notes: record.fields.Notes,
        timestamp: record.fields.Timestamp,
      })
    );

    return NextResponse.json(notes);
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const notes = await request.json();
    console.log("Received notes:", notes);

    const records = Object.entries(notes).map(([applicantId, note]) => ({
      fields: {
        ApplicantId: applicantId,
        Notes: note,
        Timestamp: new Date().toISOString(),
      },
    }));

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_NOTES_TABLE_NAME}`;
    console.log("Airtable URL:", url);

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
      throw new Error(
        `Airtable API responded with status: ${response.status}, body: ${errorData}`
      );
    }

    const data = await response.json();
    console.log("Airtable response:", data);

    return NextResponse.json({ message: "Notes added successfully", data });
  } catch (e: unknown) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to add notes" },
      { status: 500 }
    );
  }
}
