"use client";
import dynamic from "next/dynamic";

const BillieEsscoExperience = dynamic(
  () => import("@/components/BillieEsscoExperience"),
  { ssr: false }
);

export default function Home() {
  return <BillieEsscoExperience />;
}
