import { NextRequest, NextResponse } from "next/server";
import { GeminiClient } from "~/lib/gemini-client";
import { z } from "zod";

const AnalyzeVoiceSchema = z.object({
  content: z.string().min(1, "Content is required"),
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
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AnalyzeVoiceSchema.parse(body);

    // For now, return a demo consistency score since we don't have API key handling
    // This route is not currently used in the main app
    const consistencyScore = 85; // Demo score

    return NextResponse.json({
      consistencyScore,
      analysis: {
        content: validatedData.content,
        voiceMatrix: validatedData.voiceMatrix,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error analyzing voice:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze voice consistency" },
      { status: 500 }
    );
  }
}
