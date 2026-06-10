import {
  KeyRound,
  KeySquareIcon,
  LogOut,
  Menu,
  Moon,
  SunIcon,
  X,
} from "lucide-react";
import { useState } from "react";

export type AppPage = "dashboard" | "key" | "users";

interface SidebarProps {
  activePage: AppPage;
  isDark: boolean;
  userEmail: string;
  onNavigate: (page: AppPage) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const navItems: { id: AppPage; label: string; icon: typeof KeyRound }[] = [
  { id: "dashboard", label: "Licenças", icon: KeyRound },
  { id: "key", label: "Chaves", icon: KeySquareIcon },
];

function NavContent({
  activePage,
  onNavigate,
  onCloseMobile,
}: {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onCloseMobile?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activePage === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              onNavigate(id);
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon size={18} className={isActive ? "text-sky-500" : ""} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  isDark,
  userEmail,
  onToggleTheme,
  onLogout,
}: {
  isDark: boolean;
  userEmail: string;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {isDark ? "Tema Escuro" : "Tema Claro"}
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Alternar tema"
          className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
            isDark ? "bg-sky-500" : "bg-zinc-300"
          }`}
        >
          <span
            className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
              isDark ? "translate-x-5" : "translate-x-0.5"
            }`}
          >
            {isDark ? (
              <Moon size={12} className="text-sky-600" />
            ) : (
              <SunIcon size={12} className="text-amber-500" />
            )}
          </span>
        </button>
      </div>

      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
        {userEmail || "usuario@email.com"}
      </p>

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );
}

export default function Sidebar({
  activePage,
  isDark,
  userEmail,
  onNavigate,
  onToggleTheme,
  onLogout,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <KeySquareIcon size={28} className="text-sky-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
            License
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Plataforma de Licenciamento
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <NavContent
          activePage={activePage}
          onNavigate={onNavigate}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      <SidebarFooter
        isDark={isDark}
        userEmail={userEmail}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-white dark:bg-zinc-900 h-full shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
