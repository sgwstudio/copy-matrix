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
  specifications: z.record(z.unknown()).optional(),
  exampleText: z.string().optional(), // Added for horoscope mode
  zodiacSign: z.string().optional(), // Added for horoscope mode
  zodiacSigns: z.array(z.string()).optional(), // Added for multiple horoscope signs
}).refine(
  (data) => data.content || data.prompt,
  {
    message: "Either 'content' or 'prompt' is required",
    path: ["content", "prompt"],
  }
);

export async function POST(request: NextRequest) {
  try {
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication service unavailable. Please try again later." },
        { status: 500 }
      );
    }
    
    // Require authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to use this feature." },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("API Request body:", body);
    const validatedData = GenerateCopySchema.parse(body);
    console.log("Validated data:", validatedData);

    // Get user's API key from database
    let userApiKey = "demo-key"; // fallback
    
    if (session?.user?.id) {
      try {
        const user = await db.user.findUnique({
          where: { id: session.user.id },
          select: { geminiApiKey: true }
        });
        userApiKey = user?.geminiApiKey || "demo-key";
      } catch (error) {
        console.error("Failed to fetch user API key:", error);
        // Continue with demo key if database query fails
      }
    }

    // Create Gemini client with user's API key
    let geminiClient;
    try {
      geminiClient = new GeminiClient(userApiKey);
    } catch (error) {
      if (error instanceof Error && error.message.includes("API key")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log("Calling geminiClient.generateCopy with:", {
      prompt: validatedData.prompt || validatedData.content,
      channel: validatedData.channel,
      mode: validatedData.mode,
      zodiacSigns: validatedData.zodiacSigns,
    });

    // Provide default voice matrix if none provided
    const defaultVoiceMatrix = {
      directness: 0,
      universality: 0,
      authority: 0,
      tension: 0,
      education: 0,
      rhythm: 0,
      sneakerCulture: 0,
      marketplaceAccuracy: 0,
      expressiveCandid: 0,
    };

    const result = await geminiClient.generateCopy({
      prompt: validatedData.prompt || validatedData.content || "",
      channel: validatedData.channel,
      voiceMatrix: validatedData.voiceMatrix || defaultVoiceMatrix,
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

    console.log("GeminiClient result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating copy:", error);
    
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
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
      { error: `Failed to generate copy: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
