type PostLength = "short" | "standard" | "long";

export interface LinkedInAgentInput {
  topic: string;
  audience: string;
  outcome: string;
  keyPoints: string;
  proofPoints: string;
  tone: string;
  callToAction: string;
  hashtags: string;
  intent: ContentIntent;
  length: PostLength;
}

export interface LinkedInAgentStep {
  title: string;
  insight: string;
  output: string;
}

export interface LinkedInAgentResult {
  headline: string;
  post: string;
  hashtags: string[];
  steps: LinkedInAgentStep[];
  recommendations: string[];
  quickTips: string[];
}

export type ContentIntent = "awareness" | "launch" | "insight" | "hiring";

const TONE_LIBRARY: Record<
  string,
  {
    label: string;
    hookVerbs: string[];
    vibe: string;
    cadence: string;
    closingFlair: string;
  }
> = {
  "professional-optimistic": {
    label: "Professional · Optimistic",
    hookVerbs: ["unlocking", "accelerating", "reshaping", "elevating"],
    vibe: "warm authority",
    cadence: "balanced sentences with confident verbs",
    closingFlair: "Let's build what's next together.",
  },
  "insightful-mentor": {
    label: "Insightful · Mentor",
    hookVerbs: ["learned", "noticed", "realized", "discovered"],
    vibe: "reflective storytelling",
    cadence: "short reflections leading into a lesson",
    closingFlair: "Curious how others are tackling this.",
  },
  "bold-visionary": {
    label: "Bold · Visionary",
    hookVerbs: ["reimagining", "reinventing", "challenging", "transforming"],
    vibe: "future-facing energy",
    cadence: "high-impact phrases with momentum",
    closingFlair: "Let's push the conversation forward.",
  },
  "community-builder": {
    label: "Community · Collaborative",
    hookVerbs: ["rallying", "bringing together", "co-creating", "supporting"],
    vibe: "inclusive enthusiasm",
    cadence: "inviting statements with shared ownership",
    closingFlair: "Drop a note if you want to jam on this.",
  },
};

const INTENT_LIBRARY: Record<
  ContentIntent,
  {
    headlinePrefix: string[];
    reasonLens: string[];
    ctaFallbacks: string[];
  }
> = {
  awareness: {
    headlinePrefix: [
      "Leaning into",
      "Why this matters:",
      "Fresh POV on",
      "The shift we're seeing in",
    ],
    reasonLens: [
      "Highlight emerging trend for the audience",
      "Establish credibility by framing the underlying tension",
      "Anchor value with problem ➝ solution clarity",
    ],
    ctaFallbacks: [
      "Curious to hear how others are navigating this—let's compare notes.",
      "If this resonates, let's connect and strategize together.",
      "DM me if you want the playbook we used.",
    ],
  },
  launch: {
    headlinePrefix: [
      "We just launched",
      "Proud to introduce",
      "Rolling out",
      "Now live:",
    ],
    reasonLens: [
      "Lead with the belief or problem driving the launch",
      "Show tangible benefits tied to real use cases",
      "Invite early adopters with a clear next step",
    ],
    ctaFallbacks: [
      "Jump in and try it—happy to send early access.",
      "If this unlocks something for you, let's talk about partnering.",
      "Book a quick walkthrough and see it live.",
    ],
  },
  insight: {
    headlinePrefix: [
      "A lesson from the trenches:",
      "What surprised me this week:",
      "Hard-earned insight on",
      "What the data showed me about",
    ],
    reasonLens: [
      "Open with the tension or misconception you faced",
      "Highlight the inflection moment that reframed the problem",
      "Close with takeaway others can apply immediately",
    ],
    ctaFallbacks: [
      "How are you approaching this with your team?",
      "Drop your frameworks below—let's build a shared playbook.",
      "Who else is wrestling with this? Let's connect.",
    ],
  },
  hiring: {
    headlinePrefix: [
      "We're hiring:",
      "Looking for builders:",
      "Team is growing:",
      "Calling operators who love",
    ],
    reasonLens: [
      "Frame the mission and why the role exists now",
      "Underscore the kind of impact the hire will own",
      "Point to what success looks like in the first 90 days",
    ],
    ctaFallbacks: [
      "Know someone who'd crush this? Make the intro.",
      "Ping me for the inside scoop and a warm intro.",
      "Drop 'interested' and I'll DM you details.",
    ],
  },
};

