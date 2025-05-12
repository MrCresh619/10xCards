import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Button>;

const PaginationLink = ({ className, isActive, ...props }: PaginationLinkProps) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    {...props}
    className={cn(className)}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do poprzedniej strony"
    variant="ghost"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Poprzednia</span>
  </Button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do następnej strony"
    variant="ghost"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Następna</span>
    <ChevronRight className="h-4 w-4" />
  </Button>
);
PaginationNext.displayName = "PaginationNext";

const PaginationFirst = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do pierwszej strony"
    variant="ghost"
    className={cn(className)}
    {...props}
  >
    <ChevronsLeft className="h-4 w-4" />
  </Button>
);
PaginationFirst.displayName = "PaginationFirst";

const PaginationLast = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Przejdź do ostatniej strony"
    variant="ghost"
    className={cn(className)}
    {...props}
  >
    <ChevronsRight className="h-4 w-4" />
  </Button>
);
PaginationLast.displayName = "PaginationLast";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
};
