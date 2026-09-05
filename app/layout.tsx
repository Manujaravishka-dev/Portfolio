import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Manuja Ravishka — Creative Developer', description: 'The personal portfolio of Manuja Ravishka. Exploring code, interaction, and digital experiences.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
