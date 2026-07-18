import "./globals.css";

export const metadata = {
  title: "Personal Tracker",
  description: "Track your tasks, goals, water, and sleep in one place.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon.svg" },
    { rel: "apple-touch-icon", url: "/icons/icon.svg" },
  ],
};

export const viewport = {
  themeColor: "#0070f3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0070f3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Personal Tracker" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
