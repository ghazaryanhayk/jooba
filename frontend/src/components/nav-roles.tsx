import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SidebarGroup,
  SidebarGroupAction,
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
import { useCreateRole } from '@/hooks/use-create-role';
import { useRoles } from '@/hooks/use-roles';
import { BarChartIcon, BriefcaseIcon, ChevronRightIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

function isRoleActive(pathname: string, roleId: string) {
  return pathname.startsWith(`/roles/${roleId}/`);
}

export function NavRoles() {
  const { data, isLoading } = useRoles();
  const { pathname } = useLocation();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const { mutate, isPending } = useCreateRole();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(name.trim(), {
      onSuccess: () => {
        setOpen(false);
        setName('');
      },
    });
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Roles</SidebarGroupLabel>
        <SidebarGroupAction title="Add role" onClick={() => setOpen(true)}>
          <PlusIcon />
          <span className="sr-only">Add role</span>
        </SidebarGroupAction>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 py-2">
              <Label htmlFor="role-name">Title</Label>
              <Input
                id="role-name"
                placeholder="e.g. Senior Engineer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
