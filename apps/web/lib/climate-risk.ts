/**
 * Climate Risk Assessment: FEMA flood data + state-based risk profiles
 */

export interface FloodRiskData {
  floodZone: string;
  riskScore: number; // 0-100
  description: string;
}

export interface ClimateRiskProfile {
  flood: { score: number; zone: string; description: string };
  fire: { score: number; description: string };
  wind: { score: number; description: string };
  heat: { score: number; description: string };
  drought: { score: number; description: string };
  overallRisk: number;
  recommendations: string[];
}

// FEMA flood zone risk mapping
const FLOOD_ZONE_RISK: Record<string, { score: number; description: string }> =
  {
    A: {
      score: 85,
      description:
        "High-risk area with 1% annual chance of flooding. Flood insurance required.",
    },
    AE: {
      score: 85,
      description:
        "High-risk area with established base flood elevations. Flood insurance required.",
    },
    AH: {
      score: 80,
      description:
        "High-risk area with shallow flooding (1-3 feet). Flood insurance required.",
    },
    AO: {
      score: 80,
      description:
        "High-risk area with sheet flow flooding. Flood insurance required.",
    },
    V: {
      score: 95,
      description:
        "Coastal high-risk area with velocity wave action. Highest flood risk.",
    },
    VE: {
      score: 95,
      description:
        "Coastal high-risk area with established base flood elevations.",
    },
    B: {
      score: 40,
      description:
        "Moderate-risk area between 100-year and 500-year flood zones.",
    },
    X500: {
      score: 40,
      description:
        "Moderate-risk area with 0.2% annual chance of flooding.",
    },
    C: {
      score: 15,
      description: "Low-risk area outside 500-year flood zone.",
    },
    X: {
      score: 15,
      description:
        "Minimal flood risk. Standard homeowner insurance typically sufficient.",
    },
    D: {
      score: 50,
      description:
        "Undetermined risk area. Flood hazard analysis not performed.",
    },
  };

// State-level climate risk data (simplified lookup table)
// Scores are 0-100 based on general US climate data
const STATE_CLIMATE_RISK: Record<
  string,
  { fire: number; wind: number; heat: number; drought: number }
> = {
  AL: { fire: 25, wind: 70, heat: 75, drought: 30 },
  AK: { fire: 40, wind: 35, heat: 10, drought: 15 },
  AZ: { fire: 75, wind: 30, heat: 95, drought: 90 },
  AR: { fire: 20, wind: 55, heat: 70, drought: 35 },
  CA: { fire: 90, wind: 35, heat: 80, drought: 85 },
  CO: { fire: 70, wind: 50, heat: 55, drought: 65 },
  CT: { fire: 10, wind: 40, heat: 50, drought: 20 },
  DE: { fire: 10, wind: 45, heat: 55, drought: 20 },
  FL: { fire: 30, wind: 90, heat: 85, drought: 25 },
  GA: { fire: 25, wind: 55, heat: 75, drought: 35 },
  HI: { fire: 30, wind: 55, heat: 60, drought: 30 },
  ID: { fire: 65, wind: 30, heat: 50, drought: 55 },
  IL: { fire: 10, wind: 55, heat: 60, drought: 30 },
  IN: { fire: 10, wind: 50, heat: 55, drought: 25 },
  IA: { fire: 10, wind: 55, heat: 55, drought: 35 },
  KS: { fire: 30, wind: 75, heat: 65, drought: 55 },
  KY: { fire: 15, wind: 45, heat: 60, drought: 25 },
  LA: { fire: 15, wind: 85, heat: 80, drought: 20 },
  ME: { fire: 10, wind: 35, heat: 30, drought: 15 },
  MD: { fire: 10, wind: 45, heat: 60, drought: 20 },
  MA: { fire: 10, wind: 45, heat: 50, drought: 20 },
  MI: { fire: 15, wind: 45, heat: 45, drought: 20 },
  MN: { fire: 20, wind: 55, heat: 45, drought: 30 },
  MS: { fire: 20, wind: 70, heat: 80, drought: 30 },
  MO: { fire: 15, wind: 60, heat: 65, drought: 35 },
  MT: { fire: 65, wind: 45, heat: 45, drought: 55 },
  NE: { fire: 25, wind: 65, heat: 60, drought: 50 },
  NV: { fire: 60, wind: 30, heat: 90, drought: 90 },
  NH: { fire: 10, wind: 35, heat: 35, drought: 15 },
  NJ: { fire: 10, wind: 45, heat: 55, drought: 20 },
  NM: { fire: 70, wind: 40, heat: 85, drought: 85 },
  NY: { fire: 10, wind: 40, heat: 50, drought: 20 },
  NC: { fire: 20, wind: 65, heat: 70, drought: 30 },
  ND: { fire: 20, wind: 55, heat: 45, drought: 45 },
  OH: { fire: 10, wind: 50, heat: 55, drought: 20 },
  OK: { fire: 35, wind: 80, heat: 75, drought: 55 },
  OR: { fire: 70, wind: 30, heat: 50, drought: 50 },
  PA: { fire: 10, wind: 40, heat: 50, drought: 20 },
  RI: { fire: 10, wind: 45, heat: 50, drought: 20 },
  SC: { fire: 20, wind: 65, heat: 75, drought: 30 },
  SD: { fire: 25, wind: 60, heat: 50, drought: 45 },
  TN: { fire: 15, wind: 55, heat: 70, drought: 25 },
  TX: { fire: 50, wind: 75, heat: 90, drought: 70 },
  UT: { fire: 65, wind: 35, heat: 70, drought: 75 },
  VT: { fire: 10, wind: 35, heat: 35, drought: 15 },
  VA: { fire: 15, wind: 50, heat: 65, drought: 25 },
  WA: { fire: 60, wind: 35, heat: 45, drought: 40 },
  WV: { fire: 15, wind: 40, heat: 55, drought: 20 },
  WI: { fire: 15, wind: 50, heat: 45, drought: 25 },
  WY: { fire: 55, wind: 55, heat: 45, drought: 55 },
  DC: { fire: 5, wind: 35, heat: 60, drought: 20 },
};

