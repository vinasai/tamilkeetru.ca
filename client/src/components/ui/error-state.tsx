import React from "react";
import { AlertCircle, Database, FileX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: "error" | "empty" | "database";
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function ErrorState({
  title,
  description,
  variant = "error",
  icon,
  action,
  className,
  ...props
}: ErrorStateProps) {
  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "database":
        return <Database className="h-10 w-10 text-destructive" />;
      case "empty":
        return <FileX className="h-10 w-10 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-10 w-10 text-destructive" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "database":
        return "border-destructive";
      case "empty":
        return "border-muted";
      default:
        return "border-destructive";
    }
  };

  return (
    <Alert 
      className={cn(
        "flex flex-col items-center justify-center py-10 text-center border-2",
        getVariantStyles(),
        className
      )}
      {...props}
    >
      <div className="mb-4">{getIcon()}</div>
      <AlertTitle className="text-xl mb-2">{title}</AlertTitle>
      {description && (
        <AlertDescription className="text-center max-w-md mx-auto mb-4">
          {description}
        </AlertDescription>
      )}
      {action && <div className="mt-4">{action}</div>}
    </Alert>
  );
}

export function DatabaseErrorState({
  className,
  ...props
}: Omit<ErrorStateProps, "variant" | "title"> & { title?: string }) {
  return (
    <ErrorState
      variant="database"
      title={props.title || "Database Connection Error"}
      description={props.description || "Unable to connect to the database. Please try again later."}
      className={cn("mb-6", className)}
      {...props}
    />
  );
}

export function EmptyState({
  className,
  ...props
}: Omit<ErrorStateProps, "variant" | "title"> & { title?: string }) {
  return (
    <ErrorState
      variant="empty"
      title={props.title || "No Data Found"}
      description={props.description || "There are no items to display at this time."}
      className={cn("border-dashed mb-6", className)}
      {...props}
    />
  );
} 