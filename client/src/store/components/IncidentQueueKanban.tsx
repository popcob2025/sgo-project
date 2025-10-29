import React from 'react';
import { useDispatchStore } from 'store/dispatch.store';


interface Props {
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

export const IncidentQueueKanban: React.FC<Props> = ({
  selectedIncidentId,
  onSelectIncident,
}) => {
  // Lê a fila de ocorrências diretamente do estado global (Zustand)
  const queue = useDispatchStore((state) => state.incidentQueue);

  return (
    <div className="kanban-container">
      <h3>Fila de Despacho ({queue.length})</h3>
      {queue.length === 0 ? (
        <p>Nenhuma ocorrência aguardando.</p>
      ) : (
        <ul className="incident-list">
          {queue.map((incident) => (
            <li
              key={incident.id}
              className={`incident-card ${
                incident.id === selectedIncidentId ? 'selected' : ''
              }`}
              onClick={() => onSelectIncident(incident.id)}
            >
              <strong>Ocorrência #{incident.id.substring(0, 5)}...</strong>
              <p>Status: {incident.status}</p>
              <small>{new Date(incident.createdAt).toLocaleTimeString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};