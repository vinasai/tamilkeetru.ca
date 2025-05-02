import { useState, useEffect } from "react";

export interface DatabaseStatus {
  status: "ok" | "error" | "loading";
  connected: boolean;
  message: string;
}

export function useDatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>({
    status: "loading",
    connected: false,
    message: "Checking database connection..."
  });

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch("/api/health");
        
        if (!response.ok) {
          const errorData = await response.json();
          setStatus({
            status: "error",
            connected: false,
            message: errorData.message || "Database connection failed"
          });
          return;
        }
        
        const data = await response.json();
        
        setStatus({
          status: data.status,
          connected: data.database === "connected",
          message: data.message
        });
      } catch (error) {
        setStatus({
          status: "error",
          connected: false,
          message: "Failed to check database status"
        });
      }
    };

    checkDatabaseStatus();

    // Periodically check database status
    const intervalId = setInterval(checkDatabaseStatus, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, []);

  return status;
} 