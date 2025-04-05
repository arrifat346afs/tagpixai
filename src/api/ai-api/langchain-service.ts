import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, MessageContentImageUrl } from "@langchain/core/messages";
import type { ProcessingSettings } from "@/services/batch-processing/types";
import type { AIAnalysisResult } from "./index";

export class LangChainService {
    private model: ChatMistralAI;

    constructor(settings: ProcessingSettings) {
        this.model = new ChatMistralAI({
            apiKey: settings.api.apiKey,
            modelName: settings.api.model
        });
    }

    private parseAIResponse(response: string): AIAnalysisResult {
        const lines = response.split('\n');
        let title = '';
        let description = '';
        let keywords: string[] = [];

        for (const line of lines) {
            if (line.startsWith('1.') || line.toLowerCase().includes('title:')) {
                title = line.replace(/^1\.\s*|title:\s*/i, '').trim();
            } else if (line.startsWith('2.') || line.toLowerCase().includes('description:')) {
                description = line.replace(/^2\.\s*|description:\s*/i, '').trim();
            } else if (line.startsWith('3.') || line.toLowerCase().includes('keywords:')) {
                const keywordText = line.replace(/^3\.\s*|keywords:\s*/i, '').trim();
                keywords = keywordText.split(',').map(k => k.trim()).filter(k => k.length > 0);
            }
        }

        return { title, description, keywords };
    }

    async analyzeImage(
        imageBase64: string,
        settings: ProcessingSettings
    ): Promise<AIAnalysisResult> {
        const imageSizeInMB = (imageBase64.length * 3/4) / (1024 * 1024);

        if (imageSizeInMB > 4) {
            throw new Error('Image file is too large. The image should be automatically resized to 225px, but it may be too complex for AI processing.');
        }

        console.log(`Sending image to AI model (${imageSizeInMB.toFixed(2)}MB)`);

        const prompt = `Please analyze this image and generate:
        1. A title (maximum ${settings.metadata.titleLimit} characters)
        2. A description (maximum ${settings.metadata.descriptionLimit} characters)
        3. Up to ${settings.metadata.keywordLimit} relevant keywords

        Please format the response exactly as:
        Title: [Main Subject] + [Descriptive Detail] – [Engaging, Natural Hook that Highlights Beauty or Emotion]
        Description: [your description]
        Keywords: [comma-separated keywords]`;

        try {
            const imageContent: MessageContentImageUrl = {
                type: "image_url",
                image_url: `data:image/jpeg;base64,${imageBase64}`
            };

            const response = await this.model.invoke([
                new HumanMessage({
                    content: [
                        { type: "text", text: prompt },
                        imageContent
                    ]
                })
            ]);

            const text = Array.isArray(response.content)
                ? response.content.map(c => c.type === 'text' ? c.text : '').join(' ')
                : String(response.content);
            return this.parseAIResponse(text);
        } catch (error) {
            console.error('LangChain AI error:', error);
            throw new Error(`AI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}