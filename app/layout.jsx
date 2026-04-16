import "./globals.css";
import "@/lib/console-capture";
import "@/utils/screenshot-capture";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedLayout from "./components/ProtectedLayout";
import { AppGenProvider } from "@/components/appgen-provider";

export const metadata = {
  title: "Flovia",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" />
        <script src="https://unpkg.com/@phosphor-icons/web"></script>
      </head>
      <body className="antialiased">
        <AppGenProvider>
          <AuthProvider>
            <ProtectedLayout>{children}</ProtectedLayout>
          </AuthProvider>
        </AppGenProvider>
      </body>
    </html>
  );
}
