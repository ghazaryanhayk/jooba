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
import { Badge } from '@/components/ui/badge';
import { SearchStatusContext } from '@/contexts/search-status-context';
import { useRoles } from '@/hooks/use-roles';

export function AppLayout() {
  const matches = useMatches();
  const [searchStatus, setSearchStatus] = React.useState<string | null>(null);

  const { data: rolesData } = useRoles();
  const roleId = matches.find((m) => (m.params as Record<string, string>).roleId)?.params.roleId ?? null;
  const roleName = roleId ? (rolesData?.roles.find((r) => r.id === roleId)?.name ?? null) : null;

  const crumbs = React.useMemo(() => {
    const staticCrumbs = matches
      .filter((m) => m.handle && typeof m.handle === 'object' && 'crumb' in m.handle && m.handle.crumb)
      .map((m) => ({ label: (m.handle as { crumb: string }).crumb, path: m.pathname }));

    return roleName && roleId
      ? [staticCrumbs[0], { label: roleName, path: `/roles/${roleId}/search` }, ...staticCrumbs.slice(1)]
      : staticCrumbs;
  }, [matches, roleName, roleId]);

  return (
    <SearchStatusContext.Provider value={{ searchStatus, setSearchStatus }}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="max-h-screen">
            <header className="flex h-10 shrink-0 items-center gap-2">
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
                {searchStatus && (
                  <Badge variant="secondary">{searchStatus}</Badge>
                )}
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 pt-0 overflow-y-hidden">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SearchStatusContext.Provider>
  );
}
