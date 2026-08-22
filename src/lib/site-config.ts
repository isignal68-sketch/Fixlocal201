export const siteConfig = {
  name: 'FixLocal',
  description: 'Book trusted local service pros near you.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/fixlocal',
    instagram: 'https://instagram.com/fixlocal',
    facebook: 'https://facebook.com/fixlocal',
    linkedin: 'https://linkedin.com/company/fixlocal',
  },
  supportEmail:supportEmail: 'fixlocal614@gmail.com',

  commissionPercent: Number(process.env.NEXT_PUBLIC_APP_FEE_PERCENT ?? 15),
} as const;

export const mainNav = [
  { title: 'Browse services', href: '/categories' },
  { title: 'How it works', href: '/how-it-works' },
  { title: 'For businesses', href: '/pro' },
] as const;

export const footerNav = {
  company: [
    { title: 'About', href: '/about' },
    { title: 'Careers', href: '/careers' },
    { title: 'Press', href: '/press' },
    { title: 'Blog', href: '/blog' },
  ],
  support: [
    { title: 'Help center', href: '/help' },
    { title: 'Trust & safety', href: '/trust-and-safety' },
    { title: 'Contact us', href: '/contact' },
    { title: 'Cost guides', href: '/cost-guides' },
  ],
  providers: [
    { title: 'Join as a pro', href: '/pro/join' },
    { title: 'Pro resources', href: '/pro/resources' },
    { title: 'Success stories', href: '/pro/success-stories' },
    { title: 'Pro app', href: '/pro/app' },
  ],
  legal: [
    { title: 'Terms of service', href: '/legal/terms' },
    { title: 'Privacy policy', href: '/legal/privacy' },
    { title: 'Cookie policy', href: '/legal/cookies' },
    { title: 'Guarantee', href: '/legal/guarantee' },
  ],
} as const;

export const serviceCategories = [
  { name: 'Plumbing', slug: 'plumbing', icon: 'Wrench', description: 'Leaks, pipes, water heaters, and repairs.' },
  { name: 'Electrical', slug: 'electrical', icon: 'Zap', description: 'Wiring, panels, lighting, and safety inspections.' },
  { name: 'HVAC', slug: 'hvac', icon: 'Thermometer', description: 'Heating, cooling, and air quality systems.' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'Sparkles', description: 'Home, office, deep, and move-out cleaning.' },
  { name: 'Handyman', slug: 'handyman', icon: 'Hammer', description: 'Small repairs and general home fixes.' },
  { name: 'Painting', slug: 'painting', icon: 'PaintBucket', description: 'Interior, exterior, and cabinet painting.' },
  { name: 'Roofing', slug: 'roofing', icon: 'Home', description: 'Repairs, replacement, and inspections.' },
  { name: 'Landscaping', slug: 'landscaping', icon: 'Trees', description: 'Lawn care, design, and maintenance.' },
  { name: 'Flooring', slug: 'flooring', icon: 'LayoutGrid', description: 'Installation, refinishing, and repair.' },
  { name: 'Remodeling', slug: 'remodeling', icon: 'Ruler', description: 'Full home and room renovations.' },
  { name: 'Moving', slug: 'moving', icon: 'Truck', description: 'Local and long-distance moving help.' },
  { name: 'Locksmith', slug: 'locksmith', icon: 'KeyRound', description: 'Lockouts, rekeys, and security upgrades.' },
  { name: 'Pest Control', slug: 'pest-control', icon: 'Bug', description: 'Inspections and pest removal.' },
  { name: 'Pressure Washing', slug: 'pressure-washing', icon: 'Droplets', description: 'Driveways, siding, and decks.' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Wrench', description: 'Washers, dryers, fridges, and more.' },
  { name: 'Auto Repair', slug: 'auto-repair', icon: 'Car', description: 'Mobile mechanics and diagnostics.' },
  { name: 'Pool Services', slug: 'pool-services', icon: 'Waves', description: 'Cleaning, repair, and maintenance.' },
  { name: 'Window Cleaning', slug: 'window-cleaning', icon: 'AppWindow', description: 'Interior and exterior window care.' },
  { name: 'Junk Removal', slug: 'junk-removal', icon: 'Trash2', description: 'Hauling and clean-out services.' },
  { name: 'Tree Service', slug: 'tree-service', icon: 'TreePine', description: 'Trimming, removal, and stump grinding.' },
  { name: 'Concrete', slug: 'concrete', icon: 'Box', description: 'Driveways, patios, and foundations.' },
  { name: 'Drywall', slug: 'drywall', icon: 'PanelsTopLeft', description: 'Installation, repair, and finishing.' },
  { name: 'Tile', slug: 'tile', icon: 'Grid3x3', description: 'Installation and repair for floors and walls.' },
  { name: 'Bathroom Remodel', slug: 'bathroom-remodel', icon: 'Bath', description: 'Full and partial bathroom renovations.' },
  { name: 'Kitchen Remodel', slug: 'kitchen-remodel', icon: 'CookingPot', description: 'Full and partial kitchen renovations.' },
  { name: 'Garage Door', slug: 'garage-door', icon: 'DoorClosed', description: 'Repair, replacement, and openers.' },
  { name: 'Solar', slug: 'solar', icon: 'Sun', description: 'Installation and consultations.' },
  { name: 'Carpet Cleaning', slug: 'carpet-cleaning', icon: 'Layers', description: 'Deep cleaning and stain removal.' },
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export const bookingStatuses = [
  'pending',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export const userRoles = ['customer', 'provider', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];
