import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardTopbar } from '@/components/dashboard-topbar';
import { resolveActiveSchool, daysUntil } from '@/lib/tenant-server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const school = await resolveActiveSchool();
  const daysLeft = daysUntil(school.trial_ends_at);

  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar schoolName={school.name} schoolSlug={school.slug} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar
          schoolName={school.name}
          trial={{ daysLeft, stripeStatus: school.stripe_status }}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
