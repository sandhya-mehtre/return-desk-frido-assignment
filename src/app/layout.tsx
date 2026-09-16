import type { Metadata } from "next";
import "./globals.css";
import ReduxProviders from "../lib/redux/Providers";

export const metadata: Metadata = {
  title: "ReturnDesk",
  description: "Returns desk for a small online store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}