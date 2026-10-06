import type { Metadata } from "next";
import { DailyClient } from "./DailyClient";

export const metadata: Metadata = {
  title: "Daily Identity — Stylix",
};

export default function DailyPage() {
  return <DailyClient />;
}