const DEFAULT_STATE_RISK = { fire: 30, wind: 40, heat: 50, drought: 35 };

export async function getFloodRisk(
  lat: number,
  lng: number
): Promise<FloodRiskData> {
  try {
    const url = new URL(
      "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query"
    );
    url.searchParams.set("geometry", `${lng},${lat}`);
    url.searchParams.set("geometryType", "esriGeometryPoint");
    url.searchParams.set("spatialRel", "esriSpatialRelIntersects");
    url.searchParams.set("outFields", "FLD_ZONE,ZONE_SUBTY");
    url.searchParams.set("f", "json");

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error("FEMA API error:", res.status);
      return {
        floodZone: "Unknown",
        riskScore: 30,
        description: "Could not determine flood zone. Check FEMA flood maps for details.",
      };
    }

    const data = await res.json();
    const features = data.features;

    if (!features?.length) {
      return {
        floodZone: "X",
        riskScore: 15,
        description:
          "No flood zone data found. Area is likely minimal risk (Zone X).",
      };
    }

    const floodZone = features[0].attributes?.FLD_ZONE ?? "Unknown";
    const riskInfo = FLOOD_ZONE_RISK[floodZone] ??
      FLOOD_ZONE_RISK["D"] ?? { score: 30, description: "Unknown flood zone." };

    return {
      floodZone,
      riskScore: riskInfo.score,
      description: riskInfo.description,
    };
  } catch (error) {
    console.error("FEMA flood risk query failed:", error);
    return {
      floodZone: "Unknown",
      riskScore: 30,
      description:
        "Unable to retrieve flood data. Check FEMA flood maps for details.",
    };
  }
}

