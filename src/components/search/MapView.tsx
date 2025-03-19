import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Profile } from '../../types/database';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  providers: Profile[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProvider: Profile | null;
  onProviderSelect: (provider: Profile) => void;
}

// Component to update map center when selectedProvider changes
function MapUpdater({ provider, userLocation }: { provider: Profile | null; userLocation: { latitude: number; longitude: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (provider?.latitude && provider?.longitude) {
      map.setView([provider.latitude, provider.longitude], 15);
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [provider, userLocation]);

  return null;
}

export function MapView({ providers, userLocation, selectedProvider, onProviderSelect }: MapViewProps) {
  if (!userLocation) return null;

  return (
    <div className="h-[500px] rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={defaultIcon}
        >
          <Popup>Sua localização</Popup>
        </Marker>

        {/* Provider markers */}
        {providers.map((provider) => {
          if (!provider.latitude || !provider.longitude) return null;
          
          return (
            <Marker
              key={provider.id}
              position={[provider.latitude, provider.longitude]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => onProviderSelect(provider)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{provider.full_name}</p>
                  {provider.service_type && (
                    <p className="text-gray-600">
                      {provider.service_type === 'technical' && 'Suporte Técnico'}
                      {provider.service_type === 'maintenance' && 'Manutenção'}
                      {provider.service_type === 'consulting' && 'Consultoria'}
                    </p>
                  )}
                  <p className="text-yellow-500">★ {provider.rating.toFixed(1)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapUpdater provider={selectedProvider} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}