import type { Metadata } from "next";
import { TestClient } from "./TestClient";

export const metadata: Metadata = {
  title: "JMTI Jewelry Identity Reading — Stylix",
};

export default function TestPage() {
  return <TestClient />;
}
