
'use server';
/**
 * @fileOverview Provides AI-powered deep dives and explanations for driving theory topics.
 *
 * - explainTheoryTopic - A function that generates an AI-powered explanation for a theory module.
 * - TheoryInput - The input type for the explainTheoryTopic function.
 * - TheoryOutput - The return type for the explainTheoryTopic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TheoryInputSchema = z.object({
  topicTitle: z.string().describe('The title of the theory lesson (e.g. Road & Traffic Signs).'),
  topicDescription: z.string().describe('The core description of the module.'),
  specificSignDescription: z.string().optional().describe('A specific sign or concept to focus on if applicable.'),
});
export type TheoryInput = z.infer<typeof TheoryInputSchema>;

const TheoryOutputSchema = z.object({
  deepDiveExplanation: z.string().describe('A high-performance, structured explanation of the theory topic, covering official rules, common mistakes, and expert tips.'),
});
export type TheoryOutput = z.infer<typeof TheoryOutputSchema>;

export async function explainTheoryTopic(input: TheoryInput): Promise<TheoryOutput> {
  return theoryExplanationToolFlow(input);
}

const theoryExplanationPrompt = ai.definePrompt({
  name: 'theoryExplanationPrompt',
  input: { schema: TheoryInputSchema },
  output: { schema: TheoryOutputSchema },
  prompt: `You are an elite driving instructor for the SmartPass platform. Your task is to provide a high-performance deep dive into a theory topic.

Topic: "{{{topicTitle}}}"
Summary: "{{{topicDescription}}}"
{{#if specificSignDescription}}Focus Area: "{{{specificSignDescription}}}"{{/if}}

Your explanation should be:
1.  **Professional & Direct**: Avoid filler. Focus on official rules and high-impact knowledge.
2.  **Structured**: Use clear sections for "Key Concepts", "Expert Road Tips", and "Common Pass Errors".
3.  **Encouraging**: Motivate the learner to build absolute mastery.

Provide the deep dive in the 'deepDiveExplanation' field.`,
});

const theoryExplanationToolFlow = ai.defineFlow(
  {
    name: 'theoryExplanationToolFlow',
    inputSchema: TheoryInputSchema,
    outputSchema: TheoryOutputSchema,
  },
  async (input) => {
    const { output } = await theoryExplanationPrompt(input);
    return output!;
  }
);
