import React, { useState } from 'react';
import { Monitor, Bell, Settings, UserCircle } from 'lucide-react';
import { DeviceGrid } from '../devices/DeviceGrid';
import { ProfilePage } from '../profile/ProfilePage';
import { SessionManagement } from '../profile/SessionManagement';
import { QuantumControlPanel } from '../quantum/QuantumControlPanel';

export function Dashboard() {
  const [view, setView] = useState<'devices' | 'profile' | 'sessions' | 'quantum'>('devices');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Irmãos Farias</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView('devices')}
                className={`text-gray-600 hover:text-blue-600 ${view === 'devices' ? 'text-blue-600' : ''}`}
              >
                <Monitor className="h-6 w-6" />
              </button>
              <button 
                onClick={() => setView('quantum')}
                className={`text-gray-600 hover:text-blue-600 ${view === 'quantum' ? 'text-blue-600' : ''}`}
              >
                <Bell className="h-6 w-6" />
              </button>
              <button 
                onClick={() => setView('sessions')}
                className={`text-gray-600 hover:text-blue-600 ${view === 'sessions' ? 'text-blue-600' : ''}`}
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={() => setView('profile')}
                className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700"
              >
                <UserCircle className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {view === 'devices' && <DeviceGrid />}
        {view === 'profile' && <ProfilePage />}
        {view === 'sessions' && <SessionManagement />}
        {view === 'quantum' && <QuantumControlPanel />}
      </div>
    </div>
  );
}