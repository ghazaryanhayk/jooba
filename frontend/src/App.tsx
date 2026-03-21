import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function App() {
  const [health, setHealth] = useState<string>("loading…");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setHealth(JSON.stringify(j)))
      .catch(() => setHealth("error (is the API up?)"));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Jooba</h1>
      <p className="mt-2 text-muted-foreground">
        API <code className="text-foreground">/health</code> via Vite proxy:{" "}
        {health}
      </p>
      <Button className="mt-4" type="button">
        shadcn Button
      </Button>
    </main>
  );
}
