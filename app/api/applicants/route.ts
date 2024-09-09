// app/api/applicants/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import Applicant from "../../../models/Applicant";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request: NextRequest) {
  try {
    await client.connect();
    const database = client.db("sep_ats");
    const applicants = database.collection("applicants");

    // TODO: Implement pagination and filtering
    const result = await applicants.find({}).toArray();

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

export async function POST(request: NextRequest) {
  try {
    const body: Applicant = await request.json();
    await client.connect();
    const database = client.db("sep_ats");
    const applicants = database.collection("applicants");
    const result = await applicants.insertOne(body);
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: "Failed to add applicant" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData }: Partial<Applicant> & { id: string } =
      await request.json();
    await client.connect();
    const database = client.db("sep_ats");
    const applicants = database.collection("applicants");
    const result = await applicants.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return NextResponse.json(result);
  } catch (e) {
    console.error("PUT Error:", e);
    return NextResponse.json(
      { error: "Failed to update applicant" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await client.connect();
    const database = client.db("sep_ats");
    const applicants = database.collection("applicants");
    const result = await applicants.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(result);
  } catch (e) {
    console.error("DELETE Error:", e);
    return NextResponse.json(
      { error: "Failed to delete applicant" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
