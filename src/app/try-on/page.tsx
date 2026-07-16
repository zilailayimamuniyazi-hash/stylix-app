import { TryOnClient } from "./TryOnClient";

export const metadata = {
  title: "Virtual Try-On — Stylix",
};

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ piece?: string }>;
}) {
  const { piece } = await searchParams;

  return (
    <div className="ui-page">
      <TryOnClient piece={piece} />
    </div>
  );
}
