export interface ToolSeoFaq {
  q: string;
  a: string;
}

export interface ToolSeoContent {
  /** H1 — distinct from the nav/card name where a fuller phrase helps search intent. */
  h1: string;
  /** Short intro paragraph directly under the H1, above the tool form. */
  intro: string;
  sections: { heading: string; body: string }[];
  faq: ToolSeoFaq[];
}

/**
 * Populated for a small, deliberate set of tools per an explicit SEO
 * brief — not generated in bulk. A tool with no entry here just renders
 * the plain interactive page as before (see app/tools/[id]/layout.tsx),
 * so adding a new entry is always a safe, additive, one-tool-at-a-time
 * change.
 */
export const TOOL_SEO_CONTENT: Record<string, ToolSeoContent> = {
  brandname: {
    h1: "AI Brand Name Generator",
    intro:
      "Generate brand name ideas for your business, startup, or product in seconds. Describe your niche and pick a vibe — the AI brand name generator below returns 20 name ideas, each with a short reason it fits, plus its top 3 picks.",
    sections: [
      {
        heading: "What is an AI Brand Name Generator?",
        body: "An AI brand name generator uses AI to suggest business name ideas based on your niche and the tone you want your brand to have. Instead of brainstorming alone, you describe what your business does and the vibe you're going for — modern, luxury, playful, bold, or minimal — and get a varied list of name ideas to react to and build on.",
      },
      {
        heading: "How to Use the Brand Name Generator",
        body: "Enter your business or niche (for example, \"AI tools for creators\" or \"handmade candle shop\"), choose a brand vibe, and generate. You'll get 20 brand name ideas using different naming styles — compound words, invented words, real words used metaphorically, founder-style names, and descriptive names — plus a short reasoning line for each and a top-3 shortlist.",
      },
      {
        heading: "How to Choose a Strong Brand Name",
        body: "A strong brand name is easy to say, easy to spell, and easy to remember — and it should still feel true to your business a few years from now. Say your shortlist out loud, check how each name looks written down and as a possible handle, and get outside opinions before you commit. A generator is a starting point for brand name ideas, not a final decision.",
      },
    ],
    faq: [
      {
        q: "What is a brand name generator?",
        a: "A brand name generator is a tool that suggests business or brand name ideas based on details you provide, like your niche and preferred style. It's meant to speed up brainstorming, not replace your own judgment about what fits your business.",
      },
      {
        q: "How does the AI brand name generator work?",
        a: "You describe your business or niche and pick a vibe (like Modern & Tech or Premium & Luxury). The AI then generates 20 name ideas using a mix of naming styles, each with a short note on why it fits, and highlights its top 3 picks.",
      },
      {
        q: "Can I use the generated names for my business?",
        a: "Yes — the names are yours to use. Before committing to one, independently verify domain availability, social media handle availability, and that the name doesn't conflict with an existing trademark in your area and industry.",
      },
      {
        q: "How do I check if a brand name is available?",
        a: "This tool doesn't check availability. Search the name on a domain registrar, check the handle on the social platforms you plan to use, and search your country's trademark database (or consult a trademark attorney) before finalizing a name.",
      },
      {
        q: "Can it generate startup or company name ideas too?",
        a: "Yes — the generator works for any kind of business, startup, product, or creator brand. Just describe what it is in the niche field and it will tailor the name ideas accordingly.",
      },
    ],
  },

  seo: {
    h1: "AI SEO Keyword Generator",
    intro:
      "Generate SEO keywords for any topic in seconds. Enter your content topic and platform, and the AI SEO keyword generator below returns primary keywords, long-tail phrases, related terms, and question-based keywords you can use in content and metadata.",
    sections: [
      {
        heading: "What Does This SEO Keyword Generator Do?",
        body: "It generates a structured set of keywords for a topic you provide: primary keywords (the core terms people search), long-tail phrases (more specific, multi-word searches), related/LSI terms (words that support topical relevance), and question-based keywords (useful for FAQ sections and voice search).",
      },
      {
        heading: "How to Use It",
        body: "Describe your content topic and choose where you're optimizing for — YouTube SEO, a Google blog post, Instagram SEO, or general use. The generator returns keyword ideas grouped by type so you can use the primary terms in titles and headers, and the long-tail/question terms throughout the body content naturally.",
      },
    ],
    faq: [
      {
        q: "What is an SEO keyword generator?",
        a: "An SEO keyword generator suggests search terms related to a topic you provide, grouped by type (primary, long-tail, related, and question-based), to help you plan content around what people actually search for.",
      },
      {
        q: "Does this guarantee my content will rank?",
        a: "No tool can guarantee rankings — Google's ranking depends on many factors beyond keywords, including content quality, site authority, and competition. This tool helps with keyword research and content planning, not ranking guarantees.",
      },
    ],
  },

  caption: {
    h1: "AI Instagram Caption Generator",
    intro:
      "Write Instagram captions in seconds. Describe your post topic and pick a tone, and the AI caption generator below writes 3 ready-to-post captions, each with a different angle — so you're not stuck rewriting the same idea three times.",
    sections: [
      {
        heading: "What Does This Caption Generator Do?",
        body: "It writes 3 Instagram captions for a topic and tone you choose. Each caption takes a genuinely different approach — for example, one educational, one story-led, one conversational — with a strong opening line, natural spacing, and a CTA or hashtags only where they actually fit.",
      },
      {
        heading: "Tips for Better Instagram Captions",
        body: "The first line matters most — it's what shows before \"more\" in the feed, so lead with your strongest hook. Write the way you'd actually talk to your audience, keep hashtags relevant instead of generic, and only add a call-to-action when there's a real reason for someone to comment, save, or click.",
      },
    ],
    faq: [
      {
        q: "What is an AI caption writer?",
        a: "An AI caption writer generates ready-to-post social media captions from a topic and tone you provide, so you can post consistently without starting from a blank page every time.",
      },
      {
        q: "Can I use this for platforms other than Instagram?",
        a: "This generator is tuned for Instagram captions specifically. The wording and hashtag conventions are written with Instagram's feed format in mind.",
      },
    ],
  },

  username: {
    h1: "AI Instagram Username Generator",
    intro:
      "Generate Instagram username ideas in seconds. Enter your name or niche and pick a platform, and the AI username generator below returns 25 available-feeling handle ideas, grouped by style, plus its top 5 picks.",
    sections: [
      {
        heading: "What Does This Username Generator Do?",
        body: "It generates 25 username ideas based on a name or niche you provide, grouped into styles — with a prefix, with a suffix, creative/invented variations, short versions, and natural number use — so you have real variety instead of one predictable pattern repeated 25 times.",
      },
      {
        heading: "Tips for Choosing a Username",
        body: "A good username is easy to say out loud and still recognizably connected to your name or brand. Shorter is usually better for typing and remembering. Check your shortlist against the platform directly, since availability changes constantly and this tool can't check that for you.",
      },
    ],
    faq: [
      {
        q: "What is an Instagram username generator?",
        a: "An Instagram username generator suggests handle ideas based on your name or niche, using different naming styles so you have real options instead of one obvious pattern.",
      },
      {
        q: "Will the suggested usernames definitely be available?",
        a: "This tool can't check real-time availability. Always confirm directly on Instagram (or whichever platform you're using) before settling on a username.",
      },
      {
        q: "Does this work for platforms other than Instagram?",
        a: "You can choose Instagram, TikTok, YouTube, or Twitter/X as the target platform, and the suggestions adapt accordingly.",
      },
    ],
  },
};
