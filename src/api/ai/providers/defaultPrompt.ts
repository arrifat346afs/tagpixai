
export const defaultPromptTemplate = `
You are an expert in generating SEO-optimized metadata for images.

Based on the image, generate a title, a list of keywords, a description, the image type, and the image style.

1. Title :
   - The title must be approximately {{titleLimit}} characters
   - Write only the title and don't include any other text
   - Avoid using colons (:) or any special characters in the title
   - {{placeNameInstruction}}

2. Description:
   - The description must be approximately (Exact {{descLimit}} characters)
   - Write only the description and don't include any other text
   - {{placeNameInstruction}}

3. Keywords:
   - The keywords must be approximately (Exact {{keywordLimit}} keywords)
   - Don't include any words like "vector", "image", "photo", "picture", "illustration", "art", "drawing", "graphic", or "design" in the keywords
   - {{placeNameInstruction}}

Format response exactly as:
Title: [Your generated title]
Description: [Your description]
Keywords: [keyword1, keyword2, keyword3, ...]
`;
