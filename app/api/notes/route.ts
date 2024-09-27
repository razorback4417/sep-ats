// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_NOTES_TABLE_NAME = "Notes";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_NOTES_TABLE_NAME}?filterByFormula=UserId%3D%22${session.user.id}%22`;

  try {
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
    return NextResponse.json(data.records);
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST request received");
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.log("User not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const newNotes = await request.json();
    console.log("Received notes:", newNotes);

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_NOTES_TABLE_NAME}`;
    console.log("Airtable URL:", url);

    const recordsToCreate = Object.entries(newNotes).map(
      ([applicantId, note]) => ({
        fields: {
          ApplicantId: applicantId,
          UserId: session.user.id,
          Notes: note,
          Timestamp: new Date().toISOString(),
        },
      })
    );
    console.log("Records to create:", recordsToCreate);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: recordsToCreate }),
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
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to add notes" },
      { status: 500 }
    );
  }
}
