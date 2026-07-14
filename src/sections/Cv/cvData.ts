/** Контент CV-секции — перенесён из макета Figma (страница CV, 127:7759) один в один. */

export const PROFILE_TEXT =
  'Product designer creating complex B2B SaaS and digital products from product architecture to polished interfaces. I turn complex business requirements into clear, engaging experiences while balancing user needs and business goals.'

export type EducationRow = {
  label: string
  values: string[]
}

export const EDUCATION: EducationRow[] = [
  { label: 'UPROCK', values: ['UX/UI design Middle+'] },
  { label: 'EYES Platfotm', values: ['(1) Brand Strategy course', '(2) Marketing course'] },
  { label: 'South Ural State Technical College', values: ['Architecture'] },
]

/** Ряды тегов — группировка как в макете */
export const SKILL_ROWS: string[][] = [
  ['Product strategy', 'Interaction design', 'UX Architecture'],
  ['End-to-End Product Design', 'Complex user flows', 'Visual design'],
  ['Design systems', 'Monetization UX', 'UX Research', 'Design mentorship'],
  ['Cross-functional Collaboration', 'AI-prototyping', 'AI Image generation'],
  ['Figma', 'Photoshop', 'Figma AI', 'Claude Code/Design', 'Chat GPT', 'Codex'],
]

export type ExperienceEntry = {
  years: string
  title: string
  paragraphs: string[]
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    years: '2026',
    title: 'Jaznu / B2B SaaS for the restaurants',
    paragraphs: [
      'Led UX strategy for billing and monetization in a B2B QR-menu SaaS, shaping wallet, paid access, trial, bonus, grace and notification logic across the product.',
      'Defined robust PayPal and wallet flows, turning technical payment statuses and edge cases into clear user states, recovery paths and transparent ledger experiences.',
      'Created a research-backed free-to-paid conversion model with health scoring, contextual paywalls, value recaps and feature packaging to support retention without aggressive monetization.',
    ],
  },
  {
    years: '2026',
    title: 'Seemrush by Adobe / B2B EdTech SaaS',
    paragraphs: [
      'Designed a B2B learning platform for a digital marketing education program within a tight delivery timeline.',
      'Created clear, development-ready interfaces in alignment with the existing design system, brand guidelines and product requirements.',
      'Delivered the complete product experience to development, receiving highly positive feedback from the client.',
    ],
  },
  {
    years: '2025-26',
    title: 'Speec.io / AI-powered B2B SaaS',
    paragraphs: [
      'Led end-to-end product design as the sole designer, transforming an early AI-generated prototype into a coherent, intuitive product ready for initial users.',
      'Defined the UX architecture, core user journeys, interaction patterns, visual direction and scalable design system.',
      'Partnered with the founder and engineering team to shape the MVP, prioritize key scenarios and continuously adapt the experience to new insights and technical constraints.',
    ],
  },
  {
    years: '2023-26',
    title: 'Grow.Repeat / B2B Tech & Growth Agency',
    paragraphs: [
      'Designed conversion-focused websites and digital products for B2B SaaS companies, technology businesses and startups.',
      'Defined website structure, user flows and high-fidelity interfaces, aligning user experience with brand identity and business goals.',
      'Created responsive, scalable and development-ready design solutions across multiple client projects.',
    ],
  },
]

export const EMAIL = 'alemasova.design@gmail.com'
