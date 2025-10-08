import { Sidebar } from '@/components/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--white-delicate)] dark:bg-[var(--background-dark)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
