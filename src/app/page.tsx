import { Github } from "lucide-react";
import { GithubSearch } from "@/components/github-search";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Github className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              RepoLook
            </h1>
          </div>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Enter a GitHub username or repository (e.g., "vercel/next.js") to see key statistics and discover related projects.
          </p>
        </header>
        <GithubSearch />
      </div>
    </main>
  );
}
