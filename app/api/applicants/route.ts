// app/api/applicants/route.ts

import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    if (ids) {
      const filterByFormula = `OR(${ids
        .split(",")
        .map((id) => `RECORD_ID()='${id}'`)
        .join(",")})`;
      url += `?filterByFormula=${encodeURIComponent(filterByFormula)}`;
    }

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

    const applicants = data.records.map((record: any) => ({
      id: record.id,
      name: record.fields.Name,
      email: record.fields.Email,
      major: record.fields.Major,
      year: record.fields.Year,
    }));

    return NextResponse.json(applicants);
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
