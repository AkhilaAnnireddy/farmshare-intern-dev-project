import jsPDF from "jspdf";
import { EAnimalSpecies, AVG_HANGING_WEIGHTS } from "../types";
import { calculateHeads, calculateLaborValue } from "./calculations";

const COST_PER_LB = 0.02;
const GREEN = "#006F35";
const CREAM = "#F5F0E8";
const WHITE = "#FFFFFF";
const DARK = "#1a1a1a";
const GRAY = "#666666";

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const setFillColor = (pdf: jsPDF, hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  pdf.setFillColor(r, g, b);
};

const setTextColor = (pdf: jsPDF, hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  pdf.setTextColor(r, g, b);
};

const setDrawColor = (pdf: jsPDF, hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  pdf.setDrawColor(r, g, b);
};

interface GeneratePDFProps {
  selectedSpecies: EAnimalSpecies[];
  volumes: Record<EAnimalSpecies, string>;
  timePerAnimal: number;
  hourlyWage: number;
  totalVolume: number;
  totalSavings: number;
  totalCost: number;
  netBenefit: number;
}

export const generatePDF = ({
  selectedSpecies,
  volumes,
  timePerAnimal,
  hourlyWage,
  totalVolume,
  totalSavings,
  totalCost,
  netBenefit,
}: GeneratePDFProps) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth(); // 210mm
  const margin = 16;
  let y = 0;

  // ── HEADER BAR ──
  setFillColor(pdf, GREEN);
  pdf.rect(0, 0, W, 22, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  setTextColor(pdf, WHITE);
  pdf.text("Farmshare", margin, 14);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("ROI Report", W - margin, 14, { align: "right" });

  y = 30;

  // ── META INFO ──
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const speciesList = selectedSpecies
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  setTextColor(pdf, GRAY);
  pdf.text(`Generated: ${date}`, margin, y);
  pdf.text(`Species: ${speciesList}`, margin, y + 6);

  y = 48;

  // ── DIVIDER ──
  setDrawColor(pdf, "#e0e0e0");
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, W - margin, y);
  y += 8;

  // ── SUMMARY SECTION ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(pdf, GREEN);
  pdf.text("ANNUAL SUMMARY", margin, y);
  y += 7;

  const rows = [
    {
      label: "Total Lbs Processed",
      value: `${totalVolume.toLocaleString()} lbs`,
    },
    {
      label: "Labor Savings",
      value: `$${totalSavings.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      label: "Farmshare Cost",
      value: `$${totalCost.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
  ];

  rows.forEach(({ label, value }) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    setTextColor(pdf, DARK);
    pdf.text(label, margin, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(value, W - margin, y, { align: "right" });
    y += 8;
  });

  y += 2;

  // Net savings highlighted box
  const netColor = netBenefit >= 0 ? GREEN : "#d32f2f";
  setFillColor(pdf, netBenefit >= 0 ? "#f0f9f4" : "#fff5f5");
  setDrawColor(pdf, netColor);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y, W - margin * 2, 14, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  setTextColor(pdf, netColor);
  pdf.text("Net Savings", margin + 6, y + 9);
  pdf.text(
    `$${netBenefit.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    W - margin - 6,
    y + 9,
    { align: "right" },
  );
  y += 22;

  // ── DIVIDER ──
  setDrawColor(pdf, "#e0e0e0");
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, W - margin, y);
  y += 8;

  // ── PER SPECIES BREAKDOWN ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(pdf, GREEN);
  pdf.text("PER SPECIES BREAKDOWN", margin, y);
  y += 7;

  // Table header
  setFillColor(pdf, CREAM);
  pdf.rect(margin, y - 4, W - margin * 2, 8, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setTextColor(pdf, DARK);
  pdf.text("Species", margin + 2, y + 1);
  pdf.text("Volume", margin + 45, y + 1);
  pdf.text("Animals", margin + 80, y + 1);
  pdf.text("Labor Savings", margin + 110, y + 1);
  pdf.text("Net", W - margin - 2, y + 1, { align: "right" });
  y += 10;

  selectedSpecies
    .filter((s) => volumes[s] && parseFloat(volumes[s]) > 0)
    .forEach((species, i) => {
      const volume = parseFloat(volumes[species]);
      const avgWeight = AVG_HANGING_WEIGHTS[species];
      const heads = calculateHeads(volume, avgWeight);
      const savings = calculateLaborValue(heads, timePerAnimal, hourlyWage);
      const cost = volume * COST_PER_LB;
      const net = savings - cost;

      // Alternating row background
      if (i % 2 === 0) {
        setFillColor(pdf, "#fafafa");
        pdf.rect(margin, y - 4, W - margin * 2, 8, "F");
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      setTextColor(pdf, DARK);
      pdf.text(
        species.charAt(0).toUpperCase() + species.slice(1),
        margin + 2,
        y + 1,
      );

      pdf.setFont("helvetica", "normal");
      pdf.text(`${volume.toLocaleString()} lbs`, margin + 45, y + 1);
      pdf.text(`${heads.toLocaleString()}`, margin + 80, y + 1);
      pdf.text(
        `$${savings.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        margin + 110,
        y + 1,
      );

      setTextColor(pdf, net >= 0 ? GREEN : "#d32f2f");
      pdf.setFont("helvetica", "bold");
      pdf.text(`$${net.toFixed(2)}`, W - margin - 2, y + 1, { align: "right" });
      setTextColor(pdf, DARK);
      y += 9;
    });

  y += 6;

  // ── DIVIDER ──
  setDrawColor(pdf, "#e0e0e0");
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, W - margin, y);
  y += 8;

  // ── GROWTH INSIGHT ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(pdf, GREEN);
  pdf.text("GROWTH INSIGHT", margin, y);
  y += 7;

  const insightBg = netBenefit >= 0 ? "#f0f9f4" : "#fff5f5";
  const insightBorder = netBenefit >= 0 ? GREEN : "#d32f2f";

  if (netBenefit < 0) {
    setFillColor(pdf, insightBg);
    setDrawColor(pdf, insightBorder);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y - 2, W - margin * 2, 18, 2, 2, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    setTextColor(pdf, "#d32f2f");
    pdf.text(
      `You're $${Math.abs(netBenefit).toFixed(2)} away from breaking even`,
      margin + 4,
      y + 5,
    );
    pdf.setFont("helvetica", "normal");
    setTextColor(pdf, GRAY);
    pdf.text(
      "Increase your processing volume to start saving with Farmshare",
      margin + 4,
      y + 12,
    );
  } else {
    const profitPct = Math.round((netBenefit / totalCost) * 100);
    setFillColor(pdf, insightBg);
    setDrawColor(pdf, insightBorder);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin, y - 2, W - margin * 2, 18, 2, 2, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    setTextColor(pdf, GREEN);
    pdf.text(
      `You're saving ${profitPct}% more than Farmshare costs!`,
      margin + 4,
      y + 5,
    );
    pdf.setFont("helvetica", "normal");
    setTextColor(pdf, GRAY);
    pdf.text(
      "Increase processing volume to grow your savings further.",
      margin + 4,
      y + 12,
    );
  }

  y += 26;

  // ── FOOTER ──
  const footerY = pdf.internal.pageSize.getHeight() - 14;
  setFillColor(pdf, GREEN);
  pdf.rect(0, footerY, W, 14, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setTextColor(pdf, WHITE);
  pdf.text("farmshare.co", margin, footerY + 9);

  pdf.setFont("helvetica", "normal");
  setTextColor(pdf, "#a5d6a7");
  pdf.text(
    "Streamlining meat processing operations across America",
    W - margin,
    footerY + 9,
    { align: "right" },
  );

  pdf.save("farmshare-roi-report.pdf");
};
