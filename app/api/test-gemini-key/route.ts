import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const TestKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = TestKeySchema.parse(body);

    // Test the API key with a simple request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent("Test");
    await result.response;

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("API key test failed:", error);
    return NextResponse.json({ valid: false });
  }
}
