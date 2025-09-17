import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface VoiceMatrix {
  formalCasual: number; // -1 to 1
  authoritativeApproachable: number; // -1 to 1
  professionalConversational: number; // -1 to 1
  seriousPlayful: number; // -1 to 1
  confidence: number; // -1 to 1
  enthusiasm: number; // -1 to 1
  empathy: number; // -1 to 1
}

export interface CopyGenerationRequest {
  prompt: string;
  channel: string;
  voiceMatrix: VoiceMatrix;
  brandGuidelines?: string;
  voiceSamples?: string;
  characterLimit?: number;
}

export interface CopyGenerationResponse {
  content: string;
  characterCount: number;
  voiceConsistencyScore: number;
  suggestions: string[];
}

export class GeminiClient {
  private model: any;

  constructor(userApiKey?: string) {
    // Use user's API key if provided, otherwise fall back to env variable
    const apiKey = userApiKey || env.GEMINI_API_KEY;
    
    console.log("🔑 GeminiClient constructor - API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "No API key");
    
    if (apiKey && apiKey !== "test-key" && apiKey !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE" && apiKey !== "your-gemini-api-key-here") {
      console.log("✅ Using real Gemini API");
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    } else {
      console.log("❌ Using demo mode - no valid API key");
      this.model = null; // Will use demo mode
    }
  }

  async generateCopy(request: CopyGenerationRequest): Promise<CopyGenerationResponse> {
    console.log("🚀 generateCopy called with request:", {
      prompt: request.prompt,
      channel: request.channel,
      characterLimit: request.characterLimit,
      voiceMatrix: request.voiceMatrix
    });

    // Check if we have a valid model (API key)
    if (!this.model) {
      console.log("❌ No model available, using demo mode");
      return this.generateDemoCopy(request);
    }

    console.log("✅ Using real Gemini API for generation");

    const voicePrompt = this.buildVoicePrompt(request.voiceMatrix, request.brandGuidelines, request.voiceSamples);
    const channelPrompt = this.buildChannelPrompt(request.channel, request.characterLimit);
    
    const fullPrompt = `You are an AI copywriting assistant. Generate marketing copy that matches the specified voice and tone characteristics.

${voicePrompt}

${channelPrompt}

TASK: Generate copy for: "${request.prompt}"

REQUIREMENTS:
- Maintain the specified voice and tone characteristics
- Optimize for the ${request.channel} channel
- Keep within ${request.characterLimit || 280} characters
- Ensure brand voice consistency

RESPONSE FORMAT (JSON):
{
  "content": "Your generated copy here",
  "characterCount": 123,
  "voiceConsistencyScore": 85,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2", 
    "Suggestion 3"
  ]
}

Generate the copy now:`;

    console.log("📝 Full prompt being sent to Gemini:", fullPrompt);

    try {
      console.log("🔄 Sending request to Gemini API...");
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("📥 Raw response from Gemini:", text);
      
      const parsedResponse = this.parseResponse(text, request.characterLimit || 280);
      console.log("✅ Parsed response:", parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error("❌ Error generating copy:", error);
      // Fallback to demo mode if API fails
      return this.generateDemoCopy(request);
    }
  }

  private generateDemoCopy(request: CopyGenerationRequest): CopyGenerationResponse {
    const voiceMatrix = request.voiceMatrix;
    const channel = request.channel;
    const prompt = request.prompt;
    const characterLimit = request.characterLimit || 280;

    // Generate demo content based on voice matrix and channel
    let content = this.generateDemoContent(prompt, voiceMatrix, channel, characterLimit);
    
    // Ensure content fits within character limit
    if (content.length > characterLimit) {
      content = content.substring(0, characterLimit - 3) + "...";
    }

    // Calculate voice consistency score based on voice matrix
    const consistencyScore = this.calculateDemoConsistencyScore(voiceMatrix);

    return {
      content,
      characterCount: content.length,
      voiceConsistencyScore: consistencyScore,
      suggestions: [
        "Add a call-to-action to increase engagement",
        "Include relevant hashtags for better discoverability",
        "Consider adding emojis to make it more engaging"
      ]
    };
  }

  private generateDemoContent(prompt: string, voiceMatrix: VoiceMatrix, channel: string, characterLimit: number): string {
    const isFormal = voiceMatrix.formalCasual > 0;
    const isAuthoritative = voiceMatrix.authoritativeApproachable > 0;
    const isProfessional = voiceMatrix.professionalConversational > 0;
    const isSerious = voiceMatrix.seriousPlayful > 0;
    const isConfident = voiceMatrix.confidence > 0;
    const isEnthusiastic = voiceMatrix.enthusiasm > 0;
    const isEmpathetic = voiceMatrix.empathy > 0;

    // Channel-specific templates
    const channelTemplates = {
      email: this.getEmailTemplate(isFormal, isAuthoritative, isProfessional),
      linkedin: this.getLinkedInTemplate(isFormal, isAuthoritative, isProfessional),
      instagram: this.getInstagramTemplate(isFormal, isSerious, isEnthusiastic),
      twitter: this.getTwitterTemplate(isFormal, isSerious, isEnthusiastic),
      web: this.getWebTemplate(isFormal, isAuthoritative, isProfessional),
      facebook: this.getFacebookTemplate(isFormal, isSerious, isEnthusiastic),
      tiktok: this.getTikTokTemplate(isFormal, isSerious, isEnthusiastic)
    };

    const template = channelTemplates[channel as keyof typeof channelTemplates] || channelTemplates.twitter;
    
    // Replace placeholders with actual content
    let content = template.replace("{prompt}", prompt);
    
    // Adjust tone based on voice matrix
    if (isConfident) {
      content = content.replace("might", "will").replace("could", "will");
    }
    
    if (isEmpathetic) {
      content = content.replace("you", "you").replace("your", "your");
    }

    return content;
  }

  private getEmailTemplate(isFormal: boolean, isAuthoritative: boolean, isProfessional: boolean): string {
    if (isFormal && isAuthoritative) {
      return "Subject: {prompt}\n\nDear Valued Customer,\n\nWe are pleased to present {prompt}. This opportunity represents a significant advancement in our commitment to excellence.\n\nWe encourage you to take immediate action to secure your position.\n\nBest regards,\nThe Team";
    } else if (isFormal) {
      return "Subject: {prompt}\n\nHello,\n\nWe'd like to share {prompt} with you. This is an exciting opportunity that we believe you'll find valuable.\n\nPlease let us know if you have any questions.\n\nThank you,\nThe Team";
    } else {
      return "Hey there! 👋\n\nWe've got something awesome to share: {prompt}!\n\nThis is going to be amazing and we think you'll love it. Want to know more? Just reply to this email!\n\nTalk soon,\nThe Team";
    }
  }

  private getLinkedInTemplate(isFormal: boolean, isAuthoritative: boolean, isProfessional: boolean): string {
    if (isFormal && isAuthoritative) {
      return "Industry leaders are recognizing the critical importance of {prompt}. Our research indicates that organizations implementing this approach see 40% improvement in key metrics.\n\nKey insights:\n• Strategic implementation drives results\n• Data-driven decisions are essential\n• Leadership commitment is crucial\n\nWhat are your thoughts on this trend?";
    } else {
      return "Excited to share some thoughts on {prompt}! 🚀\n\nIn my experience, this approach has been a game-changer. The results speak for themselves.\n\nWhat's your take on this? Would love to hear your perspective in the comments below!";
    }
  }

  private getInstagramTemplate(isFormal: boolean, isSerious: boolean, isEnthusiastic: boolean): string {
    if (isEnthusiastic) {
      return "✨ {prompt} is here! ✨\n\nWe're SO excited to share this with you! 🎉\n\nSwipe to see more details 👆\n\n#excited #new #launch #amazing";
    } else if (isSerious) {
      return "Introducing {prompt}\n\nA thoughtful approach to modern challenges.\n\nLearn more at the link in our bio.\n\n#professional #quality #innovation";
    } else {
      return "Hey friends! 👋\n\nCheck out {prompt} - we think you'll love it! 💕\n\nTag someone who needs to see this! 👇\n\n#friends #share #love";
    }
  }

  private getTwitterTemplate(isFormal: boolean, isSerious: boolean, isEnthusiastic: boolean): string {
    if (isEnthusiastic) {
      return "🚀 {prompt} is here! This is going to change everything! \n\n#excited #innovation #gamechanger";
    } else if (isFormal) {
      return "Introducing {prompt}. A strategic approach to modern challenges. \n\n#innovation #strategy #professional";
    } else {
      return "Just discovered {prompt} and wow! 🤯\n\nThis is exactly what we needed. \n\n#discovery #amazing #wow";
    }
  }

  private getWebTemplate(isFormal: boolean, isAuthoritative: boolean, isProfessional: boolean): string {
    if (isFormal && isAuthoritative) {
      return "Transform Your Business with {prompt}\n\nOur proven methodology delivers measurable results for forward-thinking organizations. Join industry leaders who trust our expertise.\n\nLearn More | Get Started Today";
    } else {
      return "Discover {prompt}\n\nSimple, effective solutions that work. Join thousands of satisfied customers who've transformed their approach.\n\nStart Your Journey | See How It Works";
    }
  }

  private getFacebookTemplate(isFormal: boolean, isSerious: boolean, isEnthusiastic: boolean): string {
    if (isEnthusiastic) {
      return "🎉 {prompt} is finally here! 🎉\n\nWe've been working on this for months and we're so excited to share it with our amazing community!\n\nWhat do you think? Drop a comment below! 👇";
    } else {
      return "We're proud to introduce {prompt}.\n\nThis represents our commitment to providing value to our community.\n\nWe'd love to hear your thoughts in the comments.";
    }
  }

  private getTikTokTemplate(isFormal: boolean, isSerious: boolean, isEnthusiastic: boolean): string {
    return "POV: You discover {prompt} and your mind is blown 🤯\n\nThis changes everything! \n\n#fyp #viral #mindblown #discovery";
  }

  private calculateDemoConsistencyScore(voiceMatrix: VoiceMatrix): number {
    // Calculate a base score based on how well the voice matrix values align
    let score = 70; // Base score
    
    // Add points for balanced voice characteristics
    const balance = Math.abs(voiceMatrix.formalCasual) + Math.abs(voiceMatrix.authoritativeApproachable) + 
                   Math.abs(voiceMatrix.professionalConversational) + Math.abs(voiceMatrix.seriousPlayful);
    
    if (balance < 2) score += 15; // Well-balanced voice
    if (balance < 1) score += 10; // Very well-balanced
    
    // Add points for confidence and enthusiasm
    if (voiceMatrix.confidence > 0.3) score += 5;
    if (voiceMatrix.enthusiasm > 0.3) score += 5;
    
    return Math.min(95, Math.max(60, score));
  }

  async analyzeVoiceConsistency(content: string, voiceMatrix: VoiceMatrix): Promise<number> {
    const prompt = `
Analyze the following content for voice consistency against these characteristics:

Voice Matrix:
- Formal vs Casual: ${voiceMatrix.formalCasual} (${voiceMatrix.formalCasual > 0 ? 'More Formal' : 'More Casual'})
- Authoritative vs Approachable: ${voiceMatrix.authoritativeApproachable} (${voiceMatrix.authoritativeApproachable > 0 ? 'More Authoritative' : 'More Approachable'})
- Professional vs Conversational: ${voiceMatrix.professionalConversational} (${voiceMatrix.professionalConversational > 0 ? 'More Professional' : 'More Conversational'})
- Serious vs Playful: ${voiceMatrix.seriousPlayful} (${voiceMatrix.seriousPlayful > 0 ? 'More Serious' : 'More Playful'})
- Confidence Level: ${voiceMatrix.confidence} (${voiceMatrix.confidence > 0 ? 'More Confident' : 'Less Confident'})
- Enthusiasm Level: ${voiceMatrix.enthusiasm} (${voiceMatrix.enthusiasm > 0 ? 'More Enthusiastic' : 'Less Enthusiastic'})
- Empathy Level: ${voiceMatrix.empathy} (${voiceMatrix.empathy > 0 ? 'More Empathetic' : 'Less Empathetic'})

Content to analyze:
"${content}"

Rate the voice consistency on a scale of 0-100, where:
- 90-100: Excellent consistency with all voice characteristics
- 80-89: Good consistency with minor deviations
- 70-79: Moderate consistency with some deviations
- 60-69: Poor consistency with significant deviations
- 0-59: Very poor consistency, doesn't match voice characteristics

Provide only the numerical score (0-100).
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const score = parseInt(text.match(/\d+/)?.[0] || "0");
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error("Error analyzing voice consistency:", error);
      return 0;
    }
  }

  private buildVoicePrompt(voiceMatrix: VoiceMatrix, brandGuidelines?: string, voiceSamples?: string): string {
    let prompt = "Voice and Tone Guidelines:\n";
    
    // Voice characteristics
    prompt += `- Formality Level: ${this.describeLevel(voiceMatrix.formalCasual, 'casual', 'formal')}\n`;
    prompt += `- Authority Level: ${this.describeLevel(voiceMatrix.authoritativeApproachable, 'approachable', 'authoritative')}\n`;
    prompt += `- Professionalism: ${this.describeLevel(voiceMatrix.professionalConversational, 'conversational', 'professional')}\n`;
    prompt += `- Tone: ${this.describeLevel(voiceMatrix.seriousPlayful, 'playful', 'serious')}\n`;
    prompt += `- Confidence: ${this.describeLevel(voiceMatrix.confidence, 'modest', 'confident')}\n`;
    prompt += `- Enthusiasm: ${this.describeLevel(voiceMatrix.enthusiasm, 'reserved', 'enthusiastic')}\n`;
    prompt += `- Empathy: ${this.describeLevel(voiceMatrix.empathy, 'direct', 'empathetic')}\n`;

    if (brandGuidelines) {
      prompt += `\nBrand Guidelines:\n${brandGuidelines}\n`;
    }

    if (voiceSamples) {
      prompt += `\nVoice Samples:\n${voiceSamples}\n`;
    }

    return prompt;
  }

  private buildChannelPrompt(channel: string, characterLimit?: number): string {
    const channelGuidelines: Record<string, string> = {
      email: "Email copy should be clear, actionable, and maintain professional tone while being engaging.",
      linkedin: "LinkedIn content should be professional, thought-provoking, and industry-relevant.",
      instagram: "Instagram content should be visually appealing, engaging, and use appropriate hashtags.",
      twitter: "Twitter content should be concise, engaging, and use relevant hashtags and mentions.",
      web: "Web copy should be clear, SEO-friendly, and guide users toward desired actions.",
      facebook: "Facebook content should be engaging, shareable, and community-focused.",
      tiktok: "TikTok content should be trendy, entertaining, and use popular sounds/effects.",
    };

    const guidelines = channelGuidelines[channel.toLowerCase()] || "Content should be appropriate for the specified channel.";
    
    return `Channel: ${channel}\n${guidelines}${characterLimit ? `\nCharacter Limit: ${characterLimit}` : ''}`;
  }

  private describeLevel(value: number, low: string, high: string): string {
    if (value > 0.5) return `Very ${high}`;
    if (value > 0) return `Somewhat ${high}`;
    if (value < -0.5) return `Very ${low}`;
    if (value < 0) return `Somewhat ${low}`;
    return 'Neutral';
  }

  private parseResponse(text: string, characterLimit: number): CopyGenerationResponse {
    console.log("🔍 Parsing response:", text);
    
    // Try to parse as JSON first
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        console.log("✅ Successfully parsed JSON response:", parsed);
        
        return {
          content: parsed.content?.substring(0, characterLimit) || text.substring(0, characterLimit),
          characterCount: Math.min(parsed.characterCount || parsed.content?.length || text.length, characterLimit),
          voiceConsistencyScore: Math.max(0, Math.min(100, parsed.voiceConsistencyScore || 85)),
          suggestions: parsed.suggestions || [
            "Consider adjusting the tone to better match your brand voice",
            "Add more specific details to make the content more engaging",
            "Review the call-to-action for clarity and effectiveness"
          ]
        };
      }
    } catch (error) {
      console.log("❌ Failed to parse JSON, falling back to text parsing");
    }
    
    // Fallback to text parsing
    const lines = text.split('\n').filter(line => line.trim());
    const content = lines[0]?.trim() || text.trim();
    
    // Extract character count
    const charCountMatch = text.match(/character count[:\s]*(\d+)/i);
    const characterCount = charCountMatch ? parseInt(charCountMatch[1]) : content.length;
    
    // Extract voice consistency score
    const scoreMatch = text.match(/voice consistency score[:\s]*(\d+)/i);
    const voiceConsistencyScore = scoreMatch ? parseInt(scoreMatch[1]) : 85;
    
    // Extract suggestions (look for numbered lists or bullet points)
    const suggestions = lines
      .filter(line => /^\d+\.|^[-*]/.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*|^[-*]\s*/, '').trim())
      .slice(0, 3);

    return {
      content: content.substring(0, characterLimit),
      characterCount: Math.min(characterCount, characterLimit),
      voiceConsistencyScore: Math.max(0, Math.min(100, voiceConsistencyScore)),
      suggestions: suggestions.length > 0 ? suggestions : [
        "Consider adjusting the tone to better match your brand voice",
        "Add more specific details to make the content more engaging",
        "Review the call-to-action for clarity and effectiveness"
      ]
    };
  }
}

export const geminiClient = new GeminiClient();
