import React, { useState } from 'react';
import { IncidentQueueKanban } from './IncidentQueueKanban';
import { ResourceMap } from './ResourceMap';
import { useDispatchStore } from '../dispatch.store';
import './DispatchDashboard.css'; // (Criaremos este CSS)

export const DispatchDashboard = () => {
  // Pega a ação de despacho da store
  const assignResources = useDispatchStore((state) => state.assignResources);

  // Estado local para controlar a seleção
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const handleDispatch = () => {
    if (!selectedIncidentId || !selectedResourceId) {
      alert('Selecione uma ocorrência E uma viatura para despachar.');
      return;
    }

    // Chama a ação do Zustand, que chama a API
    assignResources(selectedIncidentId, [selectedResourceId]); // (Suporta múltiplas viaturas)

    // Limpa a seleção
    setSelectedIncidentId(null);
    setSelectedResourceId(null);
  };

  return (
    <div className="dispatch-dashboard">
      <div className="dashboard-column">
        <IncidentQueueKanban
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
        />
      </div>
      
      <div className="dashboard-column map-column">
        <ResourceMap
          selectedResourceId={selectedResourceId}
          onSelectResource={setSelectedResourceId}
        />
      </div>

      <div className="dispatch-controls">
        <h3>Controle de Despacho</h3>
        <p>Ocorrência: {selectedIncidentId || 'Nenhuma'}</p>
        <p>Viatura: {selectedResourceId || 'Nenhuma'}</p>
        <button
          onClick={handleDispatch}
          disabled={!selectedIncidentId || !selectedResourceId}
        >
          DESPACHAR VIATURA
        </button>
      </div>
    </div>
  );
};