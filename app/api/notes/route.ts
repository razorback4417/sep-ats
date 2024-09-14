// app/api/notes/route.ts

import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { applicantIds, content } = await request.json();
    await client.connect();
    const database = client.db("sep_ats");
    const notes = database.collection("notes");

    const result = await notes.insertOne({
      applicantIds,
      content,
      userId: session.user.id,
      createdAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: "Failed to save notes" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
