import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDispatchStore } from 'store/dispatch.store';


interface Props {
  selectedResourceId: string | null;
  onSelectResource: (id: string) => void;
}

// Posição inicial do mapa (ex: Centro de Goiânia)
const DEFAULT_CENTER: [number, number] = [-16.68, -49.25]; 

export const ResourceMap: React.FC<Props> = ({
  selectedResourceId,
  onSelectResource,
}) => {
  // Lê as viaturas e ocorrências do estado global
  const resources = useDispatchStore((state) => state.availableResources);

  return (
    <div className="map-container">
      <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* TODO: Marcadores para Ocorrências (incidents) */}
        
        {/* Marcadores para Viaturas (resources) */}
        {resources.map((resource) => (
          <Marker
            key={resource.id}
            // TODO: Usar a 'currentLocation' (PostGIS) da viatura
            position={DEFAULT_CENTER} 
            eventHandlers={{
              click: () => onSelectResource(resource.id),
            }}
          >
            <Popup>
              <strong>Viatura: {resource.id}</strong> <br />
              Status: {resource.status} <br />
              {resource.id === selectedResourceId && <strong>SELECIONADA</strong>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};