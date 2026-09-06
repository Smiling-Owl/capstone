"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PrototypeToolbar } from "./prototype-toolbar";
import { RoleNavItem } from "@/lib/role-nav";

const COLLAPSE_STORAGE_KEY = "sitrepo-sidebar-collapsed";

export function RoleShell({
  role,
  subtitle,
  nav,
  mobileNav,
  activeHref,
  userInitials,
  userName,
  children,
}: {
  role: "purok" | "barangay" | "drrm";
  subtitle: string;
  nav: RoleNavItem[];
  mobileNav: RoleNavItem[];
  activeHref: string;
  userInitials: string;
  userName: string;
  children: React.ReactNode;
}) {
  const isPurok = role === "purok";
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable; keep default expanded state.
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage unavailable; state still updates for this session.
      }
      return next;
    });
  }

  function navigationItem(item: RoleNavItem) {
    if (!item.enabled) {
      return (
        <span aria-disabled="true" aria-label={`${item.label}, unavailable in this prototype`} key={item.label}>
          {item.label}
        </span>
      );
    }
    return (
      <Link href={item.href} aria-current={item.href === activeHref ? "page" : undefined} key={item.label}>
        {item.label}
      </Link>
    );
  }

  return (
    <>
      <a className="skip-link" href="#workspace-main">Skip to workspace</a>
      <PrototypeToolbar current={role} />
      <div className={`${isPurok ? "mobile-shell" : "desktop-shell"}${!isPurok && collapsed ? " sidebar-collapsed" : ""}`}>
        {!isPurok && (
          <aside className={`side-navigation${collapsed ? " collapsed" : ""}`}>
            <div className="side-navigation-brand">
              <div className="side-navigation-identity">
                <Image className="identity-mark" src="/logo.png" alt="" width={52} height={52} />
                <Link className="system-short-name" href="/login" inert={collapsed}>SitRepO</Link>
              </div>
              <button type="button" className="sidebar-toggle" onClick={toggleSidebar} aria-expanded={!collapsed}>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span className="visually-hidden">{collapsed ? "Show navigation" : "Hide navigation"}</span>
              </button>
            </div>
            <div className="side-navigation-body" inert={collapsed}>
              <p className="navigation-scope">{subtitle}</p>
              <nav aria-label="Workspace navigation">{nav.map(navigationItem)}</nav>
              <p className="navigation-note">Dimmed sections arrive in later prototype checkpoints.</p>
              <div className="signed-in-user">
                <span>{userInitials}</span>
                <div>
                  <strong>{userName}</strong>
                  <small>Authorized user</small>
                </div>
              </div>
            </div>
          </aside>
        )}
        <main className="role-content" id="workspace-main">
          {children}
        </main>
        <nav className="mobile-navigation" aria-label="Workspace mobile navigation">
          {mobileNav.map(navigationItem)}
        </nav>
      </div>
    </>
  );
}
