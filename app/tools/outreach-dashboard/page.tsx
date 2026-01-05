import OutreachDashboard from '@/components/outreach-dashboard/OutreachDashboardDebug';
import ErrorBoundary from '@/components/outreach-dashboard/ErrorBoundary';

export default function OutreachDashboardPage() {
  return (
    <ErrorBoundary>
      <OutreachDashboard />
    </ErrorBoundary>
  );
}
