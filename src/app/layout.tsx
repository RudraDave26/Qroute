import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'QuantumRoute AI: Quantum-Inspired Intelligent Traffic Route Optimization',
  description:
    'Advanced traffic navigation, multi-objective route optimization, and EV energy modeling powered by Quantum-Inspired Genetic Algorithms (QIGA) and real geospatial data. Built by MVP MAKERS.',
  keywords: [
    'traffic optimization',
    'quantum-inspired genetic algorithm',
    'QIGA',
    'metaheuristics',
    'EV route optimization',
    'traffic routing',
    'Dijkstra',
    'A*',
    'MVP MAKERS',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-quantum-500/20 selection:text-quantum-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
