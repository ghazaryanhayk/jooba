import * as React from 'react';
import { Link, Outlet, useMatches } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppLayout() {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => m.handle && typeof m.handle === 'object' && 'crumb' in m.handle && m.handle.crumb)
    .map((m) => ({
      label: (m.handle as { crumb: string }).crumb,
      path: m.pathname,
    }));

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="max-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  {crumbs.map((c, i) => {
                    const isLast = i === crumbs.length - 1;
                    return (
                      <React.Fragment key={`${c.path}-${c.label}-${i}`}>
                        {i > 0 ? (
                          <BreadcrumbSeparator className="hidden md:block" />
                        ) : null}
                        <BreadcrumbItem className={i === 0 ? 'hidden md:block' : undefined}>
                          {isLast ? (
                            <BreadcrumbPage>{c.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={c.path}>{c.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 pt-0 overflow-y-hidden">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
