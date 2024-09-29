// app/api/notes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_NOTES_TABLE_NAME = process.env.AIRTABLE_NOTES_TABLE_NAME;

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

    // Fetch existing notes
    const existingNotesResponse = await fetch(
      `${url}?filterByFormula=${encodeURIComponent(
        `OR(${Object.keys(newNotes)
          .map((id) => `{ApplicantId}='${id}'`)
          .join(",")})`
      )}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!existingNotesResponse.ok) {
      throw new Error(
        `Failed to fetch existing notes: ${existingNotesResponse.status}`
      );
    }

    const existingNotesData = await existingNotesResponse.json();
    const existingNotes = existingNotesData.records.reduce((acc, record) => {
      acc[record.fields.ApplicantId] = record;
      return acc;
    }, {});

    const recordsToUpdate = [];
    const recordsToCreate = [];

    Object.entries(newNotes).forEach(([applicantId, note]) => {
      const newNoteEntry = `${session.user.name}: ${note}\n\n`;

      if (existingNotes[applicantId]) {
        recordsToUpdate.push({
          id: existingNotes[applicantId].id,
          fields: {
            Notes: existingNotes[applicantId].fields.Notes + newNoteEntry,
          },
        });
      } else {
        recordsToCreate.push({
          fields: {
            ApplicantId: applicantId,
            UserId: session.user.id,
            Notes: newNoteEntry,
          },
        });
      }
    });

    console.log("Records to create:", JSON.stringify(recordsToCreate, null, 2));
    console.log("Records to update:", JSON.stringify(recordsToUpdate, null, 2));

    // Update existing records
    if (recordsToUpdate.length > 0) {
      const updateResponse = await fetch(`${url}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: recordsToUpdate }),
      });

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.text();
        console.error("Airtable API error response (update):", errorBody);
        throw new Error(
          `Failed to update notes: ${updateResponse.status}. Error: ${errorBody}`
        );
      }
    }

    // Create new records
    if (recordsToCreate.length > 0) {
      const createResponse = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: recordsToCreate }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        console.error("Airtable API error response (create):", errorBody);
        throw new Error(
          `Failed to create new notes: ${createResponse.status}. Error: ${errorBody}`
        );
      }
    }

    return NextResponse.json({ message: "Notes updated successfully" });
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to update notes" },
      { status: 500 }
    );
  }
}
