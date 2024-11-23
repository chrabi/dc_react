import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Search } from 'lucide-react';

// Dodajemy style dla tooltipa
const tooltipStyles = `
  .rack-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    border: 1px solid #333;
  }
`;

const SERVER_MODELS = {
  'DELL-R730': {
    name: 'Dell PowerEdge R730',
    height: 2,
    power: '750W-1100W',
    svg: (
      <g>
        <rect width="300" height="40" fill="#1a1a1a" stroke="#333" />
        <rect x="5" y="5" width="50" height="30" fill="#222" />
        <circle cx="15" cy="20" r="3" fill="#00ff00" />
        <text x="270" y="35" fill="#666" fontSize="10">R730</text>
      </g>
    )
  },
  'HPE-DL380-G11': {
    name: 'HPE ProLiant DL380 Gen11',
    height: 2,
    power: '800W-1600W',
    svg: (
      <g>
        <rect width="300" height="40" fill="#111111" stroke="#333" />
        <rect x="5" y="5" width="55" height="30" fill="#181818" />
        <circle cx="15" cy="20" r="3" fill="#0000ff" />
        <text x="270" y="35" fill="#666" fontSize="10">DL380</text>
      </g>
    )
  }
};

function generateServers(count, location) {
  const models = Object.keys(SERVER_MODELS);
  return Array.from({ length: count }, (_, i) => ({
    id: `SRV-${location}-${i + 1}`,
    name: `SERVER-${location}-${i + 1}`,
    model: models[Math.floor(Math.random() * models.length)],
    powerUsage: Math.round(Math.random() * 500) + 300,
    cpuUsage: Math.round(Math.random() * 100),
    ramUsage: Math.round(Math.random() * 100),
    position: i + 1
  }));
}

function generateRacks() {
  const racks = [];
  const ROWS = 16;
  const COLS = 16;
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const location = `${String(col + 1).padStart(3, '0')}-02${String.fromCharCode(65 + row)}`;
      const powerUsage = Math.floor(Math.random() * (1500 - 100)) + 100;
      racks.push({
        id: `rack-${row}-${col}`,
        location,
        x: 50 + col * 20,
        y: 50 + row * 20,
        width: 14,
        height: 8,
        powerUsage,
        color: `rgba(${Math.round((powerUsage - 100) / 1400 * 255)}, ${Math.round((1500 - powerUsage) / 1400 * 255)}, 0, 0.6)`,
        servers: generateServers(Math.floor(Math.random() * 20) + 10, location)
      });
    }
  }
  return racks;
}

const MOCK_DATA = {
  floors: [
    { id: 1, name: "Piętro 1", racks: generateRacks() },
    { id: 2, name: "Piętro 2", racks: generateRacks() }
  ]
};

const DataCenterFloorPlan = () => {
  const [selectedFloor, setSelectedFloor] = useState(MOCK_DATA.floors[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [powerRange, setPowerRange] = useState([100, 1500]);
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedRack, setSelectedRack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedRacks, setSelectedRacks] = useState([]);

  // Przygotuj listę wszystkich szaf do wyboru
  const allRacks = useMemo(() => 
    selectedFloor.racks.map(rack => ({
      value: rack.location,
      label: `${rack.location} (${rack.powerUsage}W)`
    })).sort((a, b) => a.value.localeCompare(b.value))
  , [selectedFloor]);

  const filteredRacks = useMemo(() => 
    selectedFloor.racks.filter(rack => 
      rack.powerUsage >= powerRange[0] && 
      rack.powerUsage <= powerRange[1] &&
      (activeSearch ? rack.servers.some(server => 
        server.name.toLowerCase().includes(activeSearch.toLowerCase())
      ) : true) &&
      (selectedRacks.length === 0 || selectedRacks.includes(rack.location))
    ), [selectedFloor.racks, powerRange, activeSearch, selectedRacks]);

  const handleMouseMove = (e, rack) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipContent({
      location: rack.location,
      powerUsage: rack.powerUsage,
      serverCount: rack.servers.length
    });
    setTooltipPosition({
      x: rect.left + window.scrollX + rack.width + 10,
      y: rect.top + window.scrollY
    });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <style>{tooltipStyles}</style>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Istniejące kontrolki */}
          <Select 
            value={selectedFloor.id.toString()} 
            onValueChange={(value) => setSelectedFloor(MOCK_DATA.floors.find(f => f.id.toString() === value))}
          >
            <SelectTrigger className="w-48 bg-gray-800 text-white">
              <SelectValue placeholder="Wybierz piętro" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MOCK_DATA.floors.map(floor => (
                  <SelectItem key={floor.id} value={floor.id.toString()}>
                    {floor.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Wielokrotny wybór szaf */}
          <Select 
            multiple
            value={selectedRacks}
            onValueChange={setSelectedRacks}
          >
            <SelectTrigger className="w-96 bg-gray-800 text-white">
              <SelectValue placeholder="Wybierz szafy rackowe..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {allRacks.map(rack => (
                  <SelectItem key={rack.value} value={rack.value}>
                    {rack.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Pozostałe kontrolki */}
          {/* ... */}
        </div>

        {/* Wyświetlanie wybranych szaf */}
        {selectedRacks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedRacks.map(rackId => {
              const rack = selectedFloor.racks.find(r => r.location === rackId);
              return (
                <span 
                  key={rackId} 
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                >
                  {rackId} ({rack?.powerUsage}W)
                </span>
              );
            })}
          </div>
        )}

        {/* Plan piętra */}
        <Card className="bg-gray-900">
          <CardContent className="p-6">
            <svg width="1200" height="600" viewBox="0 0 1200 600">
              <rect width="1200" height="600" fill="#111" />
              {/* Siatka */}
              <g stroke="#333" strokeWidth="0.5">
                {Array.from({ length: 60 }, (_, i) => (
                  <line key={`v-${i}`} x1={25 * i} y1={0} x2={25 * i} y2={600} />
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <line key={`h-${i}`} x1={0} y1={20 * i} x2={1200} y2={20 * i} />
                ))}
              </g>
              {/* Szafy */}
              {filteredRacks.map(rack => (
                <g 
                  key={rack.id} 
                  onClick={() => {
                    setSelectedRack(rack);
                    setIsModalOpen(true);
                  }}
                  onMouseMove={(e) => handleMouseMove(e, rack)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                >
                  <rect
                    x={rack.x}
                    y={rack.y}
                    width={rack.width}
                    height={rack.height}
                    fill={rack.color}
                    stroke={selectedRacks.includes(rack.location) ? "#ff0000" : "#666"}
                    strokeWidth={selectedRacks.includes(rack.location) ? "2" : "1"}
                  />
                  <text
                    x={rack.x + rack.width / 2}
                    y={rack.y + rack.height + 6}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="6"
                    className="select-none"
                  >
                    {rack.location}
                  </text>
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>

        {/* Tooltip */}
        {tooltipContent && (
          <div 
            className="rack-tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`
            }}
          >
            <div>Lokalizacja: {tooltipContent.location}</div>
            <div>Zużycie energii: {tooltipContent.powerUsage}W</div>
            <div>Liczba serwerów: {tooltipContent.serverCount}</div>
          </div>
        )}

        {/* Modal pozostaje bez zmian */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          {/* ... (poprzedni kod modalu) ... */}
        </Dialog>
      </div>
    </div>
  );
};

export default DataCenterFloorPlan;