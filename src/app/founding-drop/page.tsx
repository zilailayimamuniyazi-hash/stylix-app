import type { Metadata } from "next";
import FoundingDropClient from "./FoundingDropClient";

export const metadata: Metadata = {
  title: "Founding Drop | Stylix",
  description: "Build the first Stylix modular jewelry drop and reserve early access.",
};

export default function FoundingDropPage() {
  return <FoundingDropClient />;
}
