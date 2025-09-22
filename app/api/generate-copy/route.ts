import { NextRequest, NextResponse } from "next/server";
import { GeminiClient } from "~/lib/gemini-client";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";

const GenerateCopySchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  prompt: z.string().min(1, "Prompt is required").optional(),
  channel: z.string().min(1, "Channel is required"),
  voiceSettings: z.record(z.number()).optional(),
  voiceMatrix: z.object({
    directness: z.number().min(-1).max(1),
    universality: z.number().min(-1).max(1),
    authority: z.number().min(-1).max(1),
    tension: z.number().min(-1).max(1),
    education: z.number().min(-1).max(1),
    rhythm: z.number().min(-1).max(1),
    sneakerCulture: z.number().min(-1).max(1),
    marketplaceAccuracy: z.number().min(-1).max(1),
    expressiveCandid: z.number().min(-1).max(1),
  }).optional(),
  brandGuidelines: z.string().optional(),
  voiceSamples: z.string().optional(),
  characterLimit: z.number().optional(),
  mode: z.string().optional(),
  specifications: z.any().optional(),
  exampleText: z.string().optional(), // Added for horoscope mode
  zodiacSign: z.string().optional(), // Added for horoscope mode
  zodiacSigns: z.array(z.string()).optional(), // Added for multiple horoscope signs
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to use this feature." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = GenerateCopySchema.parse(body);

    // Get user's API key
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true },
    });

    if (!user?.geminiApiKey) {
      return NextResponse.json(
        { error: "API key required. Please add your Gemini API key in Settings." },
        { status: 400 }
      );
    }

    // Create Gemini client with user's API key
    let geminiClient;
    try {
      geminiClient = new GeminiClient(user.geminiApiKey);
    } catch (error) {
      if (error instanceof Error && error.message.includes("API key")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    const result = await geminiClient.generateCopy({
      prompt: validatedData.prompt || validatedData.content,
      channel: validatedData.channel,
      voiceMatrix: validatedData.voiceMatrix,
      voiceSettings: validatedData.voiceSettings,
      brandGuidelines: validatedData.brandGuidelines,
      voiceSamples: validatedData.voiceSamples,
      characterLimit: validatedData.characterLimit,
      mode: validatedData.mode,
      specifications: validatedData.specifications,
      exampleText: validatedData.exampleText,
      zodiacSign: validatedData.zodiacSign,
      zodiacSigns: validatedData.zodiacSigns,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating copy:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate copy" },
      { status: 500 }
    );
  }
}
