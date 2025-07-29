export interface Repo {
  id: number;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  contributors_url: string;
  languages_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}
