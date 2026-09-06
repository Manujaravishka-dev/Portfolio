// Edit your skills here. Each sector keeps a title and its list of skill cards.
export interface SkillSector {
  title: string;
  skills: string[];
}

export const skillSectors: SkillSector[] = [
  { title: 'Frontend & Frameworks', skills: ['React / Next.js', 'TypeScript', 'JavaScript', 'Vue / Nuxt.js', 'Angular', 'Remix'] },
  { title: 'UI / Creative', skills: ['Three.js / R3F', 'WebGL', 'WebXR', 'GLSL Shaders', 'GSAP', 'Framer Motion', 'Pixi.js', 'P5.js', 'Cannon.js'] },
  { title: 'Mobile Development', skills: ['React Native', 'Expo'] },
  { title: 'Backend & API', skills: ['Node.js', 'PHP / Laravel', 'GraphQL', 'Supabase', 'REST APIs'] },
  { title: 'Databases', skills: ['MySQL', 'PostgreSQL'] },
  { title: 'Tools & Workflow', skills: ['Tailwind CSS', 'Redux', 'Vite', 'Webpack', 'Jest', 'Cypress', 'Storybook', 'Figma', 'Git / GitHub'] },
  { title: 'CMS & E-Commerce', skills: ['Strapi', 'Prismic', 'Contentful', 'Sanity', 'HyGraph', 'WordPress', 'Shopify', 'Webflow', 'Framer'] },
  { title: 'Web3 & Blockchain', skills: ['Web3.js', 'Ethers.js', 'wagmi'] },
  { title: 'AI Systems & Intelligence', skills: ['OpenAI API', 'Anthropic API', 'Claude Code', 'Codex', 'AI IDEs', 'LangChain'] },
];