// app/api/applicants/route.ts

import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_NAME!).select().all();
    const applicants = records.map((record) => ({
      id: record.id,
      name: record.get("name"),
      email: record.get("email"),
      major: record.get("major"),
      year: record.get("year"),
    }));
    return NextResponse.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
