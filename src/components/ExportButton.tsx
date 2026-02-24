import { Button } from "@mui/material";
import { generatePDF } from "../utils/generatePDF";
import { EAnimalSpecies } from "../types";

interface ExportButtonProps {
  selectedSpecies: EAnimalSpecies[];
  volumes: Record<EAnimalSpecies, string>;
  timePerAnimal: number;
  hourlyWage: number;
  totalVolume: number;
  totalSavings: number;
  totalCost: number;
  netBenefit: number;
}

export default function ExportButton(props: ExportButtonProps) {
  const hasData = props.selectedSpecies.some(
    (s) => props.volumes[s] && parseFloat(props.volumes[s]) > 0,
  );

  if (!hasData) return null;

  return (
    <Button
      variant="outlined"
      size="medium"
      onClick={() => generatePDF(props)}
      sx={{
        borderColor: "#006F35",
        color: "#006F35",
        fontWeight: 600,
        textTransform: "none",
        width: "100%",
        mb: 2,
        "&:hover": {
          backgroundColor: "#f0f9f4",
          borderColor: "#005a2b",
        },
      }}
    >
      Download PDF Report
    </Button>
  );
}
