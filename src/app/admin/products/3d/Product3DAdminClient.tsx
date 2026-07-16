"use client";

import Image from "next/image";
import { useState } from "react";

interface Product3DItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  model3dUrl: string | null;
}

interface Product3DAdminClientProps {
  initialProducts: Product3DItem[];
}

type StatusState = Record<string, {
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}>;

type FieldState = Record<string, {
  imageUrl: string;
  model3dUrl: string;
}>;

function createInitialFields(products: Product3DItem[]): FieldState {
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      {
        imageUrl: product.imageUrl,
        model3dUrl: product.model3dUrl ?? "",
      },
    ])
  );
}

export function Product3DAdminClient({ initialProducts }: Product3DAdminClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [fields, setFields] = useState<FieldState>(() => createInitialFields(initialProducts));
  const [status, setStatus] = useState<StatusState>({});

  function updateField(productId: string, key: "imageUrl" | "model3dUrl", value: string) {
    setFields((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [key]: value,
      },
    }));
  }

  async function submit(productId: string, mode: "generate" | "attach") {
    const productFields = fields[productId];
    const imageUrl = productFields?.imageUrl.trim();
    const model3dUrl = productFields?.model3dUrl.trim();

    if (!imageUrl) {
      setStatus((current) => ({
        ...current,
        [productId]: { error: "Image URL is required." },
      }));
      return;
    }

    if (mode === "attach" && !model3dUrl) {
      setStatus((current) => ({
        ...current,
        [productId]: { error: "Paste a GLB URL before attaching." },
      }));
      return;
    }

    setStatus((current) => ({
      ...current,
      [productId]: { loading: true, error: null, success: null },
    }));

    try {
      const res = await fetch("/api/3d/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          imageUrl,
          ...(mode === "attach" ? { model3dUrl } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "3D workflow failed.");
      }

      const nextModelUrl = json.model3dUrl as string;
      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, model3dUrl: nextModelUrl }
            : product
        )
      );
      updateField(productId, "model3dUrl", nextModelUrl);
      setStatus((current) => ({
        ...current,
        [productId]: {
          loading: false,
          success: json.stored
            ? "Model URL stored."
            : "Model URL returned. Supabase product row was not found.",
        },
      }));
    } catch (err) {
      setStatus((current) => ({
        ...current,
        [productId]: {
          loading: false,
          error: err instanceof Error ? err.message : "3D workflow failed.",
        },
      }));
    }
  }

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Stylix Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">3D product models</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Generate a GLB from a product image or attach an existing GLB URL. Provider keys stay server-side.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-6 py-8">
        {products.map((product) => {
          const productStatus = status[product.id] ?? {};
          const productFields = fields[product.id];

          return (
            <section
              key={product.id}
              className="grid gap-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[140px_1fr]"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="140px"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{product.name}</h2>
                    <p className="mt-1 text-xs text-gray-400">{product.slug}</p>
                  </div>
                  <span className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500">
                    {product.model3dUrl ? "Model attached" : "No model"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-xs font-medium text-gray-600">Source image URL</span>
                    <input
                      value={productFields?.imageUrl ?? ""}
                      onChange={(event) => updateField(product.id, "imageUrl", event.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </label>

                  <label>
                    <span className="mb-1 block text-xs font-medium text-gray-600">GLB URL</span>
                    <input
                      value={productFields?.model3dUrl ?? ""}
                      onChange={(event) => updateField(product.id, "model3dUrl", event.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      placeholder="https://.../model.glb"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => submit(product.id, "generate")}
                    disabled={productStatus.loading}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {productStatus.loading ? "Working..." : "Generate from image"}
                  </button>
                  <button
                    type="button"
                    onClick={() => submit(product.id, "attach")}
                    disabled={productStatus.loading}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Attach GLB URL
                  </button>
                  {productStatus.error && (
                    <p className="text-sm text-red-600">{productStatus.error}</p>
                  )}
                  {productStatus.success && (
                    <p className="text-sm text-green-700">{productStatus.success}</p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
