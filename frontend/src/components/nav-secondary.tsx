import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

function NavSecondaryLink({
  url,
  children,
  ...props
}: {
  url: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<'a'>, 'href'>) {
  if (url.startsWith('/')) {
    return (
      <Link to={url} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} {...props}>
      {children}
    </a>
  );
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <NavSecondaryLink url={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </NavSecondaryLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
