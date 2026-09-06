import type { Metadata, Viewport } from 'next';
import './globals.css';
import MouseTrail from '@/components/MouseTrail';
export const metadata: Metadata = { title: 'Manuja Ravishka — Creative Developer', description: 'The personal portfolio of Manuja Ravishka. Exploring code, interaction, and digital experiences.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><MouseTrail/>{children}</body></html>; }
