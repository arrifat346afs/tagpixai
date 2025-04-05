import { LangChainService } from './langchain-service';
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
    const langChainService = new LangChainService(settings);
    return langChainService.analyzeImage(imageBase64, settings);
}