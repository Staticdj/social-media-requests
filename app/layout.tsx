import type { Metadata } from 'next';
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'Social Media Requests',
  description: 'Submit content requests for social media posts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}