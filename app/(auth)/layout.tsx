export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-subtle)' }}>
      {children}
    </main>
  );
}
