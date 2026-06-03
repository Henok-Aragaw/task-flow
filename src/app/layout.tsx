import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import QueryProvider from "@/hooks/query-provider";

const sansFont = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow",
    template: "%s | TaskFlow",
  },
  description:
    "TaskFlow is a modern multi-workspace project and task management platform built for teams to organize projects, track progress, collaborate in real time, and manage workflows efficiently.",

  keywords: [
    "task management",
    "project management",
    "workspace management",
    "team collaboration",
    "nextjs",
    "supabase",
    "saas",
    "taskflow",
    "productivity",
  ],

  authors: [
    {
      name: "Henok Aragaw",
    },
  ],

  creator: "Henok Aragaw",

  openGraph: {
    title: "TaskFlow",
    description:
      "A modern multi-workspace task management platform with projects, tasks, realtime collaboration, and secure authentication.",
    type: "website",
    locale: "en_US",
    siteName: "TaskFlow",
  },

  twitter: {
    card: "summary_large_image",
    title: "TaskFlow",
    description:
      "Manage projects, tasks, and team collaboration with TaskFlow.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
