import { Mistral } from "@mistralai/mistralai";
import { ProcessingSettings } from "@/services/batch-processing/types";

export interface AIAnalysisResult {
  title: string;
  description: string;
  keywords: string[];
}

function parseAIResponse(response: string): AIAnalysisResult {
  // Assuming the AI response follows our prompted format
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

  return {
    title,
    description,
    keywords
  };
}

export async function analyzeImage(
  imageBase64: string,
  settings: ProcessingSettings
): Promise<AIAnalysisResult> {
  console.log('Initializing AI client with settings:', settings)
  const client = new Mistral({ apiKey: settings.api.apiKey })
  
  // Calculate approximate size in MB
  const imageSizeInMB = (imageBase64.length * 3/4) / (1024 * 1024);
  
  // If image is larger than 10MB, resize it before sending
  if (imageSizeInMB > 10) {
    console.log(`Image size (${imageSizeInMB.toFixed(2)}MB) exceeds recommended limit. Compressing...`);
    throw new Error('Image file is too large. Please use an image smaller than 10MB.');
  }

  const prompt = `Please analyze this image and generate:
1. A title (maximum ${settings.metadata.titleLimit} characters)
2. A description (maximum ${settings.metadata.descriptionLimit} characters)
3. Up to ${settings.metadata.keywordLimit} relevant keywords

Please format the response exactly as:
Title: [your title]
Description: [your description]
Keywords: [comma-separated keywords]`

  console.log('Sending request to AI API...')
  try {
    const chatResponse = await client.chat.complete({
      model: settings.api.model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              imageUrl: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ]
    })

    console.log('Received response from AI API')
    
    if (!chatResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response received')
    }

    const content = chatResponse.choices[0].message.content
    console.log('Parsing AI response:', content)
    
    return parseAIResponse(typeof content === 'string' ? content : content.map(chunk => 
      'text' in chunk ? chunk.text : ''
    ).join(''))
  } catch (error) {
    console.error('AI API error:', error)
    throw new Error(`AI API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
