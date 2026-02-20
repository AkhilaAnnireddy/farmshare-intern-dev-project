import { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { EAnimalSpecies, AVG_HANGING_WEIGHTS } from "../types";
import { calculateHeads, calculateLaborValue } from "../utils/calculations";

interface ROIChartProps {
  selectedSpecies: EAnimalSpecies[];
  volumes: Record<EAnimalSpecies, string>;
  timePerAnimal: number;
  hourlyWage: number;
}

const COST_PER_LB = 0.02;

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export default function ROIChart({
  selectedSpecies,
  volumes,
  timePerAnimal,
  hourlyWage,
}: ROIChartProps) {
  const [view, setView] = useState<"overview" | "species">("overview");

  // Only show chart if at least one species has volume entered
  const hasData = selectedSpecies.some(
    (s) => volumes[s] && parseFloat(volumes[s]) > 0,
  );

  if (!hasData) return null;

  const speciesData = selectedSpecies
    .filter((s) => volumes[s] && parseFloat(volumes[s]) > 0)
    .map((species) => {
      const volume = parseFloat(volumes[species]);
      const avgWeight = AVG_HANGING_WEIGHTS[species];
      const heads = calculateHeads(volume, avgWeight);
      const savings = calculateLaborValue(heads, timePerAnimal, hourlyWage);
      const cost = volume * COST_PER_LB;
      const net = savings - cost;
      return {
        name: species.charAt(0).toUpperCase() + species.slice(1),
        "Labor Savings": Math.round(savings),
        "Farmshare Cost": Math.round(cost),
        "Net Savings": Math.round(net),
      };
    });

  const totalSavings = speciesData.reduce((t, s) => t + s["Labor Savings"], 0);
  const totalCost = speciesData.reduce((t, s) => t + s["Farmshare Cost"], 0);
  const totalNet = totalSavings - totalCost;

  const overviewData = [
    { name: "Labor Savings", value: totalSavings, fill: "#006F35" },
    { name: "Farmshare Cost", value: totalCost, fill: "#d32f2f" },
    { name: "Net Savings", value: Math.max(totalNet, 0), fill: "#FF7B00" },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            ROI Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visual breakdown of your savings vs Farmshare cost
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, val) => val && setView(val)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              borderColor: "#006F35",
              color: "#006F35",
              "&.Mui-selected": {
                backgroundColor: "#006F35",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#005a2b",
                },
              },
            },
          }}
        >
          <ToggleButton value="overview">Overview</ToggleButton>
          <ToggleButton value="species">By Species</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {view === "overview" && (
        <Box>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={overviewData}
              layout="vertical"
              margin={{ top: 0, right: 50, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fontWeight: 600 }}
                width={110}
              />
              <Tooltip
                formatter={(value: any) => [
                  formatCurrency(value as number),
                  "",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {overviewData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {totalNet < 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: "#fff5f5",
                border: "1px solid #ffcdd2",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="error.main" fontWeight={600}>
                Your current volume results in a net loss. Increase processing
                volume to improve ROI.
              </Typography>
            </Box>
          )}
        </Box>
      )}
      {view === "species" && (
        <Box>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={speciesData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [
                  formatCurrency(value as number),
                  "",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                }}
              />
              <Legend />
              <Bar
                dataKey="Labor Savings"
                fill="#006F35"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Farmshare Cost"
                fill="#d32f2f"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="Net Savings" fill="#FF7B00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            Species with Labor Savings exceeding Farmshare Cost are profitable
          </Typography>
        </Box>
      )}
    </Box>
  );
}
