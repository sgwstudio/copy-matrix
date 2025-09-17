import { NextRequest, NextResponse } from "next/server";
import { GeminiClient } from "~/lib/gemini-client";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { db } from "~/lib/db";
import { z } from "zod";

const GenerateCopySchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  channel: z.string().min(1, "Channel is required"),
  voiceMatrix: z.object({
    formalCasual: z.number().min(-1).max(1),
    authoritativeApproachable: z.number().min(-1).max(1),
    professionalConversational: z.number().min(-1).max(1),
    seriousPlayful: z.number().min(-1).max(1),
    confidence: z.number().min(-1).max(1),
    enthusiasm: z.number().min(-1).max(1),
    empathy: z.number().min(-1).max(1),
  }),
  brandGuidelines: z.string().optional(),
  voiceSamples: z.string().optional(),
  characterLimit: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = GenerateCopySchema.parse(body);

    let userApiKey = null;
    
    // If user is authenticated, get their API key
    if (session?.user?.id) {
      try {
        const user = await db.user.findUnique({
          where: { id: session.user.id },
          select: { geminiApiKey: true },
        });
        userApiKey = user?.geminiApiKey;
      } catch (error) {
        console.error("Error fetching user API key:", error);
        // Continue with demo mode
      }
    }

    // Create Gemini client with user's API key or fallback to demo mode
    const geminiClient = new GeminiClient(userApiKey);

    const result = await geminiClient.generateCopy({
      prompt: validatedData.prompt,
      channel: validatedData.channel,
      voiceMatrix: validatedData.voiceMatrix,
      brandGuidelines: validatedData.brandGuidelines,
      voiceSamples: validatedData.voiceSamples,
      characterLimit: validatedData.characterLimit,
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

    return NextResponse.json(
      { error: "Failed to generate copy" },
      { status: 500 }
    );
  }
}
