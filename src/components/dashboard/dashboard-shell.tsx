"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart,
  User,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Tag,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarNavItems = [
    {
      title: "Accueil",
      href: "/admin-dashboard",
      icon: Home,
    },
    {
      title: "Utilisateurs",
      href: "/admin-dashboard/users",
      icon: User,
    },
    {
      title: "Quiz",
      href: "/admin-dashboard/quizzes",
      icon: BookOpen,
    },
    {
      title: "Catégories",
      href: "/admin-dashboard/categories",
      icon: Tag, 
    },
    {
      title: "Statistiques",
      href: "/admin-dashboard/stats",
      icon: BarChart,
    },
  ];

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Helper function to check if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/admin-dashboard') {
      return pathname === '/admin-dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-7">
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-bold text-xl">Quiz Game Admin</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 px-2 py-4">
                  {sidebarNavItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-base",
                        isLinkActive(item.href)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="hidden items-center gap-2 md:flex">
              <span className="text-2xl font-bold">Quiz Game Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <div className="flex flex-col space-y-1 text-right">
                      <p className="text-base font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-sm leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <Avatar>
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback>
                      {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Déconnexion</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="flex flex-col gap-2 p-4">
            {sidebarNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-base",
                  isLinkActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}