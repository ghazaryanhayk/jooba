import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoles } from '@/hooks/use-roles';
import { SearchIcon } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading } = useRoles();
  const role = data?.roles[0];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome home. Add your overview content here.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Active Role
        </h2>
        {isLoading ? (
          <Skeleton className="h-10 w-48" />
        ) : role ? (
          <Button asChild className="w-fit gap-2">
            <Link to={`/roles/${role.id}/search`}>
              <SearchIcon className="size-4" />
              {role.name}
            </Link>
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm">No roles found.</p>
        )}
      </div>
    </div>
  );
}
