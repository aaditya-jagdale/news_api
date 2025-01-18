import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../../config.json' assert { type: 'json' };

export class ContentGenerator {
  static instance;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ContentGenerator();
    }
    return this.instance;
  }

  constructor() {
    const genAI = new GoogleGenerativeAI(config.gemini_api_key);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async generate(products, prompt = "Please generate a professional and concise news article written in a journalistic tone. The article should be factual, neutral, and clear. Ensure the content is under 100 words and includes the following elements: 1. A compelling headline (title). 2. A concise body that captures the key facts in an informative, unbiased, and readable manner. 3. Do not use sensational or overly promotional language. 4. Return the output as plain text, with the title and body clearly separated. Provide the result in a JSON format: { 'title': 'headline', 'body': 'news content' }") {
    const results = [];

    for (const product of products) {
        try {
            // Generate content using the model
            const result = await this.model.generateContent(`${prompt}: ${JSON.stringify(product)}`);
            let responseText = result.response.text();

            // Debugging: Log the raw response to check what is returned
            console.log("Raw response:", responseText);

            // Step 1: Remove unwanted markdown or non-JSON content
            const sanitizedResponse = responseText
                .replace(/```(?:json)?\s*/g, '')  // Remove starting ```json or ```` marks
                .replace(/\s*```/g, '')           // Remove closing ```
                .trim();                         // Trim extra whitespace

            // Step 2: Ensure the response is valid JSON
            if (!sanitizedResponse.startsWith('{') || !sanitizedResponse.endsWith('}')) {
                throw new Error("The response does not appear to be valid JSON.");
            }

            // Step 3: Try parsing the cleaned response as JSON
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(sanitizedResponse);
            } catch (error) {
                // Log error if parsing fails, and continue to the next product
                console.error("Error parsing the response as JSON:", error);
                continue;  // Skip this iteration and move on to the next product
            }

            // Extract title and body from parsed JSON
            const { title, body } = parsedResponse;

            // Add the generated content to results
            if (title && body) {
                results.push({ ...product, title, content: body });
            }

            // Delay for 5 seconds to avoid rate limiting
            await this.delay(5000);
        } catch (error) {
            // Catch any other errors (e.g., network issues, model issues, etc.)
            console.error("Error during content generation:", error);
            continue; // Skip to the next product in case of any error
        }
    }

    // Return only the valid results (non-empty titles and bodies)
    return results.filter(item => item.title && item.content);
}




}
