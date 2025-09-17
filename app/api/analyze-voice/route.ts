import { NextRequest, NextResponse } from "next/server";
import { geminiClient } from "~/lib/gemini-client";
import { z } from "zod";

const AnalyzeVoiceSchema = z.object({
  content: z.string().min(1, "Content is required"),
  voiceMatrix: z.object({
    formalCasual: z.number().min(-1).max(1),
    authoritativeApproachable: z.number().min(-1).max(1),
    professionalConversational: z.number().min(-1).max(1),
    seriousPlayful: z.number().min(-1).max(1),
    confidence: z.number().min(-1).max(1),
    enthusiasm: z.number().min(-1).max(1),
    empathy: z.number().min(-1).max(1),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = AnalyzeVoiceSchema.parse(body);

    const consistencyScore = await geminiClient.analyzeVoiceConsistency(
      validatedData.content,
      validatedData.voiceMatrix
    );

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
