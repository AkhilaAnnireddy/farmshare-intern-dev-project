import { Box, Typography } from "@mui/material";
import { EAnimalSpecies, AVG_HANGING_WEIGHTS } from "../types";
import { calculateHeads, calculateLaborValue } from "../utils/calculations";

interface GrowthInsightProps {
  selectedSpecies: EAnimalSpecies[];
  volumes: Record<EAnimalSpecies, string>;
  timePerAnimal: number;
  hourlyWage: number;
  netBenefit: number;
  totalSavings: number;
  totalCost: number;
}

const COST_PER_LB = 0.02;

export default function GrowthInsight({
  selectedSpecies,
  volumes,
  timePerAnimal,
  hourlyWage,
  netBenefit,
  totalCost,
}: GrowthInsightProps) {
  const hasData = selectedSpecies.some(
    (s) => volumes[s] && parseFloat(volumes[s]) > 0,
  );

  if (!hasData) return null;
  if (totalCost === 0) return null;

  // --- LOSS STATE ---
  if (netBenefit < 0) {
    let bestSpecies = "";
    let leastLbsNeeded = Infinity;

    selectedSpecies
      .filter((s) => volumes[s] && parseFloat(volumes[s]) > 0)
      .forEach((species) => {
        const avgWeight = AVG_HANGING_WEIGHTS[species];
        const savingsPerLb =
          (1 / avgWeight) * (timePerAnimal / 60) * hourlyWage;
        const netPerLb = savingsPerLb - COST_PER_LB;

        if (netPerLb > 0) {
          const currentVolume = parseFloat(volumes[species]);
          const originalHeads = calculateHeads(currentVolume, avgWeight);
          const originalSavings = calculateLaborValue(
            originalHeads,
            timePerAnimal,
            hourlyWage,
          );
          const originalCost = currentVolume * COST_PER_LB;

          let testVolume = currentVolume;

          while (testVolume < 10000000) {
            testVolume += avgWeight;
            const heads = calculateHeads(testVolume, avgWeight);
            const savings = calculateLaborValue(
              heads,
              timePerAnimal,
              hourlyWage,
            );
            const cost = testVolume * COST_PER_LB;
            const additionalNet =
              savings - cost - (originalSavings - originalCost);

            if (netBenefit + additionalNet >= 0) break;
          }

          const additionalLbs = Math.ceil(testVolume - currentVolume);
          if (additionalLbs < leastLbsNeeded) {
            leastLbsNeeded = additionalLbs;
            bestSpecies = species;
          }
        }
      });

    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: "#fff5f5",
          border: "1px solid #ffcdd2",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          color="error.main"
          sx={{ mb: 1 }}
        >
          You're ${Math.abs(netBenefit).toFixed(2)} away from breaking even
        </Typography>
        {bestSpecies && leastLbsNeeded !== Infinity ? (
          <Typography variant="body2" color="text.secondary">
            Add{" "}
            <strong>
              {leastLbsNeeded.toLocaleString()} more lbs of{" "}
              {bestSpecies.charAt(0).toUpperCase() + bestSpecies.slice(1)}
            </strong>{" "}
            and Farmshare starts paying for itself
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Try increasing your processing volume or adjusting time savings per
            animal
          </Typography>
        )}
      </Box>
    );
  }

  // --- PROFIT STATE ---
  const currentProfitPct = Math.round((netBenefit / totalCost) * 100);
  const nextMilestone = Math.ceil((currentProfitPct + 1) / 10) * 10;
  const milestoneAfter = nextMilestone + 10;

  // Find best species for suggestion
  let bestSpeciesName = "";
  let bestNetPerLb = 0;
  selectedSpecies
    .filter((s) => volumes[s] && parseFloat(volumes[s]) > 0)
    .forEach((species) => {
      const avgWeight = AVG_HANGING_WEIGHTS[species];
      const savingsPerLb = (1 / avgWeight) * (timePerAnimal / 60) * hourlyWage;
      const netPerLb = savingsPerLb - COST_PER_LB;
      if (netPerLb > bestNetPerLb) {
        bestNetPerLb = netPerLb;
        bestSpeciesName = species.charAt(0).toUpperCase() + species.slice(1);
      }
    });

  const calcLbsForProfitPct = (targetPct: number): number | null => {
    const targetNet = totalCost * (targetPct / 100);
    const additionalNetNeeded = targetNet - netBenefit;
    if (additionalNetNeeded <= 0) return 0;

    let bestAvgWeight = 0;
    let bestSpeciesVolume = 0;
    let bestSpeciesKey = "";
    let bestNet = 0;

    selectedSpecies
      .filter((s) => volumes[s] && parseFloat(volumes[s]) > 0)
      .forEach((species) => {
        const avgWeight = AVG_HANGING_WEIGHTS[species];
        const savingsPerLb =
          (1 / avgWeight) * (timePerAnimal / 60) * hourlyWage;
        const netPerLb = savingsPerLb - COST_PER_LB;
        if (netPerLb > bestNet) {
          bestNet = netPerLb;
          bestAvgWeight = avgWeight;
          bestSpeciesVolume = parseFloat(volumes[species]);
          bestSpeciesKey = species;
        }
      });

    if (bestNet <= 0 || !bestSpeciesKey) return null;

    const originalHeads = calculateHeads(bestSpeciesVolume, bestAvgWeight);
    const originalSavings = calculateLaborValue(
      originalHeads,
      timePerAnimal,
      hourlyWage,
    );
    const originalCost = bestSpeciesVolume * COST_PER_LB;

    let testVolume = bestSpeciesVolume;

    while (testVolume < 10000000) {
      testVolume += bestAvgWeight;
      const heads = calculateHeads(testVolume, bestAvgWeight);
      const savings = calculateLaborValue(heads, timePerAnimal, hourlyWage);
      const cost = testVolume * COST_PER_LB;
      const additionalNet = savings - cost - (originalSavings - originalCost);

      if (additionalNet >= additionalNetNeeded) break;
    }

    return Math.ceil(testVolume - bestSpeciesVolume);
  };

  const lbsFor1 = calcLbsForProfitPct(nextMilestone);
  const lbsFor2 = calcLbsForProfitPct(milestoneAfter);

  const netAt1 = totalCost * (nextMilestone / 100);
  const netAt2 = totalCost * (milestoneAfter / 100);

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        backgroundColor: "#f0f9f4",
        border: "1px solid #a5d6a7",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="body2"
        fontWeight={700}
        color="success.main"
        sx={{ mb: 1.5 }}
      >
        You're already saving {currentProfitPct}% more than Farmshare costs!
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {lbsFor1 !== null && lbsFor1 > 0 && (
          <Typography variant="body2" color="text.secondary">
            Adding{" "}
            <strong>
              {lbsFor1.toLocaleString()} more lbs of {bestSpeciesName}
            </strong>{" "}
            could boost your savings to{" "}
            <strong style={{ color: "#006F35" }}>
              ${netAt1.toFixed(2)}/yr
            </strong>{" "}
            — a <strong>{nextMilestone}%</strong> return on your Farmshare cost
          </Typography>
        )}
        {lbsFor2 !== null && lbsFor2 > 0 && (
          <Typography variant="body2" color="text.secondary">
            Or go further — add <strong>{lbsFor2.toLocaleString()} lbs</strong>{" "}
            to hit a <strong>{milestoneAfter}%</strong> return (
            <strong style={{ color: "#006F35" }}>
              ${netAt2.toFixed(2)}/yr
            </strong>
            )
          </Typography>
        )}
      </Box>
    </Box>
  );
}
