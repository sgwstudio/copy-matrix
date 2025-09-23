import { BrandVoiceMatrix as VoiceMatrix } from "./gemini-client";

export interface VoiceAnalysisResult {
  consistencyScore: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export class VoiceAnalyzer {
  static analyzeConsistency(content: string, targetVoice: VoiceMatrix): VoiceAnalysisResult {
    const analysis = this.analyzeTextCharacteristics(content);
    const consistencyScore = this.calculateConsistencyScore(analysis, targetVoice);
    const recommendations = this.generateRecommendations(analysis, targetVoice);
    const strengths = this.identifyStrengths(analysis, targetVoice);
    const weaknesses = this.identifyWeaknesses(analysis, targetVoice);

    return {
      consistencyScore,
      recommendations,
      strengths,
      weaknesses,
    };
  }

  private static analyzeTextCharacteristics(content: string) {
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      // Formality indicators
      formalWords: this.countFormalWords(words),
      casualWords: this.countCasualWords(words),
      contractions: this.countContractions(content),
      
      // Authority indicators
      imperativeSentences: this.countImperativeSentences(sentences),
      questionSentences: this.countQuestionSentences(sentences),
      
      // Professional indicators
      technicalTerms: this.countTechnicalTerms(words),
      buzzwords: this.countBuzzwords(words),
      
      // Tone indicators
      exclamationMarks: (content.match(/!/g) || []).length,
      questionMarks: (content.match(/\?/g) || []).length,
      
      // Confidence indicators
      certaintyWords: this.countCertaintyWords(words),
      hedgeWords: this.countHedgeWords(words),
      
      // Enthusiasm indicators
      positiveWords: this.countPositiveWords(words),
      negativeWords: this.countNegativeWords(words),
      
      // Empathy indicators
      personalPronouns: this.countPersonalPronouns(words),
      emotionalWords: this.countEmotionalWords(words),
    };
  }

