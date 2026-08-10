import type { Tool } from "@/types/tool";

export const TOOLS: Tool[] = [
  {
    id: "script", icon: "🎬", name: "Script Writer", desc: "Full video scripts for YouTube, Reels, TikTok.", badge: "Popular", cat: "YouTube",
    inputs: [
      { id: "topic", label: "Video Topic", type: "textarea", placeholder: "e.g. How to grow on Instagram in 2026", rows: 3 },
      { id: "tone", label: "Tone", type: "select", options: ["Conversational", "Professional", "Funny", "Motivational", "Educational"] },
      { id: "length", label: "Length", type: "select", options: ["Short (30–60 sec)", "Medium (2–5 min)", "Long (10+ min)"] },
      { id: "platform", label: "Platform", type: "select", options: ["YouTube", "Instagram Reels", "TikTok", "Facebook"] },
    ],
    prompt: (v) => `Write a complete, ready-to-read-aloud video script for "${v.topic}".
Tone: ${v.tone}. Platform: ${v.platform}. Target length: ${v.length}.

Match the actual word count to the selected length (speaking pace ~130-160 words/min):
- Short (30-60 sec) → roughly 70-150 words total.
- Medium (2-5 min) → roughly 300-750 words total.
- Long (10+ min) → roughly 1,300-1,600+ words — this must be a genuinely long, complete script, not a summary or outline.

Write the actual spoken script, not a list of section labels. Structure it as a natural narrative: hook in the first few seconds, then set up the problem or context, deliver the main value with real explanations and specific examples (not placeholder brackets), use natural spoken transitions between sections, end with a clear takeaway and a CTA that fits ${v.platform}. Write it exactly as the creator would say it out loud — no stage directions like "[b-roll here]" unless the tone calls for scripted production notes.`,
  },
  {
    id: "hook", icon: "🪝", name: "Hook Generator", desc: "20 viral hooks that stop the scroll.", badge: "🔥 Hot", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Topic / Niche", type: "textarea", placeholder: "e.g. Personal finance tips for students", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "YouTube", "TikTok", "LinkedIn"] },
    ],
    prompt: (v) => `Generate 20 scroll-stopping hooks for "${v.topic}" on ${v.platform}. Return only the finished hooks, ready to use — one per line, numbered 1-20.

Draw from genuinely different angles across the list — curiosity, tension, contradiction, an unexpected insight, a strong opinion, a problem, FOMO, a specific situation, a story, a question, a pattern interrupt, a counterintuitive idea — so no two hooks feel like the same template with words swapped. Keep each hook short enough to work as an opening line (under ~15 words). Make them specific to "${v.topic}", not generic enough to fit any niche.

A hook must create an open loop or tension the viewer needs resolved — not read like a standalone motivational quote (e.g. avoid flat statements like "Adaptability is key to survival" or "Success isn't linear" that don't hook anyone into watching further).

Do not invent specific numbers, earnings, follower counts, or personal claims (e.g. "$10K/month", "100K followers", "I quit my job") unless the user's topic explicitly states them — write around it with a real, honest angle instead.`,
  },
  {
    id: "caption", icon: "✍️", name: "Caption Writer", desc: "Engaging Instagram captions with hooks & CTAs.", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Post Topic", type: "textarea", placeholder: "e.g. Morning routine that changed my life", rows: 3 },
      { id: "tone", label: "Tone", type: "select", options: ["Casual & Fun", "Motivational", "Educational", "Storytelling", "Promotional"] },
    ],
    prompt: (v) => `Write 3 Instagram captions for "${v.topic}". Tone: ${v.tone}. Return only the finished captions, ready to post.

Each caption needs a strong first line that stands alone in the feed preview, natural line spacing (not one dense paragraph), and — only if it genuinely fits the tone — a short CTA and a few relevant hashtags at the end. Make the 3 captions genuinely different from each other in angle and structure, not the same caption reworded three times.

Avoid overused caption openers like "Ready to...", "Want to...", "Take your...", "Level up..." unless one is the strongest natural fit. Keep hashtags relevant and limited rather than a long generic list.`,
  },
  {
    id: "hashtag", icon: "#️⃣", name: "Hashtag Generator", desc: "30 targeted hashtags for maximum reach.", badge: "Popular", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Content Topic", type: "textarea", placeholder: "e.g. fitness transformation", rows: 2 },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "YouTube", "LinkedIn"] },
    ],
    prompt: (v) => `Generate 30 hashtags for "${v.topic}" on ${v.platform}, grouped by reach:

**High reach (10)** — broad, high-volume tags directly relevant to the topic.
**Medium reach (10)** — moderately specific tags an engaged audience actually searches.
**Niche (10)** — specific to "${v.topic}" itself, low competition.

Every hashtag must be genuinely relevant to "${v.topic}" — no generic filler tags (#love, #instagood, #follow) just to fill the count. Return only the hashtags, ready to copy.`,
  },
  {
    id: "reel", icon: "🎥", name: "Reel Ideas", desc: "30 viral Reel ideas for your niche.", cat: "Instagram",
    inputs: [
      { id: "niche", label: "Your Niche", type: "textarea", placeholder: "e.g. fitness, cooking, finance", rows: 2 },
      { id: "style", label: "Style", type: "select", options: ["Educational", "Entertainment", "Inspiration", "Tutorial", "Trending"] },
    ],
    prompt: (v) => `Generate 30 viral Reel ideas for the "${v.niche}" niche, in a ${v.style} style. For each idea, give: a specific concept (not a generic template), a one-line hook for the first 3 seconds, and what happens in the video. Number them 1-30.

Make the 30 ideas genuinely different concepts from each other — vary the format (challenge, tutorial, before/after, story, myth-bust, day-in-the-life, etc.) rather than repeating the same structure with the topic swapped. Return only the finished list.`,
  },
  {
    id: "carousel", icon: "🎠", name: "Carousel Generator", desc: "Instagram carousel slides that drive saves.", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Carousel Topic", type: "textarea", placeholder: "e.g. 10 habits of successful people", rows: 3 },
      { id: "slides", label: "Slides", type: "select", options: ["5 slides", "7 slides", "10 slides"] },
    ],
    prompt: (v) => `Create a complete Instagram carousel about "${v.topic}" with ${v.slides}. For each slide, write the actual headline and 2-3 lines of real body text — not placeholder brackets. Slide 1 must be a strong scroll-stopping hook; the last slide must end with a clear CTA. Label each slide clearly (Slide 1, Slide 2, etc.) and keep the content tight enough to read in a few seconds per slide. Return only the finished carousel, ready to use.`,
  },
  {
    id: "titles", icon: "📌", name: "Video Title Generator", desc: "20 click-worthy YouTube & Reel titles.", badge: "Popular", cat: "YouTube",
    inputs: [
      { id: "topic", label: "Video Topic", type: "textarea", placeholder: "e.g. How I made money online", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["YouTube", "Instagram Reels", "TikTok"] },
    ],
    prompt: (v) => `Generate 20 titles for "${v.topic}" optimized for ${v.platform}. Return only the finished titles, numbered 1-20, ready to use.

Vary the approach across the list — curiosity, a specific number, a question, a bold or surprising claim, a relatable problem — so they don't all follow the same formula. Keep them specific to "${v.topic}", not generic clickbait that could apply to any video.

Never imply the viewer/creator personally achieved a specific result (earnings, follower counts, timelines) unless the topic explicitly states it. If the topic doesn't give you a real number, use neutral framing (e.g. "Realistic Ways to..." instead of "How I Made $10,000...").`,
  },
  {
    id: "ytdesc", icon: "📄", name: "YouTube Description", desc: "SEO-optimized YouTube descriptions.", cat: "YouTube",
    inputs: [
      { id: "title", label: "Video Title", type: "input", placeholder: "Enter your video title" },
      { id: "topic", label: "Video Summary", type: "textarea", placeholder: "Brief summary", rows: 3 },
    ],
    prompt: (v) => `Write a complete YouTube description for the video titled "${v.title}". Video summary: ${v.topic}

Structure it with whichever of these genuinely fit the summary provided — don't force sections the summary doesn't support:
- An engaging opening line/paragraph that hooks the reader and states what the video covers.
- A fuller overview paragraph.
- "What you'll learn" or key takeaways, if the summary describes distinct points or steps.
- A natural closing line and CTA (like/subscribe) if appropriate.

Base everything strictly on the actual summary provided — don't invent details about the video's content beyond what's given.

Only include timestamps if the summary above provides them — omit that section entirely rather than inventing fake ones. Only include links if the summary mentions specific resources — do not invent URLs, sponsors, products, or "resources mentioned" that weren't provided; omit those sections too if there's nothing real to put in them. If asked for SEO tags/hashtags, generate those separately based on the real topic, not a fixed count padded with generic tags.`,
  },
  {
    id: "cta", icon: "📣", name: "CTA Generator", desc: "Powerful call-to-actions that convert.", cat: "Marketing",
    inputs: [
      { id: "goal", label: "Goal", type: "select", options: ["Subscribe", "Follow", "Buy Product", "Visit Website", "DM Me", "Save Post", "Share", "Comment"] },
      { id: "niche", label: "Niche / Product", type: "input", placeholder: "e.g. fitness coaching" },
    ],
    prompt: (v) => `Generate 15 CTAs that get people to "${v.goal}" for a "${v.niche}" audience. Group them: 5 for Instagram captions, 5 for YouTube (spoken or on-screen), 5 for Stories. Make each one sound like a real creator talking, not a marketing template — natural phrasing that actually motivates the specific action, not generic "click the link below." Return only the finished CTAs.`,
  },
  {
    id: "calendar", icon: "📅", name: "Content Calendar", desc: "30-day content plan ready to execute.", badge: "🔥 Hot", cat: "Marketing",
    inputs: [
      { id: "niche", label: "Your Niche", type: "input", placeholder: "e.g. fitness, finance" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "YouTube", "TikTok", "LinkedIn"] },
      { id: "freq", label: "Frequency", type: "select", options: ["Daily", "3x per week", "5x per week", "Weekdays only"] },
    ],
    prompt: (v) => `Create a complete 30-day content calendar for the "${v.niche}" niche on ${v.platform}, posting ${v.freq}.

For each planned post, give a specific content format, an actual topic (not "insert topic here"), a real hook idea, and the goal (engagement, reach, conversion, etc.) — use a table with columns Day | Format | Topic | Hook | Goal. Group days into weekly themes so the month has a logical arc rather than 30 random unrelated ideas. End with a short content-mix strategy note (ratio of educational/entertaining/promotional posts). Every topic must be specific enough to actually execute, not a generic placeholder.`,
  },
  {
    id: "bio", icon: "👤", name: "Bio Generator", desc: "Killer bios for Instagram, YouTube & more.", cat: "Writing",
    inputs: [
      { id: "name", label: "Name / Brand", type: "input", placeholder: "e.g. Syed Irrfan" },
      { id: "niche", label: "What you do", type: "input", placeholder: "e.g. I teach people how to earn online" },
      { id: "type", label: "Bio Type", type: "select", options: ["Instagram Personal", "Instagram Business", "YouTube Channel", "LinkedIn"] },
    ],
    prompt: (v) => `Write 5 different ${v.type} bios for ${v.name}, who does: ${v.niche}. Return only the finished bios, numbered 1-5, ready to copy in.

Respect the real length constraint for ${v.type} (Instagram bios are short, ~150 characters; YouTube "About" sections can be a few lines; LinkedIn headlines are a single line). Each bio should open with a hook or clear value statement and close with a light CTA where it fits naturally. Make the 5 genuinely different in angle, not the same bio reworded. Only use emojis where they suit the bio type and tone — don't force them in.`,
  },
  {
    id: "brandname", icon: "💡", name: "Brand Name Generator", desc: "Creative, memorable brand names.", cat: "Business",
    inputs: [
      { id: "niche", label: "Business / Niche", type: "input", placeholder: "e.g. AI tools for creators" },
      { id: "vibe", label: "Brand Vibe", type: "select", options: ["Modern & Tech", "Creative & Fun", "Premium & Luxury", "Bold & Powerful", "Minimal & Clean"] },
    ],
    prompt: (v) => `Generate 20 brand name ideas for a "${v.niche}" business with a ${v.vibe} vibe. For each name, give a one-line reason it fits the vibe and niche. End with your top 3 picks and why.

Use genuinely different naming approaches across the list (compound words, invented words, real words used metaphorically, founder-style names, descriptive names) rather than 20 minor variations of the same pattern. Don't claim a specific domain is available or unavailable — you don't actually know that; instead note it's worth checking.`,
  },
  {
    id: "username", icon: "@", name: "Username Generator", desc: "Unique brandable usernames.", cat: "Instagram",
    inputs: [
      { id: "name", label: "Name / Niche", type: "input", placeholder: "e.g. Sarah, FitLife" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "YouTube", "Twitter/X"] },
    ],
    prompt: (v) => `Generate 25 available-feeling ${v.platform} username ideas based on "${v.name}". Group them: 5 with a prefix, 5 with a suffix, 5 creative/invented variations, 5 short versions, 5 using numbers naturally (not just random digits tacked on). End with your top 5 picks. Every username should still be easy to say out loud and recognizably connected to "${v.name}" — return only the finished list.`,
  },
  {
    id: "product", icon: "🛍️", name: "Product Description", desc: "Sales copy that converts.", cat: "Marketing",
    inputs: [
      { id: "product", label: "Product Name", type: "input", placeholder: "e.g. Reels Bundle Pack" },
      { id: "features", label: "Features / Benefits", type: "textarea", placeholder: "Main features...", rows: 3 },
      { id: "audience", label: "Target Audience", type: "input", placeholder: "e.g. Instagram creators" },
    ],
    prompt: (v) => `Write product descriptions for "${v.product}" targeting ${v.audience}. Real features/benefits provided: ${v.features}

Give three versions: a short one (~50 words) for a product card, a medium one (~150 words) for a listing page, and a fuller sales-copy version (~300 words) that builds more persuasion around the actual features given. End with 2-3 short CTA line options.

Base every claim strictly on the features provided — do not invent additional features, specifications, guarantees, or statistics that weren't given.`,
  },
  {
    id: "adcopy", icon: "📢", name: "Ad Copy Generator", desc: "High-converting Facebook & Instagram ads.", badge: "Popular", cat: "Marketing",
    inputs: [
      { id: "product", label: "Product / Service", type: "input", placeholder: "e.g. Online fitness coaching" },
      { id: "audience", label: "Target Audience", type: "input", placeholder: "e.g. Women 25-35" },
      { id: "platform", label: "Ad Platform", type: "select", options: ["Facebook Ads", "Instagram Ads", "Google Ads", "TikTok Ads"] },
    ],
    prompt: (v) => `Write 5 ${v.platform} ad variations for "${v.product}" targeting ${v.audience}. Each needs a headline, body copy, and CTA — return only the finished ads.

Make each ad use a genuinely different strategic angle: (1) problem → solution, (2) social proof, (3) urgency/FOMO, (4) lead with the core benefit, (5) direct and to-the-point. For the social-proof ad, do not invent specific testimonials, review counts, or customer numbers — use a general credibility angle instead unless real proof points were provided.`,
  },
  {
    id: "email", icon: "📧", name: "Email Writer", desc: "Marketing emails that get opened.", cat: "Writing",
    inputs: [
      { id: "type", label: "Email Type", type: "select", options: ["Welcome Email", "Sales Email", "Newsletter", "Follow-up", "Launch Announcement"] },
      { id: "product", label: "Product / Topic", type: "input", placeholder: "e.g. Instagram growth course" },
      { id: "audience", label: "Audience", type: "input", placeholder: "e.g. my subscribers" },
    ],
    prompt: (v) => `Write a ${v.type} for "${v.product}" to ${v.audience}. Return it fully formatted and ready to send:

Subject: [one strong subject line]

[The complete finished email body — greeting, real content, clear CTA, natural closing]

[Sign-off]

Write one complete, ready-to-send email — not multiple subject line options unless explicitly asked for them. Match the tone to a ${v.type}.

Do not invent a recipient name, company name, specific dates, offers, links, or sender identity that weren't provided — use clear placeholders like [Name], [Company Name], [Link], or [Your Name] wherever a real detail is genuinely needed but missing. Never invent security alerts, account warnings, urgent account actions, or any claim about the recipient's account/activity that wasn't part of the request — this is a common trust-breaking mistake to avoid entirely.`,
  },
  {
    id: "rewrite", icon: "✨", name: "AI Rewrite & Humanize", desc: "Improve or humanize any text.", cat: "Writing",
    inputs: [
      { id: "text", label: "Paste Your Text", type: "textarea", placeholder: "Paste content to improve...", rows: 5 },
      { id: "mode", label: "Mode", type: "select", options: ["Improve & Polish", "Humanize (remove AI tone)", "Make More Engaging", "Simplify", "Make Professional", "Shorten"] },
    ],
    prompt: (v) => `${v.mode} the following text. Provide 3 genuinely different versions — vary sentence structure, word choice, and rhythm meaningfully between them, not just swap a few synonyms:

"""${v.text}"""

Label them Version 1, 2, 3. After the versions, add one short note on what changed and why (only if useful — skip if the change is self-evident). Preserve the original meaning and any specific facts/names/numbers in the source text exactly.`,
  },
  {
    id: "seo", icon: "🔍", name: "SEO Keyword Generator", desc: "High-ranking keywords for your content.", cat: "SEO",
    inputs: [
      { id: "topic", label: "Content Topic", type: "textarea", placeholder: "e.g. Instagram growth tips", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["YouTube SEO", "Google Blog", "Instagram SEO", "General"] },
    ],
    prompt: (v) => `Generate SEO keywords for "${v.topic}" targeting ${v.platform}:

**Primary (5)** — the core terms someone would actually search for this topic.
**Long-tail (15)** — specific multi-word phrases with real search intent.
**Related/LSI (10)** — semantically related terms that support topical relevance.
**Question-based (10)** — actual questions people ask about this topic (great for FAQ/voice search).

Every keyword must be plausibly something a real person would search — no generic padding. Don't label anything as "currently trending" — that's not something to claim without real, current data.`,
  },
  {
    id: "story", icon: "📱", name: "Story Ideas", desc: "Creative Instagram Story sequences.", cat: "Instagram",
    inputs: [
      { id: "goal", label: "Story Goal", type: "select", options: ["Engagement & Polls", "Product Promotion", "Personal Connection", "Educational", "Drive Link in Bio"] },
      { id: "niche", label: "Your Niche", type: "input", placeholder: "e.g. fitness coaching" },
    ],
    prompt: (v) => `Generate 15 Instagram Story ideas for the "${v.niche}" niche, with the goal of ${v.goal}. For each idea, give: the concept, a rough slide-by-slide flow (2-4 slides), a specific engagement element (poll, question sticker, quiz, slider — whichever actually fits), and one pro tip for making it perform better. Return only the finished list, ready to plan from.`,
  },
  {
    id: "poll", icon: "📊", name: "Poll Generator", desc: "Engaging polls that spark conversations.", cat: "Instagram",
    inputs: [
      { id: "niche", label: "Niche / Topic", type: "input", placeholder: "e.g. fitness, business" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram Stories", "Twitter/X", "LinkedIn", "YouTube Community"] },
    ],
    prompt: (v) => `Generate 20 poll/engagement questions for the "${v.niche}" niche on ${v.platform}, covering a mix of formats: this-vs-that, yes/no, opinion-based, and lighter/fun questions. Every question must be specific enough to the "${v.niche}" audience that it couldn't be copy-pasted into an unrelated niche. End with one tip for getting more responses. Return only the finished questions.`,
  },
  {
    id: "tiktok", icon: "🎵", name: "TikTok Script", desc: "Viral TikTok scripts and ideas.", cat: "TikTok",
    inputs: [
      { id: "topic", label: "Topic", type: "textarea", placeholder: "e.g. How to save money fast", rows: 3 },
      { id: "style", label: "Style", type: "select", options: ["Trending Sound", "Educational", "Comedy", "Story Time", "POV"] },
    ],
    prompt: (v) => `Write a complete, ready-to-film TikTok script for "${v.topic}" in a ${v.style} style. TikToks run roughly 30-60 seconds — write the actual spoken words (roughly 80-140 words total), not an outline.

Structure: a pattern-interrupting hook in the first 1-3 seconds, the main content delivered fast and punchy (no throat-clearing), and a quick CTA in the last few seconds that fits the ${v.style} style. After the script, add a short on-screen caption and 4-6 relevant hashtags. Write it exactly as it would be spoken on camera.`,
  },
];

export const CATS: string[] = ["All", "Instagram", "YouTube", "TikTok", "Writing", "Marketing", "Business", "SEO"];

export const TIPS: string[] = [
  "Start your Reels with a question hook — it gets 3x more saves than statement hooks.",
  "Post carousels on Tuesday and Wednesday — highest save rates of the week.",
  "Use 3-5 niche hashtags and 3-5 medium hashtags. Avoid all-big hashtags.",
  "The first 3 seconds of a Reel determine if someone watches the whole video.",
  'Email subject lines with numbers (e.g. "5 ways to...") get 25% higher open rates.',
  "Repurpose one long-form piece into 10+ short-form content pieces.",
  "Reply to every comment in the first hour — the algorithm rewards this heavily.",
  "Use B-roll footage in your videos to keep viewer retention above 70%.",
];
