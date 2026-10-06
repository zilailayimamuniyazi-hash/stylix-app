import type { Metadata } from "next";
import { DesignersClient } from "./DesignersClient";

export const metadata: Metadata = {
  title: "Designer Collaborations — Stylix",
};

export default function DesignersPage() {
  return <DesignersClient />;
}
