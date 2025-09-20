import { GoogleGenerativeAI } from "@google/generative-ai";

export interface VoiceMatrix {
  // CORE VOICE (always present, intensity varies)
  directness: number;        // -1 to 1: How straightforward vs nuanced
  universality: number;      // -1 to 1: How niche vs globally accessible  
  authority: number;         // -1 to 1: How confident vs humble
  
  // TONE CHARACTERISTICS (variable application)
  tension: number;           // -1 to 1: Everyday language vs elevated/juxtaposed
  education: number;         // -1 to 1: Minimal context vs deep insight
  rhythm: number;           // -1 to 1: Standard flow vs staccato/varied cadence
  
  // SPECTRUM POSITION
  expressiveCandid: number;  // -1 to 1: Expressive (editorial) vs Candid (technical)
}

// Preset Configurations for Different Content Types
export const BRAND_VOICE_PRESETS: Record<string, VoiceMatrix> = {
  editorial: {
    directness: 0.7,
    universality: 0.4,
    authority: 0.8,
    tension: 0.9,
    education: 0.8,
    rhythm: 0.9,
    expressiveCandid: -0.8  // Very expressive
  },
  
  social: {
    directness: 0.6,
    universality: 0.7,
    authority: 0.6,
    tension: 0.5,
    education: 0.4,
    rhythm: 0.6,
    expressiveCandid: -0.3  // Somewhat expressive
  },
  
  productDescription: {
    directness: 0.8,
    universality: 0.6,
    authority: 0.7,
    tension: 0.3,
    education: 0.6,
    rhythm: 0.4,
    expressiveCandid: 0.2   // Slightly candid
  },
  
  technical: {
    directness: 0.9,
    universality: 0.5,
    authority: 0.8,
    tension: 0.1,
    education: 0.7,
    rhythm: 0.2,
    expressiveCandid: 0.8   // Very candid
  }
};

export interface CopyGenerationRequest {
  prompt: string;
  channel: string;
  voiceMatrix?: VoiceMatrix;
  voiceSettings?: Record<string, number>;
  brandGuidelines?: string;
  voiceSamples?: string;
  characterLimit?: number;
  mode?: string;
  specifications?: any;
  exampleText?: string; // Added for horoscope mode
  zodiacSign?: string; // Added for horoscope mode
  zodiacSigns?: string[]; // Added for multiple horoscope signs
}

export interface CopyGenerationResponse {
  content: string;
  characterCount: number;
  voiceConsistencyScore: number;
  suggestions: string[];
}

export class GeminiClient {
  private model: any;

