import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Typography,
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  IconButton,
  OutlinedInput,
  Chip,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SpeciesCard from "./components/SpeciesCard";
import SummaryPanel from "./components/SummaryPanel";
import type { SelectChangeEvent } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { EAnimalSpecies } from "./types";
import { EAnimalSpecies as AnimalSpecies, AVG_HANGING_WEIGHTS } from "./types";
import { calculateHeads, calculateLaborValue } from "./utils/calculations";
import "./App.css";

const COST_PER_LB = 0.02;

const theme = createTheme({
  palette: {
    primary: {
      main: "#006F35",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FF7B00",
    },
    background: {
      default: "#F5F0E8",
      paper: "#FFFFFF",
    },
    success: {
      main: "#006F35",
    },
  },
  typography: {
    fontFamily: '"Source Serif 4", "Georgia", serif',
    h4: {
      fontWeight: 800,
      color: "#006F35",
    },
    h5: {
      fontWeight: 700,
      color: "#1a1a1a",
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#006F35",
          color: "#ffffff",
          fontWeight: 600,
          "& .MuiChip-deleteIcon": {
            color: "#ffffff",
            "&:hover": {
              color: "#FF7B00",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderLeft: "4px solid #006F35",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        },
      },
    },
  },
});

function App() {
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem("farmshare-calculator");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem("farmshare-calculator");
    }
    return null;
  };

  const saved = loadSavedState();

  const [selectedSpecies, setSelectedSpecies] = useState<EAnimalSpecies[]>(
    saved?.selectedSpecies ?? [],
  );
  const [volumes, setVolumes] = useState<Record<EAnimalSpecies, string>>(
    saved?.volumes ?? ({} as Record<EAnimalSpecies, string>),
  );
  const [timePerAnimal, setTimePerAnimal] = useState<string>(
    saved?.timePerAnimal ?? "45",
  );
  const [hourlyWage, setHourlyWage] = useState<string>(
    saved?.hourlyWage ?? "25",
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  // FIX: Controlled open state ensures dropdown closes after selection, making chips accessible to tests
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "farmshare-calculator",
      JSON.stringify({ selectedSpecies, volumes, timePerAnimal, hourlyWage }),
    );
  }, [selectedSpecies, volumes, timePerAnimal, hourlyWage]);

  const handleSpeciesChange = (event: SelectChangeEvent<EAnimalSpecies[]>) => {
    const value = event.target.value;
    const species = typeof value === "string" ? value.split(",") : value;
    setSelectedSpecies(species as EAnimalSpecies[]);
    setSelectOpen(false);
  };

  const handleDelete = (speciesValue: EAnimalSpecies) => {
    setSelectedSpecies((prev) => prev.filter((s) => s !== speciesValue));
  };

  const handleClearAll = () => {
    setSelectedSpecies([]);
    setVolumes({} as Record<EAnimalSpecies, string>);
    localStorage.setItem(
      "farmshare-calculator",
      JSON.stringify({
        selectedSpecies: [],
        volumes: {},
        timePerAnimal,
        hourlyWage,
      }),
    );
  };

  const handleVolumeChange = (species: EAnimalSpecies, value: string) => {
    if (value === "") {
      setVolumes((prev) => ({ ...prev, [species]: value }));
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 10000000) {
      setVolumes((prev) => ({ ...prev, [species]: value }));
    }
  };

  const calculateTotalAnnualSavings = () => {
    return selectedSpecies.reduce((total, species) => {
      const volume = parseFloat(volumes[species] || "0");
      if (volume > 0) {
        const avgWeight = AVG_HANGING_WEIGHTS[species];
        const heads = calculateHeads(volume, avgWeight);
        const savings = calculateLaborValue(
          heads,
          parseFloat(timePerAnimal),
          parseFloat(hourlyWage),
        );
        return total + savings;
      }
      return total;
    }, 0);
  };

  const calculateTotalAnnualCost = () => {
    return selectedSpecies.reduce((total, species) => {
      const volume = parseFloat(volumes[species] || "0");
      return total + volume * COST_PER_LB;
    }, 0);
  };

  const getTotalVolume = () => {
    return selectedSpecies.reduce((total, species) => {
      return total + parseFloat(volumes[species] || "0");
    }, 0);
  };

  const netBenefit = calculateTotalAnnualSavings() - calculateTotalAnnualCost();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F0E8" }}>
        {/* Navbar */}
        <Box
          sx={{
            backgroundColor: "#006F35",
            py: 2,
            px: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#ffffff", fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Farmshare
          </Typography>
          <Button
            variant="outlined"
            size="small"
            href="https://farmshare.co"
            target="_blank"
            sx={{
              color: "#ffffff",
              borderColor: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "#FF7B00",
                color: "#FF7B00",
              },
            }}
          >
            Learn More
          </Button>
        </Box>

        <Container maxWidth="lg">
          <Box sx={{ py: { xs: 2, md: 5 } }}>
            {/* Header */}
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Meat Processor Value Calculator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                See how much time and money Farmshare can save your operation
                every year.
              </Typography>
            </Box>

            {/* Main Layout */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                alignItems: "flex-start",
                px: { xs: 0, md: 2 },
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {/* Left Column */}
              <Box sx={{ flex: 1, width: "100%" }}>
                <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Animal Species</InputLabel>
                    <Select
                      multiple
                      open={selectOpen}
                      onOpen={() => setSelectOpen(true)}
                      onClose={() => setSelectOpen(false)}
                      value={selectedSpecies}
                      onChange={handleSpeciesChange}
                      input={<OutlinedInput label="Select Animal Species" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={
                                value.charAt(0).toUpperCase() + value.slice(1)
                              }
                              onDelete={() => handleDelete(value)}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete(value);
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              aria-label={`remove ${value}`}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(AnimalSpecies).map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedSpecies.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
                    </Box>
                  )}

                  {selectedSpecies.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ color: "#006F35" }}
                      >
                        Annual Processing Volume by Species
                      </Typography>
                      {selectedSpecies.map((species) => (
                        <SpeciesCard
                          key={species}
                          species={species}
                          volume={volumes[species] || ""}
                          onVolumeChange={handleVolumeChange}
                          timePerAnimal={parseFloat(timePerAnimal) || 45}
                          hourlyWage={parseFloat(hourlyWage) || 25}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      Advanced Settings
                    </Typography>
                    <IconButton
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      size="small"
                      sx={{
                        transform: showAdvanced
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                        color: "#006F35",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={showAdvanced}>
                    <Box sx={{ pt: 1 }}>
                      <TextField
                        fullWidth
                        label="Time Savings per Animal (minutes)"
                        type="number"
                        value={timePerAnimal}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (
                            e.target.value === "" ||
                            (val > 0 && val <= 480)
                          ) {
                            setTimePerAnimal(e.target.value);
                          }
                        }}
                        error={
                          parseFloat(timePerAnimal) <= 0 || timePerAnimal === ""
                        }
                        helperText={
                          parseFloat(timePerAnimal) <= 0 || timePerAnimal === ""
                            ? "Must be greater than 0"
                            : ""
                        }
                        inputProps={{ min: 1, max: 480 }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Average Hourly Wage ($)"
                        type="number"
                        value={hourlyWage}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (
                            e.target.value === "" ||
                            (val > 0 && val <= 500)
                          ) {
                            setHourlyWage(e.target.value);
                          }
                        }}
                        error={parseFloat(hourlyWage) <= 0 || hourlyWage === ""}
                        helperText={
                          parseFloat(hourlyWage) <= 0 || hourlyWage === ""
                            ? "Must be greater than 0"
                            : ""
                        }
                        inputProps={{ min: 1, max: 500 }}
                      />
                    </Box>
                  </Collapse>
                </Paper>
              </Box>

              {/* Right Column */}
              <SummaryPanel
                totalVolume={getTotalVolume()}
                totalSavings={calculateTotalAnnualSavings()}
                totalCost={calculateTotalAnnualCost()}
                netBenefit={netBenefit}
                selectedSpecies={selectedSpecies}
                volumes={volumes}
                timePerAnimal={parseFloat(timePerAnimal) || 45}
                hourlyWage={parseFloat(hourlyWage) || 25}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
