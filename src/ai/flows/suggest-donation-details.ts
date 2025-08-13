
'use server';
/**
 * @fileOverview An AI flow to suggest details for a food donation.
 *
 * - suggestDonationDetails - A function that suggests a title and description for a donation based on a photo.
 * - SuggestDonationDetailsInput - The input type for the suggestDonationDetails function.
 * - SuggestDonationDetailsOutput - The return type for the suggestDonationDetails function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

export type SuggestDonationDetailsInput = z.infer<typeof SuggestDonationDetailsInputSchema>;
const SuggestDonationDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type SuggestDonationDetailsOutput = z.infer<typeof SuggestDonationDetailsOutputSchema>;
const SuggestDonationDetailsOutputSchema = z.object({
  suggestedTitle: z.string().describe('A concise, appealing title for the food donation listing. For example, "Homestyle Vegetable Curry" or "Freshly Baked Loaf of Bread".'),
  suggestedDescription: z.string().describe('A brief, friendly description of the food item. For example, "A delicious and healthy vegetable curry made with fresh, local ingredients. Perfect for a family meal."'),
  calories: z.string().describe("An estimated calorie count for a single serving. e.g., '350 kcal'"),
  fat: z.string().describe("An estimated fat content for a single serving. e.g., '15g'"),
  energy: z.string().describe("An estimated energy value in kilojoules. e.g., '1464 kJ'"),
});


const suggestDonationPrompt = ai.definePrompt({
  name: 'suggestDonationPrompt',
  model: googleAI.model('gemini-2.5-flash'),
  input: {schema: SuggestDonationDetailsInputSchema},
  output: {schema: SuggestDonationDetailsOutputSchema},
  prompt: `You are an expert at creating appealing food donation listings.
  
  Based on the provided image, generate a short, catchy title and a brief, friendly description for the food donation.
  
  Also, provide a rough estimate of the nutritional information per serving for calories, fat, and energy.
  
  Make the title and description sound appealing and appetizing to encourage people to reserve it.
  
  Image: {{media url=photoDataUri}}
  `,
});

const suggestDonationDetailsFlow = ai.defineFlow(
  {
    name: 'suggestDonationDetailsFlow',
    inputSchema: SuggestDonationDetailsInputSchema,
    outputSchema: SuggestDonationDetailsOutputSchema,
  },
  async input => {
    const {output} = await suggestDonationPrompt(input);
    return output!;
  }
);


export async function suggestDonationDetails(
  input: SuggestDonationDetailsInput
): Promise<SuggestDonationDetailsOutput> {
  return suggestDonationDetailsFlow(input);
}
