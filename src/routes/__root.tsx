import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/components/app/AppStore";
import { AppLayout } from "@/components/app/AppLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { useLocation } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lumen — Tasks, Calendar & Habits" },
      { name: "description", content: "A Notion-inspired dark workspace for daily tasks, calendar planning and habit streaks. Local-first, fast and beautiful." },
      { name: "author", content: "Lumen" },
      { property: "og:title", content: "Lumen — Tasks, Calendar & Habits" },
      { property: "og:description", content: "Plan your day, schedule by date and time range, track habits and build streaks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouteShell />
        <Toaster />
      </AppProvider>
    </AuthProvider>
  );
}

function RouteShell() {
  const { pathname } = useLocation();
  // Auth page renders without sidebar/layout
  if (pathname.startsWith("/auth")) return <Outlet />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
