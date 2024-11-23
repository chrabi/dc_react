import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

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
  
const ServerDetailsTooltip = ({ server }) => (
  <div className="space-y-1 p-2">
    <div>Power: {server.powerUsage}W</div>
    <div>CPU: {server.cpuUsage}%</div>
    <div>RAM: {server.ramUsage}% of {server.ramTotal}GB</div>
    <div>Status: {server.status}</div>
  </div>
);

const ServerDetails = ({ server }) => (
  <div className="space-y-2 bg-gray-800 p-4 rounded-lg">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{server.name}</h3>
      <Badge 
        variant={
          server.status === 'Active' ? 'success' : 
          server.status === 'Warning' ? 'warning' : 
          server.status === 'Error' ? 'destructive' : 
          'secondary'
        }
      >
        {server.status}
      </Badge>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-400">Model</p>
        <p>{SERVER_MODELS[server.model].name}</p>
      </div>
      <div>
        <p className="text-gray-400">Serial Number</p>
        <p>{server.serialNumber}</p>
      </div>
      <div>
        <p className="text-gray-400">CPU</p>
        <p>{server.cpuType} x{server.cpuCount}</p>
      </div>
      <div>
        <p className="text-gray-400">RAM</p>
        <p>{server.ramTotal}GB</p>
      </div>
      <div>
        <p className="text-gray-400">Power Usage</p>
        <p>{server.powerUsage}W</p>
      </div>
      <div>
        <p className="text-gray-400">Position</p>
        <p>U{server.position}</p>
      </div>
      <div>
        <p className="text-gray-400">Installation Date</p>
        <p>{server.installDate.toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-gray-400">Last Maintenance</p>
        <p>{server.lastMaintenance.toLocaleDateString()}</p>
      </div>
    </div>
    
    <div className="mt-4">
      <div className="space-y-2">
        <div>
          <p className="text-gray-400 text-sm">CPU Usage</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${server.cpuUsage}%` }}
            />
          </div>
          <p className="text-right text-sm">{server.cpuUsage}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">RAM Usage</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ width: `${server.ramUsage}%` }}
            />
          </div>
          <p className="text-right text-sm">{server.ramUsage}% of {server.ramTotal}GB</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Power Usage</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 rounded-full h-2" 
              style={{ width: `${(server.powerUsage / SERVER_MODELS[server.model].power.split('-')[1].replace('W', '')) * 100}%` }}
            />
          </div>
          <p className="text-right text-sm">{server.powerUsage}W of {SERVER_MODELS[server.model].power}</p>
        </div>
      </div>
    </div>
  </div>
);

const RackModal = ({ rack, isOpen, onClose, selectedServer, onSelectServer }) => {
  const [hoveredServer, setHoveredServer] = useState(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Rack {rack?.location}</span>
            <div className="flex space-x-4 text-sm">
              <span>Temperature: {rack?.temperature}°C</span>
              <span>Humidity: {rack?.humidity}%</span>
              <span>Power: {rack?.powerUsage}W / {rack?.maxPower}W</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Left side - Rack visualization */}
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4">Rack View</h3>
            <div className="relative">
              <svg width="400" height="800" viewBox="0 0 400 800">
                <rect width="400" height="800" fill="#111" />
                {rack?.servers.map((server, index) => (
                  <g 
                    key={server.id}
                    transform={`translate(50, ${50 + index * 45})`}
                    className="cursor-pointer"
                    onClick={() => onSelectServer(server)}
                    onMouseEnter={() => setHoveredServer(server)}
                    onMouseLeave={() => setHoveredServer(null)}
                  >
                    {/* Server visualization */}
                    <g opacity={selectedServer?.id === server.id ? 1 : 0.7}>
                      {SERVER_MODELS[server.model].svg}
                      <rect
                        x="0"
                        y="0"
                        width="300"
                        height={SERVER_MODELS[server.model].height * 20}
                        fill="transparent"
                        stroke={selectedServer?.id === server.id ? "#ffffff" : "transparent"}
                        strokeWidth="2"
                      />
                    </g>
                    {/* Server status indicator */}
                    <circle
                      cx="290"
                      cy="20"
                      r="5"
                      fill={
                        server.status === 'Active' ? '#10b981' :
                        server.status === 'Warning' ? '#f59e0b' :
                        server.status === 'Error' ? '#ef4444' :
                        '#6b7280'
                      }
                    />
                  </g>
                ))}
              </svg>
              
              {/* Tooltip */}
              {hoveredServer && (
                <div 
                  className="absolute bg-black bg-opacity-90 p-2 rounded shadow-lg text-xs"
                  style={{
                    left: '420px',
                    top: '50px'
                  }}
                >
                  <ServerDetailsTooltip server={hoveredServer} />
                </div>
              )}
            </div>
          </div>

          {/* Right side - Server details */}
          <div className="space-y-4">
            {selectedServer ? (
              <ServerDetails server={selectedServer} />
            ) : (
              <div className="text-center text-gray-400 mt-8">
                Select a server to view details
              </div>
            )}

            {/* Server list */}
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold">Servers in Rack</h3>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {rack?.servers.map(server => (
                  <div
                    key={server.id}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      selectedServer?.id === server.id 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => onSelectServer(server)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{server.name}</span>
                      <Badge 
                        variant={
                          server.status === 'Active' ? 'success' : 
                          server.status === 'Warning' ? 'warning' : 
                          server.status === 'Error' ? 'destructive' : 
                          'secondary'
                        }
                        className="ml-2"
                      >
                        {server.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Użyj tego komponentu w głównym komponencie DataCenterFloorPlan:
/*
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
*/

export default RackModal;