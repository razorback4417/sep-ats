// app/api/applicants/route.ts

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("rush_tracker");
    const applicants = database.collection("applicants");
    const result = await applicants.find({}).toArray();

    console.log("Fetched applicants:", result);

    return NextResponse.json(result);
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  console.log("POST request received");
  try {
    const body = await request.json();
    console.log("Request body:", body);

    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("rush_tracker");
    const applicants = database.collection("applicants");
    const result = await applicants.insertOne({
      name: body.name,
      notes: body.notes,
      major: body.major,
      year: body.year,
      createdAt: new Date(),
    });
    console.log("Insert result:", result);

    return NextResponse.json(result);
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: "Failed to add applicant", details: e.message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// ... keep your existing GET method
