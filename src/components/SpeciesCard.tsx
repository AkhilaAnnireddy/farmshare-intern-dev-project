import { EAnimalSpecies, AVG_HANGING_WEIGHTS } from "../types";
import { calculateHeads, calculateLaborValue } from "../utils/calculations";
import { Card, CardContent, TextField, Typography, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface SpeciesCardProps {
  species: EAnimalSpecies;
  volume: string;
  onVolumeChange: (species: EAnimalSpecies, value: string) => void;
  timePerAnimal: number;
  hourlyWage: number;
  isMonthly: boolean;
}

const COST_PER_LB = 0.02;

export default function SpeciesCard({
  species,
  volume,
  onVolumeChange,
  timePerAnimal,
  hourlyWage,
  isMonthly,
}: SpeciesCardProps) {
  const hasVolume = volume !== "" && parseFloat(volume) > 0;
  const vol = hasVolume ? parseFloat(volume) : 0;
  const heads = calculateHeads(vol, AVG_HANGING_WEIGHTS[species]);
  const savings = calculateLaborValue(heads, timePerAnimal, hourlyWage);
  const cost = vol * COST_PER_LB;
  const net = savings - cost;
  const displaySavings = savings / (isMonthly ? 12 : 1);
  const displayCost = cost / (isMonthly ? 12 : 1);
  const displayNet = net / (isMonthly ? 12 : 1);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {species.charAt(0).toUpperCase() + species.slice(1)}
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              (Avg: {AVG_HANGING_WEIGHTS[species]} lbs/animal)
            </Typography>
          </Typography>
          {hasVolume && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#006F35",
                backgroundColor: "#f0f9f4",
                border: "1px solid #006F35",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="body2" fontWeight={700} color="#006F35">
                {heads.toLocaleString()} heads
              </Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          label="Total Annual Hanging Weight (lbs)"
          type="number"
          value={volume}
          onChange={(e) => onVolumeChange(species, e.target.value)}
          error={volume !== "" && parseFloat(volume) <= 0}
          helperText={
            volume !== "" && parseFloat(volume) <= 0
              ? "Must be greater than 0"
              : ""
          }
          inputProps={{ min: 1, max: 10000000 }}
        />

        {/* Per species savings breakdown */}
        {hasVolume && (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              px: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Savings:{" "}
              <strong style={{ color: "#006F35" }}>
                ${displaySavings.toFixed(2)}
              </strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cost:{" "}
              <strong style={{ color: "#d32f2f" }}>
                ${displayCost.toFixed(2)}
              </strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Net:{" "}
              <strong style={{ color: net >= 0 ? "#006F35" : "#d32f2f" }}>
                {displayNet >= 0 ? (
                  <CheckIcon
                    sx={{
                      fontSize: 14,
                      verticalAlign: "middle",
                      color: "#006F35",
                    }}
                  />
                ) : (
                  <CloseIcon
                    sx={{
                      fontSize: 14,
                      verticalAlign: "middle",
                      color: "#d32f2f",
                    }}
                  />
                )}
              </strong>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
