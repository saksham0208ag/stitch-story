import { AtelierDashboard } from "@/components/atelier-dashboard";
import { getUpcomingDates, readDb } from "@/lib/stitch-story";

export const dynamic = "force-dynamic";

export default async function AtelierPage() {
  const data = await readDb();

  return (
    <AtelierDashboard
      appointments={data.appointments}
      designs={data.designs}
      measurements={data.measurements}
      orders={data.orders}
      upcomingDates={getUpcomingDates(7)}
    />
  );
}
