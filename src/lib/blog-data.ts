export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  body: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-much-does-a-plumber-cost',
    title: 'How much does a plumber cost in 2026?',
    excerpt:
      'A breakdown of typical plumbing rates by job type, from a dripping faucet to a full repipe.',
    category: 'Cost guides',
    readTime: '6 min read',
    body: [
      'Plumbing costs vary widely based on the scope of the job, your location, and whether the work is an emergency call. Most licensed plumbers charge either a flat rate for common jobs or an hourly rate for diagnostic and repair work.',
      'For simple jobs like a leaky faucet repair or clearing a clogged drain, expect a flat fee. More involved work, like water heater installation or repiping a section of your home, is typically priced based on materials and labor hours combined.',
      'Emergency and after-hours calls usually carry a premium. Getting quotes from two or three verified providers before booking is the best way to ensure a fair price for your specific job.',
    ],
  },
  {
    slug: 'signs-you-need-a-new-hvac-system',
    title: "7 signs it's time to replace your HVAC system",
    excerpt:
      'What to look for before your heating or cooling system leaves you in the cold — or the heat.',
    category: 'Home maintenance',
    readTime: '5 min read',
    body: [
      'Most residential HVAC systems last 15-20 years with regular maintenance. As they approach the end of that range, a few warning signs tend to show up.',
      'Rising energy bills without a change in usage, uneven temperatures between rooms, frequent repairs, and unusual noises are all signals worth having a licensed HVAC technician evaluate.',
      'A professional inspection can tell you whether a repair will hold you over or whether replacement is the more cost-effective path forward.',
    ],
  },
  {
    slug: 'how-to-vet-a-contractor',
    title: 'How to vet a contractor before you hire',
    excerpt: 'The questions to ask, documents to request, and red flags to watch for.',
    category: 'Hiring tips',
    readTime: '7 min read',
    body: [
      'Before hiring any contractor, confirm they carry an active license appropriate for the job and general liability insurance. Ask to see documentation directly rather than taking their word for it.',
      'Read recent, verified reviews rather than testimonials on a contractor\'s own site. Ask for references from jobs completed in the last six months, and follow up with at least one.',
      'Get the scope of work, timeline, and payment schedule in writing before any work begins. A reluctance to put terms in writing is one of the clearest red flags.',
    ],
  },
  {
    slug: 'kitchen-remodel-budget-breakdown',
    title: 'What a kitchen remodel actually costs, room by room',
    excerpt: "From cabinets to countertops, here's where your renovation budget goes.",
    category: 'Cost guides',
    readTime: '8 min read',
    body: [
      'Kitchen remodels vary enormously based on scope. A cosmetic refresh (paint, hardware, backsplash) sits at the low end, while a full gut renovation with layout changes sits at the high end.',
      'Cabinetry and countertops typically account for the largest share of a mid-range remodel budget, followed by appliances and labor. Structural changes, like moving plumbing or removing a wall, add significant cost.',
      'Getting itemized quotes from multiple remodelers — broken down by cabinets, countertops, appliances, labor, and permits — makes it much easier to compare bids accurately.',
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
