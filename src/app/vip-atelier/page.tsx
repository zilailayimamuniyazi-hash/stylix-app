import type { Metadata } from "next";
import { VipAtelierClient } from "./VipAtelierClient";

export const metadata: Metadata = {
  title: "Private Atelier — Stylix",
};

export default function VipAtelierPage() {
  return <VipAtelierClient />;
}