  constructor(userApiKey: string) {
    if (!userApiKey) {
      throw new Error("API key is required. Please sign in and add your Gemini API key in Settings.");
    }
    
    console.log("🔑 GeminiClient constructor - API Key:", userApiKey ? `${userApiKey.substring(0, 10)}...` : "No API key");
    
    if (userApiKey && userApiKey !== "test-key" && userApiKey !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE" && userApiKey !== "your-gemini-api-key-here") {
      console.log("✅ Using real Gemini API");
      const genAI = new GoogleGenerativeAI(userApiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    } else {
      console.log("❌ Invalid API key provided");
      throw new Error("Invalid API key. Please check your Gemini API key in Settings.");
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

    const voicePrompt = this.buildVoicePrompt(request.voiceMatrix, request.voiceSettings, request.brandGuidelines, request.voiceSamples);
    const channelPrompt = this.buildChannelPrompt(request.channel, request.characterLimit, request.mode, request.specifications);
    
    let fullPrompt = `You are an AI copywriting assistant. Generate marketing copy that matches the specified voice and tone characteristics.

${voicePrompt}

${channelPrompt}

TASK: Generate copy for: "${request.prompt}"

REQUIREMENTS:
- Maintain the specified voice and tone characteristics
- Optimize for the ${request.channel} channel
- Keep within ${request.characterLimit || 280} characters
- Ensure brand voice consistency`;

    if (request.mode === "email-optimized" && request.channel === "email-pushes") {
      fullPrompt += `

RESPONSE FORMAT (JSON):
{
  "content": {
    "email": {
      "subjectLine": "Your subject line here",
      "preheaderText": "Your preheader text here",
      "body": {
        "primaryHeadline": "Your headline here",
        "openingParagraph": "Your opening paragraph here",
        "mainContent": "Your main content here",
        "closing": "Your closing paragraph here"
      },
      "callToAction": {
        "buttonText": "Your CTA button text here"
      }
    },
    "pushNotification": {
      "pushTitle": "Your push title here",
      "pushBody": "Your push body text here"
    }
  },
  "characterCount": 123,
  "voiceConsistencyScore": 85,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2", 
    "Suggestion 3"
  ]
}`;
    } else if (request.mode === "horoscope" && request.channel === "horoscope") {
      // Handle multiple zodiac signs
      const zodiacSigns = request.zodiacSigns && request.zodiacSigns.length > 0 
        ? request.zodiacSigns 
        : request.zodiacSign 
          ? [request.zodiacSign]
          : ['aries'];

      const zodiacSignNames = zodiacSigns.map(signId => {
        const signMap: { [key: string]: string } = {
          'aries': 'Aries', 'taurus': 'Taurus', 'gemini': 'Gemini', 'cancer': 'Cancer',
          'leo': 'Leo', 'virgo': 'Virgo', 'libra': 'Libra', 'scorpio': 'Scorpio',
          'sagittarius': 'Sagittarius', 'capricorn': 'Capricorn', 'aquarius': 'Aquarius', 'pisces': 'Pisces'
        };
        return signMap[signId] || signId;
      });

      fullPrompt = `You are an AI horoscope generator. Create 8 themed horoscope versions for ${zodiacSignNames.join(', ')} based on the provided themes and user prompt.

${voicePrompt}

USER PROMPT: "${request.prompt}"

HOROSCOPE THEMES:
Day 0: Beginnings, freedom, originality
Day 1: Rules, origins, techniques  
Day 2: Aesthetics, comforts, sumptuousness
Day 3: Intuition, depth, feeling
Day 4: Creativity, expression, doing
Day 5: Experimentation, technology, creation
Day 6: Newness, adventure
Day 7: Athleticism, mastery, winning

TASK: Generate 8 horoscope versions for ${zodiacSignNames.join(', ')} based on the themes above and following the user's prompt instructions.

REQUIREMENTS:
- Each horoscope should be 2-3 sentences
- Follow the tone, voice, and style instructions from the user prompt
- Apply the voice and tone characteristics specified above
- Each should feel unique to its theme while staying true to the zodiac sign characteristics
- Make each horoscope engaging and personalized
- If multiple signs are selected, create horoscopes that work for all selected signs

RESPONSE FORMAT (JSON):
{
  "content": {
    "horoscopes": [
      "Day 0 horoscope text here",
      "Day 1 horoscope text here", 
      "Day 2 horoscope text here",
      "Day 3 horoscope text here",
      "Day 4 horoscope text here",
      "Day 5 horoscope text here",
      "Day 6 horoscope text here",
      "Day 7 horoscope text here"
    ]
  },
  "characterCount": 123,
  "voiceConsistencyScore": 85,
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2", 
    "Suggestion 3"
  ]
}`;
    } else {
      fullPrompt += `

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
}`;
    }

    fullPrompt += `

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
      
      // Check if it's a quota error
      if (error instanceof Error && error.message.includes("429")) {
        console.log("⚠️ Quota exceeded - falling back to enhanced demo mode");
        return this.generateEnhancedDemoCopy(request);
      }
      
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

  private generateEnhancedDemoCopy(request: CopyGenerationRequest): CopyGenerationResponse {
    const voiceMatrix = request.voiceMatrix;
    const channel = request.channel;
    const prompt = request.prompt;
    const characterLimit = request.characterLimit || 280;

    // Generate more sophisticated demo content
    let content = this.generateEnhancedDemoContent(prompt, voiceMatrix, channel, characterLimit);
    
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
        "💡 This is demo content - upgrade to real AI for personalized results",
        "🎯 Add specific metrics or data points to increase credibility",
        "📈 Include a clear call-to-action to drive engagement"
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

  private generateEnhancedDemoContent(prompt: string, voiceMatrix: VoiceMatrix, channel: string, characterLimit: number): string {
    const isFormal = voiceMatrix.formalCasual > 0;
    const isAuthoritative = voiceMatrix.authoritativeApproachable > 0;
    const isProfessional = voiceMatrix.professionalConversational > 0;
    const isSerious = voiceMatrix.seriousPlayful > 0;
    const isConfident = voiceMatrix.confidence > 0;
    const isEnthusiastic = voiceMatrix.enthusiasm > 0;
    const isEmpathetic = voiceMatrix.empathy > 0;

    // Create more dynamic content based on the actual prompt
    const promptWords = prompt.toLowerCase().split(' ');
    const isProduct = promptWords.some(word => ['product', 'launch', 'new', 'feature'].includes(word));
    const isService = promptWords.some(word => ['service', 'help', 'support', 'consulting'].includes(word));
    const isEvent = promptWords.some(word => ['event', 'meeting', 'conference', 'webinar'].includes(word));
    const isEducational = promptWords.some(word => ['learn', 'education', 'course', 'training'].includes(word));

    // Channel-specific content generation
    let content = "";
    
    if (channel === 'twitter') {
      if (isProduct) {
        content = isFormal 
          ? `Introducing our latest innovation: ${prompt}. Experience the future of technology with cutting-edge features designed for modern professionals. #Innovation #Tech`
          : `Check this out! 🚀 ${prompt} is here and it's absolutely amazing! Can't wait for you to try it. #NewProduct #Excited`;
      } else if (isService) {
        content = isFormal
          ? `Professional ${prompt} services now available. Our expert team delivers exceptional results tailored to your specific needs. Contact us today. #ProfessionalServices`
          : `Need help with ${prompt}? We've got you covered! Our team is here to make it easy and stress-free. DM us! 💪 #Help #Support`;
      } else {
        content = isFormal
          ? `Exploring ${prompt}: A comprehensive analysis of current trends and future implications. Join the conversation. #Analysis #Insights`
          : `So, about ${prompt}... 🤔 What do you think? Drop your thoughts below! #Discussion #Thoughts`;
      }
    } else if (channel === 'email') {
      content = isFormal
        ? `Subject: ${prompt} - Important Update\n\nDear Valued Client,\n\nWe are pleased to inform you about ${prompt}. This development represents a significant advancement in our commitment to excellence.\n\nOur team has carefully analyzed the implications and prepared comprehensive solutions tailored to your needs.\n\nBest regards,\nThe Team`
        : `Hey there! 👋\n\nHope you're doing great! I wanted to reach out about ${prompt} - it's something I think you'll find really interesting.\n\nWe've been working on this for a while and I'm excited to share it with you. Let me know what you think!\n\nTalk soon,\nSam`;
    } else if (channel === 'linkedin') {
      content = isFormal
        ? `Professional Insight: ${prompt}\n\nIn today's rapidly evolving business landscape, ${prompt} represents a critical opportunity for organizations seeking sustainable growth and competitive advantage.\n\nKey considerations:\n• Strategic implementation\n• Risk assessment\n• Performance metrics\n\nWhat are your thoughts on this trend? #ProfessionalInsights #BusinessStrategy`
        : `Quick thought on ${prompt}...\n\nI've been thinking about this a lot lately, and honestly, it's pretty fascinating how it's changing the game.\n\nWhat's your take? Have you seen this in action? Would love to hear your experiences!\n\n#Discussion #Learning #Networking`;
    } else if (channel === 'instagram') {
      content = isFormal
        ? `✨ Professional Spotlight: ${prompt}\n\nDiscover the latest insights and trends in our industry. Our expert analysis reveals key opportunities for growth and innovation.\n\n#Professional #IndustryInsights #Innovation #Growth`
        : `OMG, you guys! 😍\n\n${prompt} is literally everything right now! I'm obsessed and you need to know about this ASAP!\n\nSwipe to see more 👉\n\n#Obsessed #Trending #MustKnow #Viral`;
    } else if (channel === 'web') {
      content = isFormal
        ? `About ${prompt}\n\nOur comprehensive approach to ${prompt} combines industry expertise with innovative solutions. We deliver measurable results through proven methodologies and cutting-edge technology.\n\nKey Benefits:\n• Proven track record\n• Expert team\n• Custom solutions\n\nContact us today to learn more.`
        : `Welcome to ${prompt}!\n\nWe're here to help you succeed with ${prompt}. Our friendly team makes everything simple and straightforward.\n\nWhat we offer:\n• Easy solutions\n• Great support\n• Real results\n\nReady to get started? Let's chat!`;
    } else if (channel === 'facebook') {
      content = isFormal
        ? `Company Update: ${prompt}\n\nWe're excited to share important developments regarding ${prompt}. This initiative reflects our commitment to innovation and customer satisfaction.\n\nJoin the conversation and share your thoughts.`
        : `Hey everyone! 👋\n\nBig news about ${prompt}! I'm so excited to share this with you all.\n\nWhat do you think? Drop a comment below! 👇\n\n#Excited #News #Community`;
    } else if (channel === 'tiktok') {
      content = isFormal
        ? `Professional Insight: ${prompt}\n\nKey trends and opportunities in today's market. Strategic considerations for business growth.\n\n#Professional #Business #Insights`
        : `POV: You discover ${prompt} and your mind is blown 🤯\n\nThis is actually insane! Wait until you see this...\n\n#MindBlown #Trending #Viral #MustSee`;
    }

    // Adjust tone based on voice matrix
    if (isConfident) {
      content = content.replace(/might/g, 'will').replace(/could/g, 'will').replace(/perhaps/g, 'definitely');
    }
    
    if (isEmpathetic) {
      content = content.replace(/you/g, 'you').replace(/your/g, 'your');
      if (!content.includes('understand') && !content.includes('feel')) {
        content = content.replace(/\./g, '. We understand your needs.');
      }
    }

    if (isEnthusiastic) {
      content = content.replace(/good/g, 'amazing').replace(/great/g, 'incredible');
      if (!content.includes('!')) {
        content = content + '!';
      }
    }

    // Ensure content fits character limit
    if (content.length > characterLimit) {
      content = content.substring(0, characterLimit - 3) + '...';
    }

    return content;
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

  private buildVoicePrompt(voiceMatrix?: VoiceMatrix, voiceSettings?: Record<string, number>, brandGuidelines?: string, voiceSamples?: string): string {
    let prompt = "VOICE AND TONE GUIDELINES:\n\n";
    
    if (voiceMatrix) {
      // Core Voice (always applied)
      prompt += "CORE VOICE:\n";
      prompt += `- DIRECTNESS: ${this.describeDirectness(voiceMatrix.directness)}\n`;
      prompt += `- UNIVERSALITY: ${this.describeUniversality(voiceMatrix.universality)}\n`;
      prompt += `- AUTHORITY: ${this.describeAuthority(voiceMatrix.authority)}\n\n`;
      
      // Tone Characteristics (variable application)
      prompt += "TONE APPLICATION:\n";
      prompt += `- TENSION: ${this.describeTension(voiceMatrix.tension)}\n`;
      prompt += `- EDUCATION: ${this.describeEducation(voiceMatrix.education)}\n`;
      prompt += `- RHYTHM: ${this.describeRhythm(voiceMatrix.rhythm)}\n\n`;
      
      // Spectrum Position
      prompt += `TONE SPECTRUM: ${this.describeSpectrum(voiceMatrix.expressiveCandid)}\n\n`;
    } else if (voiceSettings) {
      // Voice characteristics from voice settings
      Object.entries(voiceSettings).forEach(([key, value]) => {
        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
        prompt += `- ${displayName}: ${this.describeLevel(value, 'low', 'high')}\n`;
      });
    }

    if (brandGuidelines) {
      prompt += `Brand Guidelines:\n${brandGuidelines}\n\n`;
    }

    if (voiceSamples) {
      prompt += `Voice Samples:\n${voiceSamples}\n\n`;
    }

    return prompt;
  }

  private buildChannelPrompt(channel: string, characterLimit?: number, mode?: string, specifications?: any): string {
    let prompt = `Channel: ${channel}\n`;
    
    if (mode === "email-optimized" && specifications) {
      // Special handling for email-optimized mode
      if (channel === "email-pushes") {
        prompt += `\nEMAIL & PUSH NOTIFICATION SPECIFICATIONS:\n`;
        prompt += `\nEMAIL COMPONENTS:\n`;
        prompt += `1. Subject Line: ${specifications.subjectLine?.recommended || '30-50 characters'} (max: ${specifications.subjectLine?.max || '78 characters'})\n`;
        prompt += `   - Must be compelling and action-oriented\n`;
        prompt += `   - Avoid spam trigger words\n`;
        prompt += `   - Front-load important information\n`;
        prompt += `\n2. Preheader Text: ${specifications.preheader?.recommended || '40-90 characters'} (max: ${specifications.preheader?.max || '140 characters'})\n`;
        prompt += `   - Should complement, not repeat, the subject line\n`;
        prompt += `   - Acts as secondary headline to increase open rates\n`;
        prompt += `\n3. Body Content:\n`;
        prompt += `   - Primary Headline: ${specifications.bodyContent?.headline || '30-65 characters'}\n`;
        prompt += `   - Opening paragraph: ${specifications.bodyContent?.opening || '50-100 words'}\n`;
        prompt += `   - Main content: ${specifications.bodyContent?.main || '150-300 words'}\n`;
        prompt += `   - Closing: ${specifications.bodyContent?.closing || '25-50 words'}\n`;
        prompt += `\n4. Call-to-Action:\n`;
        prompt += `   - Button text: ${specifications.cta?.buttonText || '2-5 words (25 characters max)'}\n`;
        prompt += `   - Must be action-oriented verbs\n`;
        prompt += `\nPUSH NOTIFICATION COMPONENTS:\n`;
        prompt += `1. Push Title: ${specifications.pushTitle?.recommended || '30-40 characters'} (iOS: ${specifications.pushTitle?.ios || '178 characters'}, Android: ${specifications.pushTitle?.android || '65 characters'})\n`;
        prompt += `   - Must be attention-grabbing and relevant\n`;
        prompt += `   - Personalization highly recommended\n`;
        prompt += `\n2. Push Body: ${specifications.pushBody?.recommended || '40-125 characters'} (iOS: ${specifications.pushBody?.ios || '178 characters'}, Android: ${specifications.pushBody?.android || '240 characters'})\n`;
        prompt += `   - Should expand on title with additional context\n`;
        prompt += `   - Include clear call-to-action\n`;
      } else if (channel === "tiktok") {
        prompt += `\nTIKTOK SPECIFICATIONS:\n`;
        prompt += `- Caption: ${specifications.caption?.recommended || '100-300 characters'} (max: ${specifications.caption?.max || '2200 characters'})\n`;
        prompt += `- Hashtags: ${specifications.hashtags?.recommended || '3-5 hashtags'} (max: ${specifications.hashtags?.max || '100 characters'})\n`;
        prompt += `- Hook: ${specifications.hook?.recommended || 'First 3 seconds'} (max: ${specifications.hook?.max || '15 words'})\n`;
        prompt += `- Content should be trendy, entertaining, and use popular sounds/effects\n`;
      } else if (channel === "instagram") {
        prompt += `\nINSTAGRAM SPECIFICATIONS:\n`;
        prompt += `- Caption: ${specifications.caption?.recommended || '125-150 characters'} (max: ${specifications.caption?.max || '2200 characters'})\n`;
        prompt += `- Hashtags: ${specifications.hashtags?.recommended || '5-10 hashtags'} (max: ${specifications.hashtags?.max || '30 hashtags'})\n`;
        prompt += `- Stories: ${specifications.stories?.text || 'Max 2 lines'} (${specifications.stories?.recommended || '1-2 words per line'})\n`;
        prompt += `- Content should be visually appealing, engaging, and use appropriate hashtags\n`;
      }
    } else {
      // Standard channel guidelines
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
      prompt += guidelines;
    }
    
    if (characterLimit) {
      prompt += `\nCharacter Limit: ${characterLimit}`;
    }
    
    return prompt;
  }

  private describeLevel(value: number, low: string, high: string): string {
    if (value > 0.5) return `Very ${high}`;
    if (value > 0) return `Somewhat ${high}`;
    if (value < -0.5) return `Very ${low}`;
    if (value < 0) return `Somewhat ${low}`;
    return 'Neutral';
  }

  private describeDirectness(value: number): string {
    if (value > 0.5) return "Be extremely straightforward - no ambiguity, clear statements";
    if (value > 0) return "Be direct but allow for some nuance";
    if (value < -0.5) return "Use more nuanced, layered communication";
    if (value < 0) return "Be somewhat indirect, let meaning emerge";
    return "Balance directness with nuance appropriately";
  }
  
  private describeUniversality(value: number): string {
    if (value > 0.5) return "Use globally accessible language, avoid niche references";
    if (value > 0) return "Lean toward universal language with minimal jargon";
    if (value < -0.5) return "Use specialized language, insider knowledge expected";
    if (value < 0) return "Some specialized terms acceptable";
    return "Balance accessibility with expertise";
  }
  
  private describeAuthority(value: number): string {
    if (value > 0.5) return "Speak with complete confidence as the definitive expert";
    if (value > 0) return "Show confidence while remaining respectful";
    if (value < -0.5) return "Be humble, acknowledge uncertainty where appropriate";
    if (value < 0) return "Show some humility alongside expertise";
    return "Balance authority with approachability";
  }
  
  private describeTension(value: number): string {
    if (value > 0.5) return "Create strong tension: pair everyday words with elevated terms, use juxtaposition";
    if (value > 0) return "Add some linguistic tension and unexpected word choices";
    if (value < -0.5) return "Use straightforward language without creative tension";
    if (value < 0) return "Minimize creative word play";
    return "Moderate use of linguistic tension";
  }
  
  private describeEducation(value: number): string {
    if (value > 0.5) return "Provide deep insight about brands, products, and culture - be highly educational";
    if (value > 0) return "Include educational elements and context";
    if (value < -0.5) return "Minimal educational content - focus on essentials only";
    if (value < 0) return "Light educational context";
    return "Balanced educational approach";
  }
  
  private describeRhythm(value: number): string {
    if (value > 0.5) return "Strong rhythmic variation: mix long/short sentences, use incomplete sentences, apply staccato punctuation";
    if (value > 0) return "Create some rhythmic variety in sentence structure";
    if (value < -0.5) return "Use standard, consistent sentence structure";
    if (value < 0) return "Minimal rhythmic variation";
    return "Moderate rhythmic variation";
  }
  
  private describeSpectrum(value: number): string {
    if (value > 0.6) return "CANDID - Technical/Product tone: Factual, precise, minimal flourish";
    if (value > 0.2) return "BALANCED-CANDID - Product descriptions with some personality";
    if (value > -0.2) return "CENTERED - Pure voice expression";
    if (value > -0.6) return "BALANCED-EXPRESSIVE - Social content with editorial elements";
    return "EXPRESSIVE - Editorial tone: Creative, elevated, maximum personality";
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
        
        // Handle structured email-optimized response
        if (parsed.content && typeof parsed.content === 'object') {
          // Return the structured data directly instead of formatting as text
          return {
            content: parsed.content, // Keep as structured object
            characterCount: parsed.characterCount || 0,
            voiceConsistencyScore: Math.max(0, Math.min(100, parsed.voiceConsistencyScore || 85)),
            suggestions: parsed.suggestions || [
              "Consider adjusting the tone to better match your brand voice",
              "Add more specific details to make the content more engaging",
              "Review the call-to-action for clarity and effectiveness"
            ]
          };
        }
        
        // Handle simple content response
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

// Removed global instance - now requires user API key
