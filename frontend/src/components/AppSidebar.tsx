import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Activity, LayoutDashboard, History, ImageIcon, Heart } from 'lucide-react';

const navItems = [
  {
    title: 'Risk Predictor',
    path: '/',
    icon: Activity,
    description: 'Assess health risk',
  },
  {
    title: 'X-Ray Analysis',
    path: '/xray',
    icon: ImageIcon,
    description: 'Chest X-ray classifier',
  },
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'View all records',
  },
  {
    title: 'History',
    path: '/history',
    icon: History,
    description: 'Prediction history',
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/healthguard-logo.dim_128x128.png"
            alt="HealthGuard Logo"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <p className="font-display font-bold text-sidebar-foreground text-base leading-tight">
              HealthGuard AI
            </p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight mt-0.5">
              Preventive Intelligence
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-xs uppercase tracking-wider px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="default"
                      className="mx-2 rounded-lg"
                    >
                      <Link to={item.path} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium leading-tight">{item.title}</span>
                          <span className="text-xs opacity-60 leading-tight truncate">{item.description}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mx-4 my-2 p-3 rounded-xl bg-sidebar-accent/60 border border-sidebar-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-sidebar-primary" />
                <span className="text-xs font-semibold text-sidebar-foreground/80">Disclaimer</span>
              </div>
              <p className="text-xs text-sidebar-foreground/50 leading-relaxed">
                For educational purposes only. Not a substitute for professional medical advice.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-sidebar-foreground/30 text-center">
          © {new Date().getFullYear()} HealthGuard AI
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
