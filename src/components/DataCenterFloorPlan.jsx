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


import RackModal from './RackModal';

/*// Użyj tego komponentu w głównym komponencie DataCenterFloorPlan

<RackModal
  rack={selectedRack}
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedServerInModal(null);
  }}
  selectedServer={selectedServerInModal}
  onSelectServer={setSelectedServerInModal}
/>

:*/
// Dodajemy style dla tooltipa
const tooltipStyles = `
  .tooltip {
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .server-details {
    position: fixed;
    right: 20px;
    top: 20px;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid #444;
    padding: 16px;
    border-radius: 8px;
    width: 300px;
  }
`;

// Definicje modeli serwerów
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

// Funkcja generująca bardziej realistyczne dane serwerów
function generateServers(count, location) {
  const models = Object.keys(SERVER_MODELS);
  const statuses = ['Active', 'Maintenance', 'Warning', 'Error'];
  const manufacturers = ['Dell', 'HPE'];
  const cpuTypes = ['Intel Xeon Gold 6330', 'AMD EPYC 7763'];
  const randomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  return Array.from({ length: count }, (_, i) => ({
    id: `SRV-${location}-${i + 1}`,
    name: `SERVER-${location}-${i + 1}`,
    model: models[Math.floor(Math.random() * models.length)],
    serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    cpuType: cpuTypes[Math.floor(Math.random() * cpuTypes.length)],
    cpuCount: Math.floor(Math.random() * 2) + 1,
    ramTotal: [128, 256, 512][Math.floor(Math.random() * 3)],
    powerUsage: Math.round(Math.random() * 500) + 300,
    cpuUsage: Math.round(Math.random() * 100),
    ramUsage: Math.round(Math.random() * 100),
    position: i + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    installDate: randomDate(),
    lastMaintenance: randomDate()
  }));
}


// Generator szaf pozostaje podobny, ale dodajemy więcej metadanych
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
        x: 50 + col * 25,
        y: 50 + row * 20,
        width: 18,
        height: 12,
        powerUsage,
        maxPower: 2000,
        temperature: Math.round(Math.random() * 10 + 20), // 20-30°C
        humidity: Math.round(Math.random() * 20 + 40), // 40-60%
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
  // Podstawowe stany
  const [selectedFloor, setSelectedFloor] = useState(MOCK_DATA.floors[0]);
  const [powerRange, setPowerRange] = useState([100, 1500]);
  const [selectedRacks, setSelectedRacks] = useState([]);
  const [selectedServers, setSelectedServers] = useState([]);

  // Stany dla tooltipów
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Stany dla modalu
  const [selectedRack, setSelectedRack] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServerInModal, setSelectedServerInModal] = useState(null);

  // Memoizowane listy
  const allServers = useMemo(() => 
    selectedFloor.racks.flatMap(rack => 
      rack.servers.map(server => ({
        value: server.id,
        label: server.name,
        rackLocation: rack.location
      }))
    ).sort((a, b) => a.label.localeCompare(b.label))
  , [selectedFloor]);

  const allRacks = useMemo(() => 
    selectedFloor.racks.map(rack => ({
      value: rack.location,
      label: `${rack.location} (${rack.powerUsage}W)`,
      powerUsage: rack.powerUsage
    })).sort((a, b) => a.value.localeCompare(b.value))
  , [selectedFloor]);

  // Filtrowane szafy
  const filteredRacks = useMemo(() => 
    selectedFloor.racks.filter(rack => {
      const powerFilter = rack.powerUsage >= powerRange[0] && rack.powerUsage <= powerRange[1];
      const rackFilter = selectedRacks.length === 0 || selectedRacks.includes(rack.location);
      const serverFilter = selectedServers.length === 0 || 
        rack.servers.some(server => selectedServers.includes(server.id));
      
      return powerFilter && (rackFilter || serverFilter);
    })
  , [selectedFloor.racks, powerRange, selectedRacks, selectedServers]);

  // Handlery
  const handleRackClick = (rack) => {
    setSelectedRack(rack);
    setSelectedServerInModal(null); // Resetujemy wybrany serwer przy otwieraniu nowej szafy
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServerInModal(null);
    setSelectedRack(null);
  };

  const handleServerSelect = (server) => {
    setSelectedServerInModal(server);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="p-4 space-y-4">
        {/* Kontrolki wyszukiwania */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            multiple
            value={selectedServers}
            onValueChange={setSelectedServers}
          >
            <SelectTrigger className="w-full bg-gray-800 text-white">
              <SelectValue placeholder="Wybierz serwery..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {allServers.map(server => (
                  <SelectItem key={server.value} value={server.value}>
                    {server.label} ({server.rackLocation})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select 
            multiple
            value={selectedRacks}
            onValueChange={setSelectedRacks}
          >
            <SelectTrigger className="w-full bg-gray-800 text-white">
              <SelectValue placeholder="Wybierz szafy..." />
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
        </div>

        {/* Wyświetlanie wybranych elementów */}
        <div className="flex flex-wrap gap-2">
          {selectedServers.map(serverId => {
            const server = allServers.find(s => s.value === serverId);
            return (
              <span key={serverId} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                {server?.label}
              </span>
            );
          })}
          {selectedRacks.map(rackId => {
            const rack = allRacks.find(r => r.value === rackId);
            return (
              <span key={rackId} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                {rack?.label}
              </span>
            );
          })}
        </div>

        {/* Slider zakresu mocy */}
        <div className="flex items-center gap-4">
          <span>Zakres mocy:</span>
          <Slider
            min={100}
            max={1500}
            step={50}
            value={powerRange}
            onValueChange={setPowerRange}
            className="w-80"
          />
          <span>{powerRange[0]}W - {powerRange[1]}W</span>
        </div>

        {/* Plan piętra */}
        <Card className="bg-gray-900">
          <CardContent className="p-6">
            <svg width="1200" height="600" viewBox="0 0 1200 600">
              <rect width="1200" height="600" fill="#111" />
              {/* Grid */}
              <g stroke="#333" strokeWidth="0.5">
                {Array.from({ length: 60 }, (_, i) => (
                  <line key={`v-${i}`} x1={25 * i} y1={0} x2={25 * i} y2={600} />
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <line key={`h-${i}`} x1={0} y1={20 * i} x2={1200} y2={20 * i} />
                ))}
              </g>
              {/* Racks */}
              {filteredRacks.map(rack => (
                <g 
                  key={rack.id}
                  onClick={() => handleRackClick(rack)}
                  onMouseEnter={(e) => {
                    setTooltipContent(
                      <div>
                        <div>Lokalizacja: {rack.location}</div>
                        <div>Moc: {rack.powerUsage}W / {rack.maxPower}W</div>
                        <div>Temperatura: {rack.temperature}°C</div>
                        <div>Liczba serwerów: {rack.servers.length}</div>
                      </div>
                    );
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: rect.left + window.scrollX + rack.width + 10,
                      y: rect.top + window.scrollY
                    });
                  }}
                  onMouseLeave={() => setTooltipContent(null)}
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
            className="tooltip"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`
            }}
          >
            {tooltipContent}
          </div>
        )}

        {/* Modal */}
        <RackModal
          rack={selectedRack}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedServer={selectedServerInModal}
          onSelectServer={handleServerSelect}
        />
      </div>
    </div>
  );
};
export default DataCenterFloorPlan;