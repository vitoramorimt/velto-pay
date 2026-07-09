"use client";

import * as React from "react";

import { cn } from "@/shared/utils/cn";

type TabsContextValue = {
  onValueChange: (value: string) => void;
  value: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used inside <Tabs>.");
  }

  return context;
}

function Tabs({
  children,
  className,
  onValueChange,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & TabsContextValue) {
  return (
    <TabsContext.Provider value={{ onValueChange, value }}>
      <div className={cn("min-w-0", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-6 overflow-x-auto border-b border-border/70",
        className,
      )}
      role="tablist"
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = useTabsContext();
  const isActive = context.value === value;

  return (
    <button
      aria-selected={isActive}
      className={cn(
        "relative -mb-px h-11 shrink-0 whitespace-nowrap border-b border-transparent px-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive && "border-foreground text-foreground",
        className,
      )}
      onClick={() => context.onValueChange(value)}
      role="tab"
      type="button"
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = useTabsContext();

  if (context.value !== value) {
    return null;
  }

  return (
    <div
      className={cn("min-w-0 focus-visible:outline-none", className)}
      role="tabpanel"
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