  private static calculateConsistencyScore(analysis: any, targetVoice: VoiceMatrix): number {
    let score = 100;
    
    // Directness consistency (mapped from formality)
    const formalityScore = this.calculateFormalityScore(analysis);
    score -= Math.abs(formalityScore - targetVoice.directness) * 20;
    
    // Authority consistency
    const authorityScore = this.calculateAuthorityScore(analysis);
    score -= Math.abs(authorityScore - targetVoice.authority) * 20;
    
    // Universality consistency (mapped from professional)
    const professionalScore = this.calculateProfessionalScore(analysis);
    score -= Math.abs(professionalScore - targetVoice.universality) * 20;
    
    // Expressive/Candid consistency (mapped from tone)
    const toneScore = this.calculateToneScore(analysis);
    score -= Math.abs(toneScore - targetVoice.expressiveCandid) * 20;
    
    // Tension consistency (mapped from confidence)
    const confidenceScore = this.calculateConfidenceScore(analysis);
    score -= Math.abs(confidenceScore - targetVoice.tension) * 15;
    
    // Education consistency (mapped from enthusiasm)
    const enthusiasmScore = this.calculateEnthusiasmScore(analysis);
    score -= Math.abs(enthusiasmScore - targetVoice.education) * 15;
    
    // Rhythm consistency (mapped from empathy)
    const empathyScore = this.calculateEmpathyScore(analysis);
    score -= Math.abs(empathyScore - targetVoice.rhythm) * 15;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static generateRecommendations(analysis: any, targetVoice: VoiceMatrix): string[] {
    const recommendations: string[] = [];
    
    if (targetVoice.directness > 0 && analysis.casualWords > analysis.formalWords) {
      recommendations.push("Use more direct language and avoid contractions");
    } else if (targetVoice.directness < 0 && analysis.formalWords > analysis.casualWords) {
      recommendations.push("Use more nuanced language and contractions");
    }
    
    if (targetVoice.authority > 0 && analysis.questionSentences > analysis.imperativeSentences) {
      recommendations.push("Use more direct, authoritative statements");
    } else if (targetVoice.authority < 0 && analysis.imperativeSentences > analysis.questionSentences) {
      recommendations.push("Use more questions and collaborative language");
    }
    
    if (targetVoice.expressiveCandid > 0 && analysis.exclamationMarks > 2) {
      recommendations.push("Reduce exclamation marks for a more candid tone");
    } else if (targetVoice.expressiveCandid < 0 && analysis.exclamationMarks < 1) {
      recommendations.push("Add more expressive language with exclamation marks");
    }
    
    return recommendations;
  }

  private static identifyStrengths(analysis: any, targetVoice: VoiceMatrix): string[] {
    const strengths: string[] = [];
    
    if (Math.abs(this.calculateFormalityScore(analysis) - targetVoice.directness) < 0.2) {
      strengths.push("Good directness level");
    }
    
    if (Math.abs(this.calculateAuthorityScore(analysis) - targetVoice.authority) < 0.2) {
      strengths.push("Appropriate authority level");
    }
    
    return strengths;
  }

  private static identifyWeaknesses(analysis: any, targetVoice: VoiceMatrix): string[] {
    const weaknesses: string[] = [];
    
    if (Math.abs(this.calculateFormalityScore(analysis) - targetVoice.directness) > 0.5) {
      weaknesses.push("Directness level needs adjustment");
    }
    
    if (Math.abs(this.calculateAuthorityScore(analysis) - targetVoice.authority) > 0.5) {
      weaknesses.push("Authority level needs adjustment");
    }
    
    return weaknesses;
  }

  // Helper methods for text analysis
  private static countFormalWords(words: string[]): number {
    const formalWords = ['utilize', 'facilitate', 'implement', 'establish', 'comprehensive', 'subsequent'];
    return words.filter(word => formalWords.includes(word)).length;
  }

  private static countCasualWords(words: string[]): number {
    const casualWords = ['awesome', 'cool', 'yeah', 'gonna', 'wanna', 'gotta'];
    return words.filter(word => casualWords.includes(word)).length;
  }

  private static countContractions(content: string): number {
    return (content.match(/'[a-z]/g) || []).length;
  }

  private static countImperativeSentences(sentences: string[]): number {
    return sentences.filter(s => s.trim().endsWith('.') && !s.includes('?')).length;
  }

  private static countQuestionSentences(sentences: string[]): number {
    return sentences.filter(s => s.includes('?')).length;
  }

  private static countTechnicalTerms(words: string[]): number {
    const techTerms = ['algorithm', 'optimization', 'implementation', 'infrastructure', 'methodology'];
    return words.filter(word => techTerms.includes(word)).length;
  }

  private static countBuzzwords(words: string[]): number {
    const buzzwords = ['synergy', 'leverage', 'paradigm', 'disrupt', 'innovative'];
    return words.filter(word => buzzwords.includes(word)).length;
  }

  private static countCertaintyWords(words: string[]): number {
    const certaintyWords = ['definitely', 'certainly', 'absolutely', 'guaranteed', 'proven'];
    return words.filter(word => certaintyWords.includes(word)).length;
  }

  private static countHedgeWords(words: string[]): number {
    const hedgeWords = ['maybe', 'perhaps', 'might', 'could', 'possibly'];
    return words.filter(word => hedgeWords.includes(word)).length;
  }

  private static countPositiveWords(words: string[]): number {
    const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'wonderful'];
    return words.filter(word => positiveWords.includes(word)).length;
  }

  private static countNegativeWords(words: string[]): number {
    const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'disappointing'];
    return words.filter(word => negativeWords.includes(word)).length;
  }

  private static countPersonalPronouns(words: string[]): number {
    const pronouns = ['i', 'you', 'we', 'us', 'our', 'your'];
    return words.filter(word => pronouns.includes(word)).length;
  }

  private static countEmotionalWords(words: string[]): number {
    const emotionalWords = ['feel', 'emotion', 'heart', 'soul', 'passion', 'love'];
    return words.filter(word => emotionalWords.includes(word)).length;
  }

  // Scoring methods
  private static calculateFormalityScore(analysis: any): number {
    const formalRatio = analysis.formalWords / (analysis.formalWords + analysis.casualWords + 1);
    const contractionRatio = analysis.contractions / (analysis.contractions + 10);
    return (formalRatio - contractionRatio) * 2 - 1;
  }

  private static calculateAuthorityScore(analysis: any): number {
    const imperativeRatio = analysis.imperativeSentences / (analysis.imperativeSentences + analysis.questionSentences + 1);
    return (imperativeRatio - 0.5) * 2;
  }

  private static calculateProfessionalScore(analysis: any): number {
    const techRatio = analysis.technicalTerms / (analysis.technicalTerms + analysis.buzzwords + 1);
    return (techRatio - 0.5) * 2;
  }

  private static calculateToneScore(analysis: any): number {
    const exclamationRatio = analysis.exclamationMarks / (analysis.exclamationMarks + 5);
    return (exclamationRatio - 0.5) * 2;
  }

  private static calculateConfidenceScore(analysis: any): number {
    const certaintyRatio = analysis.certaintyWords / (analysis.certaintyWords + analysis.hedgeWords + 1);
    return (certaintyRatio - 0.5) * 2;
  }

  private static calculateEnthusiasmScore(analysis: any): number {
    const positiveRatio = analysis.positiveWords / (analysis.positiveWords + analysis.negativeWords + 1);
    return (positiveRatio - 0.5) * 2;
  }

  private static calculateEmpathyScore(analysis: any): number {
    const pronounRatio = analysis.personalPronouns / (analysis.personalPronouns + 10);
    const emotionalRatio = analysis.emotionalWords / (analysis.emotionalWords + 10);
    return ((pronounRatio + emotionalRatio) / 2 - 0.5) * 2;
  }
}
