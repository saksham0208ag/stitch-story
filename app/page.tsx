import { StitchStoryHome } from "@/components/stitch-story-home";
import { getUpcomingDates, readDb } from "@/lib/stitch-story";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Home() {
  const data = await readDb();

  return (
    <StitchStoryHome
      appointments={data.appointments}
      designs={data.designs}
      measurements={data.measurements}
      notifications={data.notifications}
      orders={data.orders}
      upcomingDates={getUpcomingDates(7)}
    />
  );
}
