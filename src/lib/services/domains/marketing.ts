import { readClient } from "../core";
import type { MarketingDifferential, MarketingHeroContent } from "@/types/domain";

export async function fetchLandingHero(): Promise<MarketingHeroContent | null> {
  return readClient.fetch("marketing.hero");
}

export async function fetchLandingDifferentials(): Promise<MarketingDifferential[]> {
  return readClient.fetch("marketing.diferenciais");
}
