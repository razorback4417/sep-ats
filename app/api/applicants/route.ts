// app/api/applicants/route.ts

import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

interface AirtableRecord {
  id: string;
  fields: {
    Name: string;
    Email: string;
    Major: string;
    Year: string;
  };
}

export async function GET() {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    console.log("Fetching from Airtable URL:", url);

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
    console.log("Raw Airtable response:", data);

    const applicants = data.records.map((record: AirtableRecord) => ({
      id: record.id,
      name: record.fields.Name,
      email: record.fields.Email,
      major: record.fields.Major,
      year: record.fields.Year,
    }));

    console.log("Transformed applicants:", applicants);

    return NextResponse.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants from Airtable:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
