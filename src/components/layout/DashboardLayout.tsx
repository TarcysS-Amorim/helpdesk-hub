import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface Props {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {title && (
          <header className="border-b border-border bg-card px-8 py-6">
            <h1 className="text-2xl font-black">{title}</h1>
          </header>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
