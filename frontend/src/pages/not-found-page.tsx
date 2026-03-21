import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground text-sm">
        This path does not exist. Go back to the dashboard.
      </p>
      <Link
        to="/"
        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
