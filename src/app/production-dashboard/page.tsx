import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { ProductionDashboard, type QueueData } from "../admin/3d-production/ProductionDashboard";

export const metadata = { title: "3D Production Queue — Stylix Local" };
export const dynamic = "force-dynamic";

export default async function LocalProductionDashboardPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/admin/3d-production");
  }

  const queueFile = path.resolve(process.cwd(), "../production-dashboard/queue.json");
  const queue = JSON.parse(await fs.promises.readFile(queueFile, "utf8")) as QueueData;
  return (
    <>
      <meta httpEquiv="refresh" content="30" />
      <ProductionDashboard initialQueue={queue} initialNow={Date.now()} />
    </>
  );
}
