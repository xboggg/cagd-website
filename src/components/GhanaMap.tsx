import { useState } from "react";

interface GhanaMapProps {
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void;
  regions: string[];
}

// Accurate polygon coordinates traced from the Ghana map image
// viewBox is 400x500 to match image proportions
const regionPolygons: Record<string, { points: string; labelX: number; labelY: number }> = {
  "Upper West Region": {
    points: "85,95 130,75 175,85 185,120 170,160 125,175 85,155 70,125",
    labelX: 125, labelY: 125
  },
  "Upper East Region": {
    points: "185,120 175,85 220,65 275,70 295,95 285,135 250,150 210,145",
    labelX: 235, labelY: 105
  },
  "North East Region": {
    points: "285,135 295,95 325,85 350,110 340,155 305,175 270,160 255,150",
    labelX: 310, labelY: 125
  },
  "Savannah Region": {
    points: "70,125 85,155 125,175 145,215 125,260 85,270 55,240 50,190 55,155",
    labelX: 95, labelY: 210
  },
  "Northern Region": {
    points: "145,215 125,175 170,160 210,145 250,150 270,160 290,200 270,260 220,285 175,270 155,240",
    labelX: 215, labelY: 210
  },
  "Bono East Region": {
    points: "125,260 145,215 175,270 170,320 135,335 105,315 100,280",
    labelX: 140, labelY: 295
  },
  "Bono Region": {
    points: "55,240 85,270 100,280 105,315 90,355 55,350 40,310 45,270",
    labelX: 75, labelY: 310
  },
  "Oti Region": {
    points: "290,200 320,185 350,210 355,275 335,325 300,340 275,310 270,260",
    labelX: 315, labelY: 265
  },
  "Ahafo Region": {
    points: "55,350 90,355 110,380 100,420 65,415 45,385",
    labelX: 80, labelY: 385
  },
  "Ashanti Region": {
    points: "110,380 90,355 105,315 135,335 170,320 200,335 210,380 180,415 135,420",
    labelX: 155, labelY: 370
  },
  "Eastern Region": {
    points: "210,380 200,335 230,320 265,335 275,375 255,415 220,420",
    labelX: 240, labelY: 370
  },
  "Volta Region": {
    points: "275,310 300,340 310,390 295,445 260,465 245,430 255,415 275,375 265,335 275,310",
    labelX: 280, labelY: 395
  },
  "Western North Region": {
    points: "45,385 65,415 75,450 60,490 30,480 20,440 25,405",
    labelX: 50, labelY: 445
  },
  "Western Region": {
    points: "75,450 100,420 135,435 145,480 120,520 75,510 60,490",
    labelX: 105, labelY: 475
  },
  "Central Region": {
    points: "145,480 180,450 225,455 245,490 215,525 165,520",
    labelX: 195, labelY: 485
  },
  "Greater Accra Region": {
    points: "245,430 260,410 290,420 295,455 270,475 245,465",
    labelX: 268, labelY: 445
  },
};

const regionLabels: Record<string, string> = {
  "Upper West Region": "UPPER WEST",
  "Upper East Region": "UPPER EAST",
  "North East Region": "NORTH EAST",
  "Northern Region": "NORTHERN",
  "Savannah Region": "SAVANNAH",
  "Bono East Region": "BONO EAST",
  "Bono Region": "BONO",
  "Oti Region": "OTI",
  "Ahafo Region": "AHAFO",
  "Ashanti Region": "ASHANTI",
  "Eastern Region": "EASTERN",
  "Volta Region": "VOLTA",
  "Western North Region": "WESTERN NORTH",
  "Western Region": "WESTERN",
  "Central Region": "CENTRAL",
  "Greater Accra Region": "GREATER ACCRA",
};

const regionColors: Record<string, string> = {
  "Upper West Region": "#FFF59D",
  "Upper East Region": "#FF9800",
  "North East Region": "#FFEB3B",
  "Northern Region": "#29B6F6",
  "Savannah Region": "#EF5350",
  "Bono East Region": "#EF5350",
  "Bono Region": "#F8BBD9",
  "Oti Region": "#66BB6A",
  "Ahafo Region": "#F8BBD9",
  "Ashanti Region": "#7B1FA2",
  "Eastern Region": "#A5D6A7",
  "Volta Region": "#FF9800",
  "Western North Region": "#42A5F5",
  "Western Region": "#42A5F5",
  "Central Region": "#8D6E63",
  "Greater Accra Region": "#FF7043",
};

export default function GhanaMap({ selectedRegion, onRegionSelect, regions }: GhanaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-100 p-2">
      <svg
        viewBox="0 0 400 550"
        className="w-full h-auto max-h-[450px]"
        style={{ filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))" }}
      >
        {/* Region polygons */}
        {Object.entries(regionPolygons).map(([name, { points, labelX, labelY }]) => {
          const isAvailable = regions.includes(name);
          const isSelected = selectedRegion === name;
          const isHovered = hoveredRegion === name;
          const baseColor = regionColors[name] || "#ccc";
          const label = regionLabels[name] || name.replace(" Region", "").toUpperCase();

          return (
            <g key={name}>
              <polygon
                points={points}
                fill={isSelected ? "#166534" : isHovered ? "#22c55e" : baseColor}
                stroke="#333"
                strokeWidth={isSelected ? 2.5 : 1}
                className={isAvailable ? "cursor-pointer transition-all duration-200" : "cursor-not-allowed opacity-50"}
                onClick={() => isAvailable && onRegionSelect(name)}
                onMouseEnter={() => setHoveredRegion(name)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill={isSelected ? "#fff" : "#000"}
                className="pointer-events-none select-none"
                style={{ textShadow: isSelected ? "none" : "0 0 2px rgba(255,255,255,0.8)" }}
              >
                {label.split(" ").length > 1 ? (
                  <>
                    <tspan x={labelX} dy="-5">{label.split(" ")[0]}</tspan>
                    <tspan x={labelX} dy="11">{label.split(" ").slice(1).join(" ")}</tspan>
                  </>
                ) : (
                  label
                )}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredRegion && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap">
          Click to view {hoveredRegion} office
        </div>
      )}
    </div>
  );
}
