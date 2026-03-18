'use server';
/**
 * @fileOverview Provides an AI-powered tool to generate detailed explanations for incorrect answers in driving theory practice tests.
 *
 * - explainIncorrectAnswer - A function that generates an AI-powered explanation for an incorrect answer.
 * - ExplanationInput - The input type for the explainIncorrectAnswer function.
 * - ExplanationOutput - The return type for the explainIncorrectAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplanationInputSchema = z.object({
  question: z.string().describe('The driving theory question asked.'),
  userAnswer: z.string().describe('The answer provided by the user, which was incorrect.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type ExplanationInput = z.infer<typeof ExplanationInputSchema>;

const ExplanationOutputSchema = z.object({
  detailedExplanation: z.string().describe('A detailed, AI-generated explanation for why the user\'s answer was incorrect and why the provided correct answer is right, covering underlying concepts and reasoning.'),
});
export type ExplanationOutput = z.infer<typeof ExplanationOutputSchema>;

export async function explainIncorrectAnswer(input: ExplanationInput): Promise<ExplanationOutput> {
  return aiPoweredExplanationToolFlow(input);
}

const aiPoweredExplanationPrompt = ai.definePrompt({
  name: 'aiPoweredExplanationPrompt',
  input: { schema: ExplanationInputSchema },
  output: { schema: ExplanationOutputSchema },
  prompt: `You are an expert driving theory instructor. Your task is to provide a detailed, AI-generated explanation for an incorrect answer given by a learner taking a practice test.\n\nThe explanation should clearly:\n1.  Explain why the user\'s answer was incorrect.\n2.  Explain why the correct answer is indeed correct, elaborating on the underlying driving theory concepts, road signs, or hazard perception rules relevant to the question.\n3.  Focus on educational value to help the learner understand the reasoning and improve their knowledge.\n\nHere is the information:\nQuestion: "{{{question}}}"\nUser's Answer: "{{{userAnswer}}}"\nCorrect Answer: "{{{correctAnswer}}}"\n\nProvide the detailed explanation in the 'detailedExplanation' field.`,
});

const aiPoweredExplanationToolFlow = ai.defineFlow(
  {
    name: 'aiPoweredExplanationToolFlow',
    inputSchema: ExplanationInputSchema,
    outputSchema: ExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await aiPoweredExplanationPrompt(input);
    return output!;
  }
);
