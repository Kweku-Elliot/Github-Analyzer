"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, GitFork, Users, CalendarDays, BrainCircuit, Loader2, GitGraph } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getRelatedRepos } from "@/app/actions";
import type { Repo } from "@/lib/types";
import { LanguageChart } from "./language-chart";

function formatStat(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export function RepoCard({ repo }: { repo: Repo }) {
  const [contributors, setContributors] = useState<string>("...");
  const [languages, setLanguages] = useState<Record<string, number> | null>(null);
  const [relatedRepos, setRelatedRepos] = useState<string[]>([]);
  const [isFetchingRelated, setIsFetchingRelated] = useState(false);
  const [relatedMessage, setRelatedMessage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchExtraData() {
      // Fetch Contributors
      try {
        const res = await fetch(`${repo.contributors_url}?per_page=1`);
        if (!res.ok) {
          setContributors("N/A");
        } else {
          const linkHeader = res.headers.get('Link');
          if (linkHeader) {
              const lastPageMatch = linkHeader.match(/<.*?&page=(\d+)>; rel="last"/);
              if (lastPageMatch) {
                  setContributors(formatStat(parseInt(lastPageMatch[1], 10)));
              } else {
                const data = await res.json();
                setContributors(Array.isArray(data) ? formatStat(data.length) : 'N/A');
              }
          } else {
            const data = await res.json();
            setContributors(Array.isArray(data) ? formatStat(data.length) : 'N/A');
          }
        }
      } catch (error) {
        setContributors("N/A");
      }

      // Fetch Languages
      try {
        const res = await fetch(repo.languages_url);
        if(res.ok) {
          const data = await res.json();
          if(Object.keys(data).length > 0) {
            setLanguages(data);
          }
        }
      } catch (error) {
        // Silently fail, as this is non-critical
        console.error("Failed to fetch languages", error);
      }
    }
    fetchExtraData();
  }, [repo.contributors_url, repo.languages_url]);

  const handleFetchRelated = async () => {
    setIsFetchingRelated(true);
    setRelatedMessage(null);
    setRelatedRepos([]);
    const result = await getRelatedRepos(repo.full_name);
    if (result.error) {
      setRelatedMessage(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.message) {
      setRelatedMessage(result.message);
      setRelatedRepos(result.data || []);
    } else {
        setRelatedRepos(result.data || []);
    }
    setIsFetchingRelated(false);
  };

  return (
    <Card className="flex flex-col bg-card hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                <CardTitle className="text-xl">
                <Link href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {repo.full_name}
                </Link>
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">{repo.description}</CardDescription>
            </div>
            <Link href={`https://github.com/${repo.owner.login}`} target="_blank" rel="noopener noreferrer">
              <Avatar>
                  <AvatarImage src={repo.owner.avatar_url} alt={`${repo.owner.login} avatar`} />
                  <AvatarFallback>{repo.owner.login.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="flex items-center gap-2" title="Stars">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{formatStat(repo.stargazers_count)}</span>
          <span className="text-muted-foreground">stars</span>
        </div>
        <div className="flex items-center gap-2" title="Forks">
          <GitFork className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{formatStat(repo.forks_count)}</span>
          <span className="text-muted-foreground">forks</span>
        </div>
        <div className="flex items-center gap-2" title="Contributors">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{contributors}</span>
          <span className="text-muted-foreground">contributors</span>
        </div>
        <div className="flex items-center gap-2" title="Last updated">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
        {languages && (
          <div className="col-span-2 mt-4">
              <h4 className="font-semibold mb-2 text-sm">Languages</h4>
              <LanguageChart data={languages} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 pt-4 mt-auto">
        <Separator />
        <div className="w-full">
            <div className="flex items-center justify-between w-full gap-4">
                <h4 className="font-semibold flex items-center gap-2 text-primary"><BrainCircuit className="w-5 h-5" /> AI Suggestions</h4>
                <Button onClick={handleFetchRelated} disabled={isFetchingRelated} size="sm" className="bg-accent/10 text-accent-foreground hover:bg-accent/20 border border-accent/20">
                {isFetchingRelated ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitGraph className="mr-2 h-4 w-4" />}
                Suggest
                </Button>
            </div>
            {isFetchingRelated && <p className="text-sm text-muted-foreground mt-2 animate-pulse">Finding related repositories...</p>}
            {relatedMessage && <p className="text-sm text-muted-foreground mt-2">{relatedMessage}</p>}
            {!isFetchingRelated && relatedRepos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {relatedRepos.map((name) => (
                        <a href={`https://github.com/${name}`} target="_blank" rel="noopener noreferrer" key={name}>
                          <Badge variant="secondary" className="font-mono hover:bg-primary/10 hover:border-primary/20 cursor-pointer">
                              {name}
                          </Badge>
                        </a>
                    ))}
                </div>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
