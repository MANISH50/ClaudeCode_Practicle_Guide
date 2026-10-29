"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = { href: string; className?: string; children: ReactNode };

// Marks the current page and closes the mobile drawer (a popover) after a click.
export function NavLink({ href, className, children }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      onClick={(event) => {
        // hidePopover() throws on a closed popover, so check first.
        const drawer = event.currentTarget.closest<HTMLElement>("[popover]:popover-open");
        drawer?.hidePopover();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
