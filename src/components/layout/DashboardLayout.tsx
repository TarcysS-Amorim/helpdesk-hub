import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {title && (
          <header className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </header>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}