export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="zoui-auth">
      {children}
    </main>
  );
}
