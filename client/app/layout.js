import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata = {
  title: "onCinema",
  description: "Cinema booking platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><ClientShell>{children}</ClientShell></body>
    </html>
  );
}
