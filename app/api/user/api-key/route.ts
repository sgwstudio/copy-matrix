import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";

const ApiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("API Key GET - Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      console.log("API Key GET - No session, returning null");
      return NextResponse.json({ apiKey: null });
    }

    // Fetch user's API key from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true }
    });

    console.log("API Key GET - User from DB:", user);
    return NextResponse.json({ apiKey: user?.geminiApiKey || null });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json({ apiKey: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to save your API key" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = ApiKeySchema.parse(body);

    // Save API key to database
    await db.user.update({
      where: { id: session.user.id },
      data: { geminiApiKey: apiKey }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
