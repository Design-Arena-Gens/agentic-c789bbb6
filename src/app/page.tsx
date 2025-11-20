"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  INTENT_OPTIONS,
  LinkedInAgentInput,
  STARTER_PRESETS,
  TONE_PRESETS,
  generateLinkedInPost,
  LENGTH_OPTIONS,
} from "@/lib/linkedinAgent";

const defaultPreset = STARTER_PRESETS[0];

export default function Home() {
  const [form, setForm] = useState<LinkedInAgentInput>(defaultPreset.payload);
  const [activePreset, setActivePreset] = useState<string>(defaultPreset.name);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [salt, setSalt] = useState(0);

  const result = useMemo(
    () => generateLinkedInPost(form, salt),
    [form, salt],
  );

  const handlePreset = (name: string) => {
    const preset = STARTER_PRESETS.find((item) => item.name === name);
    if (!preset) return;
    setActivePreset(name);
    setForm(preset.payload);
    setSalt((prev) => prev + 1);
  };

  const handleChange = <K extends keyof LinkedInAgentInput>(
    key: K,
    value: LinkedInAgentInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 420));
    setSalt((prev) => prev + 1);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.post);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:px-10 lg:py-16">
        <section className="flex w-full flex-col gap-8 lg:w-[46%]">
          <header className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-300">
              LinkedIn Post Agent
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Craft scroll-stopping LinkedIn posts in a few guided steps.
            </h1>
            <p className="text-sm text-slate-300 md:text-base">
              Feed the agent a target audience, the shift you are naming, and
              the proof that gives it teeth. It orchestrates the hook, narrative
              and CTA in LinkedIn-native cadence.
            </p>
          </header>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Jump start
            </h2>
            <div className="flex flex-wrap gap-2">
              {STARTER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePreset(preset.name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-sky-400/70 hover:text-sky-200 ${
                    preset.name === activePreset
                      ? "border-sky-400 bg-sky-500/10 text-sky-200"
                      : "border-slate-700/70 text-slate-300"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {STARTER_PRESETS.find((preset) => preset.name === activePreset)
                ?.description ?? ""}
            </p>
          </div>

          <form className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/40 backdrop-blur">
            <FieldGroup label="What are you announcing or unpacking?" required>
              <textarea
                value={form.topic}
                onChange={(event) =>
                  handleChange("topic", event.target.value)
                }
                className="field-textarea"
                rows={2}
                placeholder="e.g. Launching an AI copilot for revenue teams"
              />
            </FieldGroup>

            <FieldGroup label="Who do you want leaning in?" required>
              <input
                value={form.audience}
                onChange={(event) =>
                  handleChange("audience", event.target.value)
                }
                className="field-input"
                placeholder="RevOps leaders at growth-stage SaaS companies"
              />
            </FieldGroup>

            <FieldGroup label="Why now / outcome you promise">
              <textarea
                value={form.outcome}
                onChange={(event) =>
                  handleChange("outcome", event.target.value)
                }
                className="field-textarea"
                rows={2}
                placeholder="Help revenue teams close loops between signals and action"
              />
            </FieldGroup>

            <FieldGroup
              label="Key talking points (one per line)"
              hint="Think tension breakers or product shifts to highlight."
            >
              <textarea
                value={form.keyPoints}
                onChange={(event) =>
                  handleChange("keyPoints", event.target.value)
                }
                className="field-textarea"
                rows={4}
                placeholder="Turns messy CRM notes into prioritized plays&#10;Autogenerates follow-up briefs for reps"
              />
            </FieldGroup>

            <FieldGroup
              label="Proof or receipts"
              hint="Numbers, customer signal, lived experience."
            >
              <textarea
                value={form.proofPoints}
                onChange={(event) =>
                  handleChange("proofPoints", event.target.value)
                }
                className="field-textarea"
                rows={3}
                placeholder="Pilot teams reclaimed 7 hours per rep • Beta customers lifted win rates by 8%"
              />
            </FieldGroup>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup label="Intent" required>
                <select
                  value={form.intent}
                  onChange={(event) =>
                    handleChange(
                      "intent",
                      event.target.value as LinkedInAgentInput["intent"],
                    )
                  }
                  className="field-input"
                >
                  {INTENT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">
                  {
                    INTENT_OPTIONS.find((option) => option.id === form.intent)
                      ?.teaser
                  }
                </p>
              </FieldGroup>
              <FieldGroup label="Length">
                <select
                  value={form.length}
                  onChange={(event) =>
                    handleChange(
                      "length",
                      event.target.value as LinkedInAgentInput["length"],
                    )
                  }
                  className="field-input"
                >
                  {LENGTH_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FieldGroup>
            </div>

            <FieldGroup label="Tone / POV">
              <select
                value={form.tone}
                onChange={(event) =>
                  handleChange(
                    "tone",
                    event.target.value as LinkedInAgentInput["tone"],
                  )
                }
                className="field-input"
              >
                {TONE_PRESETS.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.label}
                  </option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Call to action">
              <input
                value={form.callToAction}
                onChange={(event) =>
                  handleChange("callToAction", event.target.value)
                }
                className="field-input"
                placeholder="DM me for early access before the waitlist opens wider."
              />
            </FieldGroup>

            <FieldGroup
              label="Must-use hashtags"
              hint="Comma or newline separated."
            >
              <textarea
                value={form.hashtags}
                onChange={(event) =>
                  handleChange("hashtags", event.target.value)
                }
                className="field-textarea"
                rows={2}
                placeholder="revops, ai, saas"
              />
            </FieldGroup>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Agent reasoning mode
                </p>
                <p className="text-xs text-slate-400">
                  Generates structured narrative & layered rationale.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-progress disabled:bg-sky-500/60"
                disabled={isGenerating}
              >
                {isGenerating ? "Calibrating..." : "Regenerate"}
              </button>
            </div>
          </form>
        </section>

        <section className="flex w-full flex-col gap-6 lg:w-[54%]">
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Post blueprint
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {result.headline}
              </h2>
            </header>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              {result.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700/70 bg-slate-800/70 px-3 py-1 font-medium text-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Final draft
                </h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs font-semibold text-sky-300 transition hover:text-sky-200"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre className="max-h-[420px] whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                {result.post}
              </pre>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.steps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-sky-200">{step.insight}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">
                  {step.output}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Deployment checklist
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.recommendations.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Craft notes
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {result.quickTips.map((tip) => (
                  <li
                    key={tip}
                    className="rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface FieldGroupProps {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}

function FieldGroup({ label, hint, children, required }: FieldGroupProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-200">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
        {required && (
          <span className="rounded-full bg-sky-500/80 px-2 py-0.5 text-[10px] font-bold text-slate-950">
            Required
          </span>
        )}
      </span>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </label>
  );
}
