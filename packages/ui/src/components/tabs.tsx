'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '../lib/utils';

// Views of one page (U4 upcoming / past, P4 log in / sign up). Underlined, not pills (A01);
// active tab = default text + 2 px bar in the selection accent (R04.2, K4, P-T15); no counters
// on tabs (R02.4).
const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'flex w-full gap-tight overflow-x-auto border-b border-border-divider',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex min-h-control shrink-0 items-center justify-center gap-inline px-group text-label font-medium whitespace-nowrap text-text-muted transition-colors duration-fast after:absolute after:inset-x-0 after:bottom-0 after:h-tab-indicator hover:text-text-default data-active:text-text-default data-active:after:bg-track-on data-disabled:cursor-not-allowed data-disabled:text-text-disabled [&_svg]:size-icon-sm',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('pt-group', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
