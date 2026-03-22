import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoles } from '@/hooks/use-roles';
import { BarChartIcon, BriefcaseIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

function isRoleActive(pathname: string, roleId: string) {
  return pathname.startsWith(`/roles/${roleId}/`);
}

export function NavRoles() {
  const { data, isLoading } = useRoles();
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Roles</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full rounded-md" />
          </>
        ) : data?.roles.length ? (
          data.roles.map((role) => (
            <Collapsible
              key={role.id}
              asChild
              defaultOpen={isRoleActive(pathname, role.id)}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={role.name}
                  isActive={isRoleActive(pathname, role.id)}
                >
                  <BriefcaseIcon />
                  <span>{role.name}</span>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRightIcon />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === `/roles/${role.id}/search`}
                      >
                        <NavLink to={`/roles/${role.id}/search`}>
                          <SearchIcon />
                          <span>Search</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === `/roles/${role.id}/ranking`}
                      >
                        <NavLink to={`/roles/${role.id}/ranking`}>
                          <BarChartIcon />
                          <span>Ranking</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))
        ) : (
          <p className="px-2 text-xs text-muted-foreground">No roles found.</p>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
