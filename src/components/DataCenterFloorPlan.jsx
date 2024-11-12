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

  const filteredRacks = useMemo(() => 
    selectedFloor.racks.filter(rack => 
      rack.powerUsage >= powerRange[0] && 
      rack.powerUsage <= powerRange[1] &&
      (activeSearch ? rack.servers.some(server => 
        server.name.toLowerCase().includes(activeSearch.toLowerCase())
      ) : true)
    ), [selectedFloor.racks, powerRange, activeSearch]);

  const floorStats = useMemo(() => ({
    totalRacks: filteredRacks.length,
    totalServers: filteredRacks.reduce((sum, rack) => sum + rack.servers.length, 0),
    totalPower: filteredRacks.reduce((sum, rack) => sum + rack.powerUsage, 0),
    avgPowerPerRack: Math.round(
      filteredRacks.reduce((sum, rack) => sum + rack.powerUsage, 0) / filteredRacks.length
    )
  }), [filteredRacks]);

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
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

          <div className="flex gap-2">
            <Input
              placeholder="Szukaj serwera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-gray-800 text-white"
            />
            <Button onClick={() => setActiveSearch(searchQuery)} variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Szukaj
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span>Zużycie energii:</span>
            <Slider
              min={100}
              max={1500}
              step={50}
              value={powerRange}
              onValueChange={setPowerRange}
              className="w-48"
            />
            <span>{powerRange[0]}W - {powerRange[1]}W</span>
          </div>
        </div>

        <Card className="bg-gray-900">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-2">Statystyki piętra</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Liczba szaf</p>
                <p className="text-xl">{floorStats.totalRacks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Liczba serwerów</p>
                <p className="text-xl">{floorStats.totalServers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Całkowite zużycie</p>
                <p className="text-xl">{floorStats.totalPower}W</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Średnie na szafę</p>
                <p className="text-xl">{floorStats.avgPowerPerRack}W</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900">
          <CardContent className="p-6">
            <svg width="1000" height="600" viewBox="0 0 1000 600">
              <rect width="1000" height="600" fill="#111" />
              <g stroke="#333" strokeWidth="0.5">
                {Array.from({ length: 50 }, (_, i) => (
                  <line key={`v-${i}`} x1={20 * i} y1={0} x2={20 * i} y2={600} />
                ))}
                {Array.from({ length: 30 }, (_, i) => (
                  <line key={`h-${i}`} x1={0} y1={20 * i} x2={1000} y2={20 * i} />
                ))}
              </g>
              {filteredRacks.map(rack => (
                <g 
                  key={rack.id} 
                  onClick={() => {
                    setSelectedRack(rack);
                    setIsModalOpen(true);
                  }} 
                  className="cursor-pointer"
                >
                  <rect
                    x={rack.x}
                    y={rack.y}
                    width={rack.width}
                    height={rack.height}
                    fill={rack.color}
                    stroke={activeSearch && rack.servers.some(s => 
                      s.name.toLowerCase().includes(activeSearch.toLowerCase())
                    ) ? "#ff0000" : "#666"}
                    strokeWidth="1"
                  />
                  <text
                    x={rack.x + rack.width / 2}
                    y={rack.y + rack.height + 4}
                    textAnchor="middle"
                    fill="#999"
                    fontSize="4"
                  >
                    {rack.location}
                  </text>
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-6xl bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                Szafa {selectedRack?.location} ({selectedRack?.powerUsage}W)
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-700 rounded p-4">
                <h3 className="text-sm font-semibold mb-2">Widok szafy</h3>
                <svg width="400" height="800" viewBox="0 0 400 800">
                  <rect width="400" height="800" fill="#111" />
                  {selectedRack?.servers.map((server, index) => (
                    <g key={server.id} transform={`translate(50, ${50 + index * 45})`}>
                      {SERVER_MODELS[server.model].svg}
                    </g>
                  ))}
                </svg>
              </div>
              <div className="overflow-auto max-h-[600px]">
                <table className="w-full">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Nazwa</th>
                      <th className="px-4 py-2 text-left">Model</th>
                      <th className="px-4 py-2 text-left">Pozycja</th>
                      <th className="px-4 py-2 text-left">Moc</th>
                      <th className="px-4 py-2 text-left">CPU</th>
                      <th className="px-4 py-2 text-left">RAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {selectedRack?.servers.map(server => (
                      <tr key={server.id} className="hover:bg-gray-800">
                        <td className="px-4 py-2">{server.name}</td>
                        <td className="px-4 py-2">{SERVER_MODELS[server.model].name}</td>
                        <td className="px-4 py-2">{server.position}U</td>
                        <td className="px-4 py-2">{server.powerUsage}W</td>
                        <td className="px-4 py-2">{server.cpuUsage}%</td>
                        <td className="px-4 py-2">{server.ramUsage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DataCenterFloorPlan;