export async function getClimateRiskProfile(
  lat: number,
  lng: number,
  state: string
): Promise<ClimateRiskProfile> {
  // Get flood data from FEMA
  const floodData = await getFloodRisk(lat, lng);

  // Get state-level risk data
  const stateUpper = state.toUpperCase();
  const stateRisk = STATE_CLIMATE_RISK[stateUpper] ?? DEFAULT_STATE_RISK;

  // Build descriptions
  const fireDescription = getFireDescription(stateRisk.fire);
  const windDescription = getWindDescription(stateRisk.wind);
  const heatDescription = getHeatDescription(stateRisk.heat);
  const droughtDescription = getDroughtDescription(stateRisk.drought);

  // Calculate overall risk (weighted average)
  const overallRisk = Math.round(
    floodData.riskScore * 0.25 +
      stateRisk.fire * 0.2 +
      stateRisk.wind * 0.25 +
      stateRisk.heat * 0.15 +
      stateRisk.drought * 0.15
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    floodData,
    stateRisk,
    stateUpper
  );

  return {
    flood: {
      score: floodData.riskScore,
      zone: floodData.floodZone,
      description: floodData.description,
    },
    fire: { score: stateRisk.fire, description: fireDescription },
    wind: { score: stateRisk.wind, description: windDescription },
    heat: { score: stateRisk.heat, description: heatDescription },
    drought: { score: stateRisk.drought, description: droughtDescription },
    overallRisk,
    recommendations,
  };
}

function getFireDescription(score: number): string {
  if (score >= 70)
    return "High wildfire risk. Defensible space and fire-resistant materials strongly recommended.";
  if (score >= 40)
    return "Moderate wildfire risk. Maintain clear vegetation around property.";
  return "Low wildfire risk. Standard precautions sufficient.";
}

function getWindDescription(score: number): string {
  if (score >= 70)
    return "High wind risk including hurricanes or severe storms. Impact-rated windows and reinforced structures recommended.";
  if (score >= 40)
    return "Moderate wind risk. Ensure roof and siding are properly secured.";
  return "Low wind risk. Standard construction adequate.";
}

function getHeatDescription(score: number): string {
  if (score >= 70)
    return "High heat risk with frequent extreme temperatures. Ensure HVAC is well-maintained and consider energy-efficient upgrades.";
  if (score >= 40)
    return "Moderate heat risk. Maintain cooling systems and check insulation.";
  return "Low heat risk. Standard climate control sufficient.";
}

function getDroughtDescription(score: number): string {
  if (score >= 70)
    return "High drought risk. Consider drought-resistant landscaping and water-efficient appliances.";
  if (score >= 40)
    return "Moderate drought risk. Water conservation practices recommended.";
  return "Low drought risk. Normal water usage patterns acceptable.";
}

function generateRecommendations(
  flood: FloodRiskData,
  stateRisk: { fire: number; wind: number; heat: number; drought: number },
  state: string
): string[] {
  const recs: string[] = [];

  // Flood recommendations
  if (flood.riskScore >= 70) {
    recs.push(
      "Purchase flood insurance (may be required). Consider a sump pump and backflow prevention."
    );
    recs.push(
      "Elevate critical utilities (HVAC, water heater, electrical panels) above base flood level."
    );
  } else if (flood.riskScore >= 40) {
    recs.push(
      "Consider flood insurance even though it may not be required in your zone."
    );
  }

  // Fire recommendations
  if (stateRisk.fire >= 70) {
    recs.push(
      "Create and maintain a 30-foot defensible space zone around your home."
    );
    recs.push(
      "Install ember-resistant vents and use fire-resistant roofing materials."
    );
  } else if (stateRisk.fire >= 40) {
    recs.push(
      "Keep vegetation trimmed near your home and maintain fire extinguishers."
    );
  }

  // Wind recommendations
  if (stateRisk.wind >= 70) {
    recs.push(
      "Install impact-rated windows and reinforce garage doors. Consider hurricane straps for roof."
    );
    recs.push(
      "Develop a severe weather emergency plan and keep essential supplies ready."
    );
  } else if (stateRisk.wind >= 40) {
    recs.push(
      "Inspect roof annually and trim trees near the house to prevent storm damage."
    );
  }

  // Heat recommendations
  if (stateRisk.heat >= 70) {
    recs.push(
      "Service HVAC systems twice yearly. Consider energy-efficient windows and improved insulation."
    );
  }

  // Drought recommendations
  if (stateRisk.drought >= 70) {
    recs.push(
      "Install water-efficient fixtures and consider xeriscaping for landscaping."
    );
  }

  // General recommendation if everything is low
  if (recs.length === 0) {
    recs.push(
      "Your home is in a relatively low-risk area. Maintain standard homeowner insurance and perform regular maintenance."
    );
  }

  return recs;
}
