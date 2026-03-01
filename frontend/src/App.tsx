import React from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { RiskPredictor } from '@/pages/RiskPredictor';
import { XRayAnalysis } from '@/pages/XRayAnalysis';
import { Dashboard } from '@/pages/Dashboard';
import { History } from '@/pages/History';
import { Separator } from '@/components/ui/separator';
import { Heart } from 'lucide-react';

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-1" />
          <span className="text-sm font-display font-semibold text-foreground">
            AI Preventive Healthcare Platform
          </span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="border-t border-border px-6 py-4 bg-card/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} HealthGuard AI — For educational purposes only. Not a substitute for professional medical advice.
            </p>
            <p className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-health-red fill-health-red" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'healthguard-ai')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RiskPredictor,
});

const xrayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/xray',
  component: XRayAnalysis,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History,
});

const routeTree = rootRoute.addChildren([indexRoute, xrayRoute, dashboardRoute, historyRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
