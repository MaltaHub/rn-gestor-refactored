import { useMemo, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  Megaphone,
  ShoppingCart,
  Gift,
  Users,
  Landmark,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Estoque", path: "/estoque", icon: <Warehouse className="h-4 w-4" /> },
  { label: "Anuncios", path: "/anuncios", icon: <Megaphone className="h-4 w-4" /> },
  { label: "Vendas", path: "/vendas", icon: <ShoppingCart className="h-4 w-4" /> },
  { label: "Promocoes", path: "/promocoes", icon: <Gift className="h-4 w-4" /> },
  { label: "Membros", path: "/membros", icon: <Users className="h-4 w-4" /> },
  { label: "Lojas", path: "/lojas", icon: <Landmark className="h-4 w-4" /> },
  { label: "Documentacao", path: "/documentacao", icon: <FileText className="h-4 w-4" /> },
];

function NavigationList({ orientation = "vertical", onNavigate }: { orientation?: "vertical" | "horizontal"; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        orientation === "vertical"
          ? "flex flex-1 flex-col gap-1"
          : "grid grid-cols-2 gap-2 md:grid-cols-4"
      )}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              isActive || location.pathname === item.path
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60"
            )
          }
          end={item.path === "/"}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentSection = useMemo(() => {
    const match = NAV_ITEMS.find((item) =>
      item.path === "/" ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return match?.label ?? "Dashboard";
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Falha ao encerrar sessao", error);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden h-full w-72 border-r border-border bg-card/60 p-6 lg:flex lg:flex-col lg:overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            GM
          </div>
          <div>
            <p className="text-lg font-semibold">Gestor Motors</p>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
        <div className="mt-8 flex-1">
          <NavigationList orientation="vertical" onNavigate={() => setMobileNavOpen(false)} />
        </div>
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-border bg-background/80 px-4 py-4 shadow-sm sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button className="lg:hidden" variant="outline" size="icon" onClick={() => setMobileNavOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Visao atual</p>
                <h1 className="text-xl font-semibold">{currentSection}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{user?.email ?? "gestor"}</p>
                <p className="text-xs">Empresa conectada</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="hidden gap-2 md:flex">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          <div className="mt-4 lg:hidden">
            <NavigationList orientation="horizontal" onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </section>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <NavigationList orientation="vertical" onNavigate={() => setMobileNavOpen(false)} />
              <Button
                variant="outline"
                className="mt-6 w-full justify-center gap-2"
                onClick={() => {
                  setMobileNavOpen(false);
                  void (async () => {
                    try {
                      await logout();
                    } catch (error) {
                      console.error("Falha ao encerrar sessao", error);
                    }
                  })();
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}