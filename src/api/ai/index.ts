import { LangChainService } from './providers/LangChain/langchain-service';
import { GroqService } from './providers/Groq/groq-service';
import type { ProcessingSettings } from "@/services/batch-processing/types";

export interface AIAnalysisResult {
    title: string;
    description: string;
    keywords: string[];
}

export async function analyzeImage(
    imageBase64: string,
    settings: ProcessingSettings
): Promise<AIAnalysisResult> {
    // Use the appropriate service based on the provider
    if (settings.api.provider === "Groq") {
        const groqService = new GroqService(settings);
        return groqService.analyzeImage(imageBase64, settings);
    } else {
        const langChainService = new LangChainService(settings);
        return langChainService.analyzeImage(imageBase64, settings);
    }
}



