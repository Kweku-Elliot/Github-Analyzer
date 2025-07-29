'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting related GitHub repositories based on a given repository name.
 *
 * @exports suggestRelatedRepos - An async function that takes a repository name as input and returns a list of suggested related repositories.
 * @exports SuggestRelatedReposInput - The input type for the suggestRelatedRepos function, which is a string representing the repository name.
 * @exports SuggestRelatedReposOutput - The output type for the suggestRelatedRepos function, which is an array of strings representing the names of related repositories.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedReposInputSchema = z.string().describe('The name of the GitHub repository to find related repositories for (e.g., torvalds/linux).');
export type SuggestRelatedReposInput = z.infer<typeof SuggestRelatedReposInputSchema>;

const SuggestRelatedReposOutputSchema = z.array(z.string()).describe('An array of names of related GitHub repositories.');
export type SuggestRelatedReposOutput = z.infer<typeof SuggestRelatedReposOutputSchema>;

export async function suggestRelatedRepos(repoName: SuggestRelatedReposInput): Promise<SuggestRelatedReposOutput> {
  return suggestRelatedReposFlow(repoName);
}

const suggestRelatedReposPrompt = ai.definePrompt({
  name: 'suggestRelatedReposPrompt',
  input: {schema: SuggestRelatedReposInputSchema},
  output: {schema: SuggestRelatedReposOutputSchema},
  prompt: `You are a helpful assistant that suggests related GitHub repositories based on a given repository name.

  The user will provide a repository name, and you should return an array of related repository names.
  The repository names should be in the format "owner/repo".

  Repository Name: {{{repoName}}}

  Related Repositories:`,
});

const suggestRelatedReposFlow = ai.defineFlow(
  {
    name: 'suggestRelatedReposFlow',
    inputSchema: SuggestRelatedReposInputSchema,
    outputSchema: SuggestRelatedReposOutputSchema,
  },
  async repoName => {
    const {output} = await suggestRelatedReposPrompt(repoName);
    return output!;
  }
);
