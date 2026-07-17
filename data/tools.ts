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
    prompt: (v) => `Write a complete video script.\nTopic: ${v.topic} | Tone: ${v.tone} | Length: ${v.length} | Platform: ${v.platform}\n\n🎯 HOOK (First 3 seconds)\n📖 INTRO\n📝 MAIN CONTENT\n💡 KEY POINTS\n📣 OUTRO & CTA\n✨ BONUS TIPS`,
  },
  {
    id: "hook", icon: "🪝", name: "Hook Generator", desc: "20 viral hooks that stop the scroll.", badge: "🔥 Hot", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Topic / Niche", type: "textarea", placeholder: "e.g. Personal finance tips for students", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "YouTube", "TikTok", "LinkedIn"] },
    ],
    prompt: (v) => `Generate 20 scroll-stopping hooks for: "${v.topic}" on ${v.platform}.\n\n🔥 VIRAL HOOKS (Question - 5)\n⚡ SHOCK HOOKS (Bold - 5)\n📖 STORY HOOKS (Narrative - 5)\n🎯 CURIOSITY HOOKS (Gap - 5)`,
  },
  {
    id: "caption", icon: "✍️", name: "Caption Writer", desc: "Engaging Instagram captions with hooks & CTAs.", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Post Topic", type: "textarea", placeholder: "e.g. Morning routine that changed my life", rows: 3 },
      { id: "tone", label: "Tone", type: "select", options: ["Casual & Fun", "Motivational", "Educational", "Storytelling", "Promotional"] },
    ],
    prompt: (v) => `Write 3 Instagram captions for: "${v.topic}" | Tone: ${v.tone}\n\n📢 CAPTION 1\n[Hook + Body + CTA + 5 hashtags]\n\n📢 CAPTION 2\n[Different style]\n\n📢 CAPTION 3\n[Different angle]`,
  },
  {
    id: "hashtag", icon: "#️⃣", name: "Hashtag Generator", desc: "30 targeted hashtags for maximum reach.", badge: "Popular", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Content Topic", type: "textarea", placeholder: "e.g. fitness transformation", rows: 2 },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "YouTube", "LinkedIn"] },
    ],
    prompt: (v) => `Generate 30 hashtags for ${v.platform} about: "${v.topic}"\n\n🏷️ HIGH REACH (10) — 1M+\n🏷️ MEDIUM REACH (10) — 100K-1M\n🏷️ NICHE (10) — Under 100K`,
  },
  {
    id: "reel", icon: "🎥", name: "Reel Ideas", desc: "30 viral Reel ideas for your niche.", cat: "Instagram",
    inputs: [
      { id: "niche", label: "Your Niche", type: "textarea", placeholder: "e.g. fitness, cooking, finance", rows: 2 },
      { id: "style", label: "Style", type: "select", options: ["Educational", "Entertainment", "Inspiration", "Tutorial", "Trending"] },
    ],
    prompt: (v) => `Generate 30 viral Reel ideas for: "${v.niche}" | Style: ${v.style}\n\nEach:\n📌 [Number]. [Title]\n🎯 Hook: [3 seconds]\n📝 Concept: [1 line]`,
  },
  {
    id: "carousel", icon: "🎠", name: "Carousel Generator", desc: "Instagram carousel slides that drive saves.", cat: "Instagram",
    inputs: [
      { id: "topic", label: "Carousel Topic", type: "textarea", placeholder: "e.g. 10 habits of successful people", rows: 3 },
      { id: "slides", label: "Slides", type: "select", options: ["5 slides", "7 slides", "10 slides"] },
    ],
    prompt: (v) => `Create Instagram carousel for: "${v.topic}" | ${v.slides}\n\nSlide [#]: [Headline]\n[Body 2-3 lines]\n\nSlide 1 = strong hook. Last = CTA.`,
  },
  {
    id: "titles", icon: "📌", name: "Video Title Generator", desc: "20 click-worthy YouTube & Reel titles.", badge: "Popular", cat: "YouTube",
    inputs: [
      { id: "topic", label: "Video Topic", type: "textarea", placeholder: "e.g. How I made money online", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["YouTube", "Instagram Reels", "TikTok"] },
    ],
    prompt: (v) => `Generate 20 viral ${v.platform} titles for: "${v.topic}"\n\n🔥 CURIOSITY (1-5)\n⚡ NUMBER-BASED (6-10)\n📖 STORY (11-15)\n🎯 QUESTION (16-20)`,
  },
  {
    id: "ytdesc", icon: "📄", name: "YouTube Description", desc: "SEO-optimized YouTube descriptions.", cat: "YouTube",
    inputs: [
      { id: "title", label: "Video Title", type: "input", placeholder: "Enter your video title" },
      { id: "topic", label: "Video Summary", type: "textarea", placeholder: "Brief summary", rows: 3 },
    ],
    prompt: (v) => `Write complete SEO YouTube description:\nTitle: "${v.title}" | Content: ${v.topic}\n\n📝 Hook paragraph\n📄 Full summary (150 words)\n⏱️ Timestamps\n🔗 Links\n🏷️ 15 SEO tags\n#️⃣ Hashtags`,
  },
  {
    id: "cta", icon: "📣", name: "CTA Generator", desc: "Powerful call-to-actions that convert.", cat: "Marketing",
    inputs: [
      { id: "goal", label: "Goal", type: "select", options: ["Subscribe", "Follow", "Buy Product", "Visit Website", "DM Me", "Save Post", "Share", "Comment"] },
      { id: "niche", label: "Niche / Product", type: "input", placeholder: "e.g. fitness coaching" },
    ],
    prompt: (v) => `Generate 15 CTAs for: "${v.goal}" | Niche: "${v.niche}"\n\n💡 For Instagram (5)\n🎬 For YouTube (5)\n📲 For Stories (5)`,
  },
  {
    id: "calendar", icon: "📅", name: "Content Calendar", desc: "30-day content plan ready to execute.", badge: "🔥 Hot", cat: "Marketing",
    inputs: [
      { id: "niche", label: "Your Niche", type: "input", placeholder: "e.g. fitness, finance" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "YouTube", "TikTok", "LinkedIn"] },
      { id: "freq", label: "Frequency", type: "select", options: ["Daily", "3x per week", "5x per week", "Weekdays only"] },
    ],
    prompt: (v) => `30-day content calendar for ${v.niche} on ${v.platform} (${v.freq})\n\nDay # | Format | Topic | Hook | Goal\n\nWeekly themes + Content mix strategy`,
  },
  {
    id: "bio", icon: "👤", name: "Bio Generator", desc: "Killer bios for Instagram, YouTube & more.", cat: "Writing",
    inputs: [
      { id: "name", label: "Name / Brand", type: "input", placeholder: "e.g. Syed Irrfan" },
      { id: "niche", label: "What you do", type: "input", placeholder: "e.g. I teach people how to earn online" },
      { id: "type", label: "Bio Type", type: "select", options: ["Instagram Personal", "Instagram Business", "YouTube Channel", "LinkedIn"] },
    ],
    prompt: (v) => `Write 5 ${v.type} bios for: ${v.name} | ${v.niche}\n\nBio 1-5 each with hook + value prop + CTA + emojis`,
  },
  {
    id: "brandname", icon: "💡", name: "Brand Name Generator", desc: "Creative, memorable brand names.", cat: "Business",
    inputs: [
      { id: "niche", label: "Business / Niche", type: "input", placeholder: "e.g. AI tools for creators" },
      { id: "vibe", label: "Brand Vibe", type: "select", options: ["Modern & Tech", "Creative & Fun", "Premium & Luxury", "Bold & Powerful", "Minimal & Clean"] },
    ],
    prompt: (v) => `Generate 20 brand names for ${v.niche} with ${v.vibe} vibe.\n\nEach: Name + Why it works + Domain tip\n✨ TOP 3 PICKS at end`,
  },
  {
    id: "username", icon: "@", name: "Username Generator", desc: "Unique brandable usernames.", cat: "Instagram",
    inputs: [
      { id: "name", label: "Name / Niche", type: "input", placeholder: "e.g. Sarah, FitLife" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "YouTube", "Twitter/X"] },
    ],
    prompt: (v) => `Generate 25 ${v.platform} usernames for: "${v.name}"\n\nWith Prefix (5) | With Suffix (5) | Creative (5) | Short (5) | Numbers (5)\n⭐ TOP 5 PICKS`,
  },
  {
    id: "product", icon: "🛍️", name: "Product Description", desc: "Sales copy that converts.", cat: "Marketing",
    inputs: [
      { id: "product", label: "Product Name", type: "input", placeholder: "e.g. Reels Bundle Pack" },
      { id: "features", label: "Features / Benefits", type: "textarea", placeholder: "Main features...", rows: 3 },
      { id: "audience", label: "Target Audience", type: "input", placeholder: "e.g. Instagram creators" },
    ],
    prompt: (v) => `Product descriptions for: ${v.product} | Features: ${v.features} | Audience: ${v.audience}\n\n📝 SHORT (50 words)\n📄 MEDIUM (150 words)\n🚀 FULL SALES COPY (300 words)\n💡 CTA IDEAS`,
  },
  {
    id: "adcopy", icon: "📢", name: "Ad Copy Generator", desc: "High-converting Facebook & Instagram ads.", badge: "Popular", cat: "Marketing",
    inputs: [
      { id: "product", label: "Product / Service", type: "input", placeholder: "e.g. Online fitness coaching" },
      { id: "audience", label: "Target Audience", type: "input", placeholder: "e.g. Women 25-35" },
      { id: "platform", label: "Ad Platform", type: "select", options: ["Facebook Ads", "Instagram Ads", "Google Ads", "TikTok Ads"] },
    ],
    prompt: (v) => `Write 5 ${v.platform} ads for: "${v.product}" targeting: "${v.audience}"\n\nAd 1 — Problem-Solution\nAd 2 — Social Proof\nAd 3 — FOMO\nAd 4 — Benefit-Led\nAd 5 — Direct Response\nEach: Headline + Body + CTA`,
  },
  {
    id: "email", icon: "📧", name: "Email Writer", desc: "Marketing emails that get opened.", cat: "Writing",
    inputs: [
      { id: "type", label: "Email Type", type: "select", options: ["Welcome Email", "Sales Email", "Newsletter", "Follow-up", "Launch Announcement"] },
      { id: "product", label: "Product / Topic", type: "input", placeholder: "e.g. Instagram growth course" },
      { id: "audience", label: "Audience", type: "input", placeholder: "e.g. my subscribers" },
    ],
    prompt: (v) => `Write ${v.type} for: "${v.product}" to: "${v.audience}"\n\n5 Subject lines\nPreview text\nFull email body\nCTA\nPS line`,
  },
  {
    id: "rewrite", icon: "✨", name: "AI Rewrite & Humanize", desc: "Improve or humanize any text.", cat: "Writing",
    inputs: [
      { id: "text", label: "Paste Your Text", type: "textarea", placeholder: "Paste content to improve...", rows: 5 },
      { id: "mode", label: "Mode", type: "select", options: ["Improve & Polish", "Humanize (remove AI tone)", "Make More Engaging", "Simplify", "Make Professional", "Shorten"] },
    ],
    prompt: (v) => `${v.mode} this text. Return 3 versions:\n\n"""${v.text}"""\n\n✨ VERSION 1\n✨ VERSION 2\n✨ VERSION 3\n💡 WHAT CHANGED`,
  },
  {
    id: "seo", icon: "🔍", name: "SEO Keyword Generator", desc: "High-ranking keywords for your content.", cat: "SEO",
    inputs: [
      { id: "topic", label: "Content Topic", type: "textarea", placeholder: "e.g. Instagram growth tips", rows: 3 },
      { id: "platform", label: "Platform", type: "select", options: ["YouTube SEO", "Google Blog", "Instagram SEO", "General"] },
    ],
    prompt: (v) => `SEO keywords for: "${v.topic}" | ${v.platform}\n\n🎯 PRIMARY (5)\n📈 LONG-TAIL (15)\n💡 LSI (10)\n❓ QUESTIONS (10)\n🔥 TRENDING (5)`,
  },
  {
    id: "story", icon: "📱", name: "Story Ideas", desc: "Creative Instagram Story sequences.", cat: "Instagram",
    inputs: [
      { id: "goal", label: "Story Goal", type: "select", options: ["Engagement & Polls", "Product Promotion", "Personal Connection", "Educational", "Drive Link in Bio"] },
      { id: "niche", label: "Your Niche", type: "input", placeholder: "e.g. fitness coaching" },
    ],
    prompt: (v) => `Generate 15 Instagram Story ideas for ${v.niche} | Goal: "${v.goal}"\n\nEach: Concept + Slides + Engagement element + Pro tip`,
  },
  {
    id: "poll", icon: "📊", name: "Poll Generator", desc: "Engaging polls that spark conversations.", cat: "Instagram",
    inputs: [
      { id: "niche", label: "Niche / Topic", type: "input", placeholder: "e.g. fitness, business" },
      { id: "platform", label: "Platform", type: "select", options: ["Instagram Stories", "Twitter/X", "LinkedIn", "YouTube Community"] },
    ],
    prompt: (v) => `20 poll questions for ${v.niche} on ${v.platform}\n\n🆚 This vs That (5)\n✅ Yes/No (5)\n🤔 Opinion (5)\n😄 Fun (5)\n✨ ENGAGEMENT TIP`,
  },
  {
    id: "tiktok", icon: "🎵", name: "TikTok Script", desc: "Viral TikTok scripts and ideas.", cat: "TikTok",
    inputs: [
      { id: "topic", label: "Topic", type: "textarea", placeholder: "e.g. How to save money fast", rows: 3 },
      { id: "style", label: "Style", type: "select", options: ["Trending Sound", "Educational", "Comedy", "Story Time", "POV"] },
    ],
    prompt: (v) => `Write a viral TikTok script for: "${v.topic}" | Style: ${v.style}\n\n🎵 TRENDING HOOK (0-3 sec)\n📱 MAIN CONTENT (3-45 sec)\n🎯 CTA (last 5 sec)\n💡 CAPTION + HASHTAGS`,
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
