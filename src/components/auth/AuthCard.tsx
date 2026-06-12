import { KeySquareIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex items-center justify-center min-h-screen py-8 bg-white text-black dark:bg-zinc-900 dark:text-white">
      <div className="flex flex-col justify-center items-center transition-colors duration-300 bg-white text-black dark:bg-zinc-800 dark:text-white border-2 min-w-96 w-96 max-w-[calc(100vw-2rem)] p-8 border-sky-300 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700">
        <KeySquareIcon size={64} className="mb-4 text-sky-500" />
        <h1 className="text-4xl font-bold">License</h1>
        <h2 className="mt-8 text-2xl text-center">{title}</h2>
        {subtitle && <div className="font-light mt-2 text-center text-sm">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}
