import { Button } from "../ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center flex-col gap-3 text-center">
      <p className="text-sm font-medium">No filters applied yet</p>
      <p className="text-sm text-muted-foreground">
        Get started and configure your search, or apply suggested filters.
      </p>
      <Button variant="outline" size="sm">
        Apply suggested filters
      </Button>
    </div>
  )
}