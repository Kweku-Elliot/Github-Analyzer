'use server';

import { suggestRelatedRepos } from '@/ai/flows/suggest-related-repos';

export async function getRelatedRepos(repoName: string) {
  try {
    const suggestions = await suggestRelatedRepos(repoName);
    if (!suggestions || suggestions.length === 0) {
      return { data: [], message: 'No suggestions found for this repository.' };
    }
    return { data: suggestions };
  } catch (error) {
    console.error('Error fetching related repos:', error);
    return { error: 'Failed to fetch related repositories. Please try again later.' };
  }
}
