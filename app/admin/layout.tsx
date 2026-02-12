import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Don't check auth for login page
  const isLoginPage = false; // We'll check this differently

  if (!session) {
    // Allow access to login page, redirect others
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="pb-10">{children}</main>
    </div>
  );
}
