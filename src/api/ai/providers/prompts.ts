import type { ProcessingSettings } from "@/services/batch-processing/types";

const prompts = (settings: ProcessingSettings) => {
  const basePrompt = {
    titleLimit: settings.metadata.titleLimit,
    descLimit: settings.metadata.descriptionLimit,
    keywordLimit: settings.metadata.keywordLimit
  };

  const placeNameInstruction = settings.metadata.includePlaceName
    ? "Include specific place names and locations where relevant."
    : "Do not include specific place names or locations.";

  return `Please analyze this image and provide the following:

1. Title (Exact ${basePrompt.titleLimit} chars):
   - Focus on [Main Subject] [Descriptive Detail] [Engaging Hook]
   - ${placeNameInstruction}

2. Description (Exact ${basePrompt.descLimit} chars):
   - ${placeNameInstruction}

3. Keywords (Exact ${basePrompt.keywordLimit}):
   - Relevant, comma-separated terms
   - ${placeNameInstruction}

Format response exactly as:
Title: [Your generated title]
Description: [Your description]
Keywords: [keyword1, keyword2, keyword3, ...]`;
};

export default prompts;



