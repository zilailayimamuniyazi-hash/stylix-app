"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./foundingDrop.module.css";
import { useI18n } from "@/lib/i18n/context";
import { foundingCopy } from "./copy";

type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";

const bases = [
  { id: "fine-chain", name: "Fine Chain", material: "Gold vermeil", price: 29 },
  { id: "silver-link", name: "Silver Link", material: "Recycled 925 silver", price: 29 },
];

const charms = [
  { id: "north-star", mark: "N", name: "North Star", story: "Direction", tone: "gold" },
  { id: "new-moon", mark: "C", name: "New Moon", story: "Beginnings", tone: "silver" },
  { id: "birthstone", mark: "01", name: "Birthstone", story: "Origin", tone: "gem" },
  { id: "initial", mark: "A", name: "Initial", story: "Personal identity", tone: "gold" },
  { id: "twin-orbit", mark: "II", name: "Twin Orbit", story: "Connection", tone: "silver" },
  { id: "threshold", mark: "|", name: "Threshold", story: "Change", tone: "gold" },
  { id: "quiet-heart", mark: "V", name: "Quiet Heart", story: "Devotion", tone: "gem" },
  { id: "lucky-four", mark: "+", name: "Lucky Four", story: "Fortune", tone: "green" },
  { id: "solar-disc", mark: "O", name: "Solar Disc", story: "Confidence", tone: "gold" },
  { id: "anchor-point", mark: ".", name: "Anchor Point", story: "Grounding", tone: "silver" },
  { id: "open-wing", mark: "W", name: "Open Wing", story: "Freedom", tone: "gem" },
  { id: "secret-code", mark: "X", name: "Secret Code", story: "Private meaning", tone: "green" },
];

const priceOptions = ["$39", "$49", "$59"];

export default function FoundingDropClient() {
  const { locale } = useI18n();
  const copy = foundingCopy(locale);
  const [baseId, setBaseId] = useState(bases[0].id);
  const [selected, setSelected] = useState<string[]>(["north-star", "birthstone", "initial"]);
  const [priceVote, setPriceVote] = useState("$49");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("United States");
  const [gender, setGender] = useState<Gender | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const selectedCharms = useMemo(
    () => selected.map((id) => charms.find((charm) => charm.id === id)).filter(Boolean),
    [selected],
  );
  const activeBase = bases.find((base) => base.id === baseId) ?? bases[0];

  function toggleCharm(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 5) return current;
      return [...current, id];
    });
    setStatus("idle");
  }

  async function submitVote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected.length || !gender) return;
    setSubmitting(true);
    setStatus("idle");

    const source = [
      "founding-drop",
      `base:${baseId}`,
      `charms:${selected.join(",")}`,
      `price:${priceVote}`,
    ].join(" | ");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country, gender, source }),
      });
      if (!response.ok) throw new Error("Unable to save vote");
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.workspace}>
        <div className={styles.visual}>
          <Image
            src="/tryon/aurora-necklace/worn-reference.png"
            alt={copy("Gold celestial necklace concept")}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className={styles.heroImage}
          />
          <div className={styles.visualShade} />
          <div className={styles.brandLine}>
            <span>ASTRA STYLIX</span>
            <span>{copy("FOUNDING DROP 01")}</span>
          </div>
          <div className={styles.heroCopy}>
            <p>{copy("Concept preview")}</p>
            <h1>{copy("Build the piece we make first.")}</h1>
            <span>{copy("Your choices will shape our first production sample.")}</span>
          </div>
        </div>

        <div className={styles.builder}>
          <div className={styles.stepHead}>
            <span>01</span>
            <div>
              <p>{copy("Choose the foundation")}</p>
              <h2>{copy("Your base")}</h2>
            </div>
          </div>
          <div className={styles.segmented} role="radiogroup" aria-label={copy("Your base")}>
            {bases.map((base) => (
              <button
                key={base.id}
                type="button"
                role="radio"
                aria-checked={base.id === baseId}
                className={base.id === baseId ? styles.activeSegment : ""}
                onClick={() => setBaseId(base.id)}
              >
                <strong>{copy(base.name)}</strong>
                <small>{copy(base.material)}</small>
              </button>
            ))}
          </div>

          <div className={styles.stepHead}>
            <span>02</span>
            <div>
              <p>{copy("Select up to five")}</p>
              <h2>{copy("Your symbols")}</h2>
            </div>
            <b>{selected.length}/5</b>
          </div>

          <div className={styles.charmGrid}>
            {charms.map((charm) => {
              const isSelected = selected.includes(charm.id);
              return (
                <button
                  key={charm.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={isSelected ? styles.selectedCharm : ""}
                  onClick={() => toggleCharm(charm.id)}
                >
                  <span className={`${styles.charmMark} ${styles[charm.tone]}`}>{charm.mark}</span>
                  <strong>{copy(charm.name)}</strong>
                  <small>{copy(charm.story)}</small>
                </button>
              );
            })}
          </div>

          <div className={styles.selectionBar}>
            <div>
              <span>{copy(activeBase.name)}</span>
              <strong>
                {selectedCharms.length
                  ? selectedCharms.map((charm) => copy(charm?.name ?? "")).join(" + ")
                  : copy("Choose at least one symbol")}
              </strong>
            </div>
            <span>{copy("Estimated founding price")} <b>{priceVote}</b></span>
          </div>
        </div>
      </section>

      <section className={styles.voteSection} id="reserve">
        <div className={styles.voteIntro}>
          <p>{copy("03 / Set the signal")}</p>
          <h2>{copy("Would you actually wear this?")}</h2>
          <span>
            {copy("This is a research preview, not a stocked product. Join the founding list to vote for the first sample and receive the launch offer only if we produce it.")}
          </span>
          <Link href="/bead-lab">{copy("Open the full design studio")}</Link>
        </div>

        <form className={styles.voteForm} onSubmit={submitVote}>
          <fieldset>
            <legend>{copy("What feels like the right price?")}</legend>
            <div className={styles.priceOptions}>
              {priceOptions.map((price) => (
                <label key={price} className={priceVote === price ? styles.priceActive : ""}>
                  <input
                    type="radio"
                    name="price"
                    value={price}
                    checked={priceVote === price}
                    onChange={() => setPriceVote(price)}
                  />
                  <span>{price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span>{copy("Email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <div className={styles.formRow}>
            <label>
              <span>{copy("Country")}</span>
              <input required value={country === "United States" ? copy(country) : country} onChange={(event) => setCountry(event.target.value)} />
            </label>
            <label>
              <span>{copy("Identity")}</span>
              <select
                required
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender | "")}
              >
                <option value="">{copy("Select")}</option>
                <option value="female">{copy("Woman")}</option>
                <option value="male">{copy("Man")}</option>
                <option value="non-binary">{copy("Non-binary")}</option>
                <option value="prefer-not-to-say">{copy("Prefer not to say")}</option>
              </select>
            </label>
          </div>

          <button type="submit" disabled={submitting || !selected.length}>
            {copy(submitting ? "Saving your vote..." : "Vote and reserve early access")}
          </button>
          <small>{copy("No payment today. We will only contact you about this founding drop.")}</small>
          {status === "success" && <p className={styles.success} role="status">{copy("Your vote is in. You helped choose the first sample.")}</p>}
          {status === "error" && <p className={styles.error} role="alert">{copy("We could not save your vote. Please try again.")}</p>}
        </form>
      </section>
    </div>
  );
}