const LENGTH_CONFIG: Record<
  PostLength,
  { maxHookSentences: number; paragraphLimit: number; detailBullets: number }
> = {
  short: {
    maxHookSentences: 1,
    paragraphLimit: 2,
    detailBullets: 2,
  },
  standard: {
    maxHookSentences: 2,
    paragraphLimit: 3,
    detailBullets: 3,
  },
  long: {
    maxHookSentences: 2,
    paragraphLimit: 4,
    detailBullets: 4,
  },
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickDeterministic<T>(items: T[], seed: number): T {
  if (!items.length) {
    throw new Error("Cannot pick from an empty array");
  }
  const index = seed % items.length;
  return items[index];
}

function tokenize(value: string): string[] {
  return value
    .split(/[\n,•\-]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function ensureCallToAction(
  source: string,
  intent: ContentIntent,
  seed: number,
): string {
  if (source.trim().length > 0) return source.trim();
  const intentConfig = INTENT_LIBRARY[intent];
  return pickDeterministic(intentConfig.ctaFallbacks, seed);
}

function buildHeadline(
  input: LinkedInAgentInput,
  tone: (typeof TONE_LIBRARY)[string],
  seed: number,
): string {
  const intentConfig = INTENT_LIBRARY[input.intent];
  const prefix = pickDeterministic(intentConfig.headlinePrefix, seed);
  const verb = pickDeterministic(tone.hookVerbs, seed + 11);
  const topic = input.topic || "the shift we're seeing";
  const audience = input.audience ? ` for ${input.audience}` : "";
  const trimmed = topic.replace(/[.!?]$/, "");
  return `${prefix} ${verb} ${trimmed}${audience}`.replace(/\s+/g, " ");
}

function buildBodyParagraphs(
  input: LinkedInAgentInput,
  tone: (typeof TONE_LIBRARY)[string],
  config: (typeof LENGTH_CONFIG)[PostLength],
  seed: number,
): string[] {
  const keyPoints = tokenize(input.keyPoints);
  const proof = tokenize(input.proofPoints);
  const detailBullets = config.detailBullets;
  const paragraphs: string[] = [];
  const intentLens = INTENT_LIBRARY[input.intent].reasonLens;

  const hookNarrative = [
    `Here is the tension we're seeing for ${input.audience || "operators"}: ${
      pickDeterministic(intentLens, seed + 17)
    }.`,
    input.outcome
      ? `We’re focused on ${input.outcome.trim()}.`
      : `This is where the opportunity is building momentum.`,
  ]
    .filter(Boolean)
    .slice(0, config.maxHookSentences)
    .join(" ");
  paragraphs.push(hookNarrative);

  if (keyPoints.length) {
    const selected = keyPoints.slice(0, detailBullets);
    const body = selected
      .map((point, idx) => {
        const emphasis =
          idx === 0
            ? "First up"
            : idx === 1
              ? "Plus"
              : idx === selected.length - 1
                ? "Finally"
                : "Also";
        return `${emphasis}: ${point}`;
      })
      .join(" ");
    paragraphs.push(body);
  }

  if (proof.length) {
    const proofSentence = proof
      .slice(0, 2)
      .map((item) => {
        const sanitized = item.replace(/^[•\-]+/, "").trim();
        return sanitized;
      })
      .join(" · ");
    paragraphs.push(
      `Why it matters: ${proofSentence}${
        tone.cadence.includes("confident") ? "." : ""
      }`,
    );
  }

  if (paragraphs.length > config.paragraphLimit) {
    return paragraphs.slice(0, config.paragraphLimit);
  }

  return paragraphs;
}

function buildHashtags(
  input: LinkedInAgentInput,
  seed: number,
  desiredCount = 6,
): string[] {
  const userTags = tokenize(input.hashtags)
    .map((tag) => tag.replace("#", ""))
    .map((tag) => titleCase(tag));
  const generatedFromTopic = tokenize(input.topic)
    .slice(0, 3)
    .map((token) => titleCase(token));
  const generatedFromAudience = tokenize(input.audience)
    .slice(0, 2)
    .map((token) => titleCase(token));

  const pool = Array.from(
    new Set([...userTags, ...generatedFromTopic, ...generatedFromAudience]),
  ).filter(Boolean);

  if (!pool.length) return [];
  const tags: string[] = [];
  let localSeed = seed;
  while (tags.length < Math.min(pool.length, desiredCount)) {
    const candidate = pickDeterministic(pool, localSeed);
    if (!tags.includes(candidate)) {
      tags.push(candidate);
    }
    localSeed += 13;
    if (localSeed > 1_000_000) break;
  }
  return tags.map((tag) => `#${tag.replace(/\s+/g, "")}`);
}

function buildSteps(
  input: LinkedInAgentInput,
  paragraphs: string[],
  headline: string,
  tone: (typeof TONE_LIBRARY)[string],
): LinkedInAgentStep[] {
  return [
    {
      title: "Audience Lens",
      insight: `With a ${tone.vibe} voice, we center the tension ${input.audience ? `your ${input.audience}` : "your audience"} feels right now.`,
      output: paragraphs[0] || headline,
    },
    {
      title: "Value Narrative",
      insight:
        "Translate raw talking points into a narrative arc that builds authority and momentum.",
      output: paragraphs.slice(1, 3).join("\n\n"),
    },
    {
      title: "Call-To-Action",
      insight:
        "Close with a conversational nudge that makes it easy to respond or DM.",
      output: ensureCallToAction(input.callToAction, input.intent, hashString(headline)),
    },
  ];
}

export function generateLinkedInPost(
  rawInput: LinkedInAgentInput,
  salt = 0,
): LinkedInAgentResult {
  const seed = hashString(
    [
      rawInput.topic,
      rawInput.audience,
      rawInput.keyPoints,
      rawInput.proofPoints,
      rawInput.outcome,
      rawInput.tone,
      rawInput.intent,
      rawInput.length,
      salt.toString(),
    ].join("|"),
  );

  const toneKey = rawInput.tone in TONE_LIBRARY ? rawInput.tone : "professional-optimistic";
  const toneProfile = TONE_LIBRARY[toneKey];
  const lengthProfile = LENGTH_CONFIG[rawInput.length] || LENGTH_CONFIG.standard;
  const cta = ensureCallToAction(rawInput.callToAction, rawInput.intent, seed + 5);

  const headline = buildHeadline(rawInput, toneProfile, seed + 7);
  const paragraphs = buildBodyParagraphs(
    rawInput,
    toneProfile,
    lengthProfile,
    seed + 19,
  );
  const hashtags = buildHashtags(rawInput, seed + 23);

  const postSections = [
    `🚀 ${headline}`,
    "",
    paragraphs.join("\n\n"),
    "",
    `👉 ${cta}`,
    "",
    hashtags.join(" "),
  ]
    .filter(Boolean)
    .join("\n");

  const steps = buildSteps(rawInput, paragraphs, headline, toneProfile);
  const recommendations = [
    "Post between 8-10am in your audience's timezone to maximize visibility.",
    "Add a lightweight visual or carousel that mirrors the hook to improve dwell time.",
    "Stick around for 15 minutes post-publish to respond and boost early engagement.",
  ];

  const quickTips = [
    `Lean into ${toneProfile.vibe} voice—keep sentences ${
      toneProfile.cadence
    }.`,
    "Break chunky paragraphs into 2-3 lines to stay LinkedIn-friendly.",
    "If you have a proof point with numbers, place it right after the hook.",
  ];

  return {
    headline,
    post: postSections,
    hashtags,
    steps,
    recommendations,
    quickTips,
  };
}

export const TONE_PRESETS = [
  {
    id: "professional-optimistic",
    label: TONE_LIBRARY["professional-optimistic"].label,
  },
  {
    id: "insightful-mentor",
    label: TONE_LIBRARY["insightful-mentor"].label,
  },
  {
    id: "bold-visionary",
    label: TONE_LIBRARY["bold-visionary"].label,
  },
  {
    id: "community-builder",
    label: TONE_LIBRARY["community-builder"].label,
  },
];

export const LENGTH_OPTIONS: { id: PostLength; label: string }[] = [
  { id: "short", label: "Punchy (150-220 words)" },
  { id: "standard", label: "Standard (220-320 words)" },
  { id: "long", label: "Deep-dive (320-420 words)" },
];

export const INTENT_OPTIONS: { id: ContentIntent; label: string; teaser: string }[] =
  [
    {
      id: "awareness",
      label: "Awareness Builder",
      teaser: "Trend POV, industry shift, thought leadership",
    },
    {
      id: "launch",
      label: "Launch Moment",
      teaser: "Shipping something new, feature drop, announcement",
    },
    {
      id: "insight",
      label: "Insight / Lesson",
      teaser: "Personal reflection, data-backed takeaway, hot take",
    },
    {
      id: "hiring",
      label: "Hiring Boost",
      teaser: "Recruiting, referrals, team hype, culture spotlight",
    },
  ];

export interface StarterPreset {
  name: string;
  description: string;
  payload: LinkedInAgentInput;
}

export const STARTER_PRESETS: StarterPreset[] = [
  {
    name: "AI feature launch",
    description: "Ship a new AI capability with proof points and CTA.",
    payload: {
      topic: "our AI copilot for revenue teams",
      audience: "RevOps leaders at high-growth SaaS companies",
      outcome: "help GTM teams close loops between revenue data and action",
      keyPoints:
        "Turns messy CRM notes into prioritized plays\nAutogenerates follow-up briefs for reps\nSurfaces risk deals 10 days earlier",
      proofPoints:
        "Pilot teams reclaimed 7 hours per week • Beta customers lifted win rates by 8%",
      tone: "bold-visionary",
      callToAction: "DM me for early access before the waitlist opens wider.",
      hashtags: "revops,AI,saas,salesenablement",
      intent: "launch",
      length: "standard",
    },
  },
  {
    name: "Leadership reflection",
    description: "Share a lesson learned from scaling a team.",
    payload: {
      topic: "what it really takes to keep a remote-first team aligned",
      audience: "founders building distributed product teams",
      outcome: "create more intentional rituals that reinforce ownership",
      keyPoints:
        "Over-communicate the why, not just the what\nDesign async-first artifacts, then layer live moments\nProtect maker time like a core KPI",
      proofPoints:
        "Team velocity stayed within 3% after doubling headcount • Engagement scores jumped 12 points",
      tone: "insightful-mentor",
      callToAction: "",
      hashtags: "leadership,remotework,product",
      intent: "insight",
      length: "long",
    },
  },
  {
    name: "Hiring call",
    description: "Invite operators to join your growing team.",
    payload: {
      topic: "finding our next lifecycle marketer",
      audience: "full-funnel lifecycle marketers who love experimentation",
      outcome: "craft journeys that feel handcrafted at scale",
      keyPoints:
        "You’ll own activation through expansion across product + marketing\nLots of white space for lifecycle creativity\nPartnership with product to instrument experimentation",
      proofPoints:
        "We doubled ARR in the last 12 months • NPS sits at 56 and still climbing",
      tone: "community-builder",
      callToAction: "",
      hashtags: "hiring,marketing,careers,startups",
      intent: "hiring",
      length: "standard",
    },
  },
];
