"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Save, RotateCcw } from "lucide-react";

type ContentType = "blog" | "social" | "email" | "ad_copy";

interface GeneratedContent {
  title: string;
  content: string;
}

interface ContentGeneratorProps {
  onSaved?: () => void;
}

const STEPS = ["Type", "Details", "Generate", "Review"] as const;

const typeDescriptions: Record<ContentType, string> = {
  blog: "SEO-optimized blog post with headings and call to action",
  social: "Engaging social media post with hashtags",
  email: "Marketing email with subject line and body",
  ad_copy: "Advertising copy with headline and persuasive text",
};

const platformOptions: Record<ContentType, string[]> = {
  blog: ["wordpress", "medium", "website"],
  social: ["twitter", "facebook", "instagram", "linkedin"],
  email: ["newsletter", "promotional", "onboarding"],
  ad_copy: ["google_ads", "meta_ads", "linkedin_ads"],
};

export function ContentGenerator({ onSaved }: ContentGeneratorProps) {
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<ContentType>("blog");
  const [platform, setPlatform] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [tone, setTone] = React.useState("professional");
  const [audience, setAudience] = React.useState("homeowners");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [generated, setGenerated] = React.useState<GeneratedContent | null>(null);
  const [editedTitle, setEditedTitle] = React.useState("");
  const [editedContent, setEditedContent] = React.useState("");
  const [error, setError] = React.useState("");
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return topic.trim().length > 0;
    if (step === 2) return generated !== null;
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/marketing/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, platform: platform || undefined, topic, tone, audience }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setGenerated(data.data);
      setEditedTitle(data.data.title);
      setEditedContent(data.data.content);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: editedTitle,
          content: editedContent,
          platform: platform || null,
          aiGenerated: true,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSaveSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setType("blog");
    setPlatform("");
    setTopic("");
    setTone("professional");
    setAudience("homeowners");
    setGenerated(null);
    setEditedTitle("");
    setEditedContent("");
    setError("");
    setSaveSuccess(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#00B4A0]" />
          AI Content Generator
        </CardTitle>
        <div className="flex items-center gap-2 pt-2">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div
                className={`flex items-center gap-1.5 text-sm ${
                  i <= step
                    ? "text-[#00B4A0] font-medium"
                    : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    i < step
                      ? "bg-[#00B4A0] text-white"
                      : i === step
                      ? "border-2 border-[#00B4A0] text-[#00B4A0]"
                      : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Select content type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(typeDescriptions) as ContentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setPlatform("");
                  }}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    type === t
                      ? "border-[#00B4A0] bg-[#00B4A0]/5"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--ring))]"
                  }`}
                >
                  <div className="font-medium capitalize">{t.replace("_", " ")}</div>
                  <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {typeDescriptions[t]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue placeholder="Select platform (optional)" /></SelectTrigger>
                <SelectContent>
                  {platformOptions[type].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Subject</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Spring home maintenance checklist"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., first-time homeowners"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <h4 className="font-medium">Generation Summary</h4>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Type</dt>
                  <dd className="font-medium capitalize">{type.replace("_", " ")}</dd>
                </div>
                {platform && (
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--muted-foreground))]">Platform</dt>
                    <dd className="font-medium capitalize">{platform.replace("_", " ")}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Topic</dt>
                  <dd className="font-medium">{topic}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Tone</dt>
                  <dd className="font-medium capitalize">{tone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--muted-foreground))]">Audience</dt>
                  <dd className="font-medium">{audience}</dd>
                </div>
              </dl>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        )}

        {step === 3 && generated && (
          <div className="space-y-4">
            {saveSuccess ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Content saved successfully!
                </p>
                <Button variant="outline" className="mt-3" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  Generate More
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editContent">Content</Label>
                  <Textarea
                    id="editContent"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save to Library
                  </Button>
                  <Button variant="outline" onClick={() => { setStep(2); setGenerated(null); }}>
                    <RotateCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!saveSuccess && (
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || generating}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 2 && (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
