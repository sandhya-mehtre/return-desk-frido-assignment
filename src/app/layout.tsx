import type { Metadata } from "next";
import "./globals.css";
import ReduxProviders from "../lib/redux/Providers";
import Navbar from "@/components/Navbar";

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
<body className="bg-white text-gray-900">
<Navbar />
        <ReduxProviders>{children}</ReduxProviders>
      </body>
    </html>
  );
}