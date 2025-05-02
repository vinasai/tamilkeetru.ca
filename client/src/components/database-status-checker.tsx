import React from "react";
import { useDatabaseStatus } from "@/hooks/use-database-status";
import { DatabaseErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DatabaseStatusCheckerProps {
  children: React.ReactNode;
}

export function DatabaseStatusChecker({ children }: DatabaseStatusCheckerProps) {
  const dbStatus = useDatabaseStatus();
  
  // Skip checking during loading
  if (dbStatus.status === "loading") {
    return <>{children}</>;
  }

  // Show error if database is not connected
  if (dbStatus.status === "error" || !dbStatus.connected) {
    return (
      <div className="container mx-auto py-12 px-4">
        <DatabaseErrorState 
          description={dbStatus.message}
          action={
            <Button 
              onClick={() => window.location.reload()} 
              variant="destructive"
              className="mt-2"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // Database is connected, render children
  return <>{children}</>;
} 