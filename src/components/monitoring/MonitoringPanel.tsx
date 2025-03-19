import React from 'react';
import { Device, Alert } from '../../types/database';
import { Cpu, MemoryStick as MemoryIcon, HardDrive, Network, Activity, AlertTriangle, Bell, StopCircle, Download, Upload } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonitoringPanelProps {
  device: Device;
  onStartRemoteControl: () => void;
}

export function MonitoringPanel({ device, onStartRemoteControl }: MonitoringPanelProps) {
  // Sample data for the charts
  const cpuData = {
    labels: ['1min', '2min', '3min', '4min', '5min'],
    datasets: [
      {
        label: 'CPU Usage',
        data: [65, 70, 80, 75, 65],
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-4">
            {device.type === 'desktop' ? (
              <Laptop className="h-8 w-8 text-blue-600" />
            ) : (
              <Smartphone className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{device.name}</h2>
            <p className="text-sm text-gray-500">{device.os}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onStartRemoteControl}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Controle Remoto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-500">CPU</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{device.cpu_usage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${device.cpu_usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <MemoryIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">Memória</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{device.memory_usage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${device.memory_usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-500">Disco</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{device.disk_usage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${device.disk_usage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Network className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-500">Rede</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {(device.network_upload + device.network_download).toFixed(1)}MB/s
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Upload className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">{device.network_upload.toFixed(1)}MB/s</span>
            <Download className="h-4 w-4 text-blue-600 ml-2" />
            <span className="text-sm text-gray-600">{device.network_download.toFixed(1)}MB/s</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">CPU Usage Over Time</h3>
          <div className="h-64">
            <Line data={cpuData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos Ativos</h3>
          <div className="space-y-3">
            {device.processes.map((process, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-800">{process.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">CPU: {process.cpu_usage}%</span>
                  <span className="text-sm text-gray-600">
                    RAM: {(process.memory_usage / 1024 / 1024).toFixed(1)}MB
                  </span>
                  <button className="text-red-600 hover:text-red-700">
                    <StopCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}