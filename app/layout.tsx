import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subscription Tracker",
  description: "A personal app for tracking paid subscriptions and renewals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&p)){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
