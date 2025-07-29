"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SearchIcon, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RepoCard } from "@/components/repo-card";
import { RepoCardSkeleton } from "@/components/repo-card-skeleton";
import type { Repo } from "@/lib/types";

const formSchema = z.object({
  query: z.string().min(1, "Please enter a GitHub username or repository."),
});

export function GithubSearch() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setRepos([]);
    setSearched(true);

    try {
      const { query } = values;
      const isRepo = query.includes("/");
      const url = isRepo
        ? `https://api.github.com/repos/${query}`
        : `https://api.github.com/users/${query}/repos?sort=updated&per_page=10`;

      const response = await fetch(url);

      if (response.status === 404) {
        setError("Repository or user not found. Please check the name and try again.");
        setLoading(false);
        return;
      }
      
      if (response.status === 403) {
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'later';
        setError(`API rate limit exceeded. Please try again ${resetTime}.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("An unexpected error occurred while fetching data.");
      }

      const data = await response.json();
      setRepos(isRepo ? [data] : data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-start">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="e.g., vercel/next.js or torvalds" {...field} className="text-base"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" disabled={loading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <SearchIcon className="mr-2 h-5 w-5" /> Search
          </Button>
        </form>
      </Form>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2">
          <RepoCardSkeleton />
          <RepoCardSkeleton />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && repos.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      {!loading && !error && repos.length === 0 && searched && (
        <div className="text-center py-10 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No repositories found for this query.</p>
        </div>
      )}
    </div>
  );
}
