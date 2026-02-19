import { EAnimalSpecies, AVG_HANGING_WEIGHTS } from "../types";
import { calculateHeads } from "../utils/calculations";
import { Card, CardContent, TextField, Typography, Box } from "@mui/material";

interface SpeciesCardProps {
  species: EAnimalSpecies;
  volume: string;
  onVolumeChange: (species: EAnimalSpecies, value: string) => void;
}

export default function SpeciesCard({
  species,
  volume,
  onVolumeChange,
}: SpeciesCardProps) {
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
          {volume && parseFloat(volume) > 0 && (
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
                {calculateHeads(
                  parseFloat(volume),
                  AVG_HANGING_WEIGHTS[species],
                ).toLocaleString()}{" "}
                heads
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
          inputProps={{ min: 0 }}
        />
      </CardContent>
    </Card>
  );
}
