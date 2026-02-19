import { Box, Divider, Paper, Typography, Button } from "@mui/material";

interface SummaryPanelProps {
  totalVolume: number;
  totalSavings: number;
  totalCost: number;
  netBenefit: number;
}

export default function SummaryPanel({
  totalVolume,
  totalSavings,
  totalCost,
  netBenefit,
}: SummaryPanelProps) {
  return (
    <Box sx={{ flex: 1, position: "sticky", top: 24 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Annual Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Total Annual Volume:
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {totalVolume.toLocaleString()} lbs
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Total Annual Savings:
          </Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">
            $
            {totalSavings.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Total Annual Cost:
          </Typography>
          <Typography variant="h6" fontWeight={700} color="error.main">
            $
            {totalCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: netBenefit >= 0 ? "#f0f9f4" : "#fff5f5",
            border: `2px solid ${netBenefit >= 0 ? "#006F35" : "#d32f2f"}`,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Net Annual Benefit:
          </Typography>
          <Typography
            variant="h5"
            fontWeight={800}
            color={netBenefit >= 0 ? "success.main" : "error.main"}
          >
            $
            {netBenefit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ready to start saving? Join thousands of processors on Farmshare.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="https://farmshare.co"
          target="_blank"
          sx={{
            backgroundColor: "#FF7B00",
            color: "#ffffff",
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            width: "100%",
            "&:hover": { backgroundColor: "#e66e00" },
          }}
        >
          Get Started with Farmshare →
        </Button>
      </Box>
    </Box>
  );
}
