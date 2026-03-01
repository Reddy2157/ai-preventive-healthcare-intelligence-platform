import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import RiskPredictor from "@/pages/RiskPredictor";
import XRayAnalysis from "@/pages/XRayAnalysis";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import { Heart } from "lucide-react";

const queryClient = new QueryClient();

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <header className="h-12 border-b border-border flex items-center px-4 gap-2 bg-background/80 backdrop-blur sticky top-0 z-10">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground">
            AI Preventive Healthcare Platform
          </span>
        </header>
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
        <footer className="border-t border-border py-3 px-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} HealthGuard AI</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-health-red fill-health-red mx-0.5" /> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "healthguard-ai"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors ml-0.5"
            >
              caffeine.ai
            </a>
          </span>
        </footer>
      </div>
    </SidebarProvider>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RiskPredictor,
});

const xrayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/xray",
  component: XRayAnalysis,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: History,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  xrayRoute,
  dashboardRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
