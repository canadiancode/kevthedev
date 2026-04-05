const heroFrames = [
  {
    scene: 'Snowboard mountain resort',
    lines: ['Shopify, Done Properly', 'Zero guesswork. Start to finish.'],
  },
  {
    scene: 'MTB mountain resort',
    lines: ['Themes. Hydrogen. Migrations. Apps.', 'One developer. End to end Shopify solutions.'],
  },
  {
    scene: 'Mountain resort turned into website',
    lines: ['The best rides are never accidental.', 'Neither are the best stores.'],
  },
];

export const site = {
  hero: {
    cta: "Let's Talk",
    frames: heroFrames,
  },
  about: {
    paragraphs: [
      "I'm Kevin — a Shopify developer based in Surrey, BC. I work across the full stack, from theme builds to custom Hydrogen storefronts.",
      'The difference: I think like a business owner, not just a developer. I care what converts, not just what ships.',
      "Off the screen I'm on a mountain bike or chasing powder somewhere in BC. Same focus, different terrain.",
    ],
  },
  services: {
    title: 'Shopify. Start to finish.',
    items: [
      { icon: '🛍', title: 'Store Setup', body: 'Done right from day one. No bad foundations to unpick later.' },
      { icon: '⚡', title: 'Speed & Performance', body: 'Slow stores lose sales. I find the bottleneck and fix it.' },
      { icon: '⚗️', title: 'Hydrogen / Headless', body: "Custom storefronts for brands that need more than Shopify's defaults." },
      { icon: '🔌', title: 'App Integration', body: 'Third-party tools, CRMs, fulfillment systems — connected and working.' },
      { icon: '🔄', title: 'Migration to Shopify', body: 'From WooCommerce, Squarespace, or anywhere else. Clean and complete.' },
      { icon: '🛠', title: 'Maintenance & Support', body: 'Ongoing support so your store stays fast, updated, and live.' },
    ],
  },
  work: {
    title: 'Real Stores. Real Results.',
    placeholder: '(Your case studies go here)',
  },
  contact: {
    title: "Let's Build Something.",
    intro: 'Got a project? Email me. I reply within one business day.',
    email: 'kevin@kevthedev.site',
    note: 'No sales calls. No fluff. Just a straight conversation.',
  },
  footer: {
    line: 'Built in BC. Focused on Shopify.',
    copyright: '© 2026 kevthedev',
  },
} as const
