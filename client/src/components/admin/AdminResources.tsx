import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import './AdminPanel.css'; // Reutiliza o CSS do painel de admin

// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/resources/entities/resource.entity.ts]
interface Resource {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location: { type: string; coordinates: [number, number] };
}

// Enums do backend para o formulário
// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/common/enums/resource-type.enum.ts]
enum ResourceType {
  AMBULANCE = 'AMBULANCE',
  POLICE_CAR = 'POLICE_CAR',
  FIRE_TRUCK = 'FIRE_TRUCK',
}

// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/resources/dto/create-resource.dto.ts]
interface CreateResourceDto {
  code: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
}

const API_URL = 'http://localhost:3000';

const initialFormState: CreateResourceDto = {
  code: '',
  name: '',
  type: ResourceType.AMBULANCE,
  // Mock: Em um app real, buscaríamos isso de um mapa (ex: Leaflet)
  latitude: -16.68,
  longitude: -49.25,
};

export const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [formState, setFormState] = useState<CreateResourceDto>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthStore.getState(); // Pega o token para a API

  // --- API Call: Buscar Recursos ---
  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar recursos.');
      const data: Resource[] = await response.json();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Busca inicial ao montar o componente
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ 
      ...prev, 
      [name]: (name === 'latitude' || name === 'longitude') ? parseFloat(value) : value 
    }));
  };

  // --- API Call: Criar Recurso ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formState.code || !formState.name) {
      setError('Código e Nome são obrigatórios.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao criar recurso.');
      }

      alert('Recurso (Viatura) criado com sucesso!');
      setFormState(initialFormState); // Limpa o formulário
      fetchResources(); // Atualiza a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="admin-panel-container">
      {/* Coluna da Lista */}
      <div className="admin-list-col">
        <h2>Gerenciador de Recursos (Viaturas)</h2>
        {isLoading && <p className="loading-text">Carregando...</p>}
        
        <table className="admin-list-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Localização (Lat, Lng)</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res.id}>
                <td>{res.code}</td>
                <td>{res.name}</td>
                <td>{res.type}</td>
                <td>{res.status}</td>
                <td>{`${res.location.coordinates[1].toFixed(4)}, ${res.location.coordinates[0].toFixed(4)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && !isLoading && (
          <p className="error-text">{error}</p>
        )}
      </div>

      {/* Coluna do Formulário */}
      <div className="admin-form-col">
        <h3>Nova Viatura</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Código (Prefixo)</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formState.code}
              onChange={handleInputChange}
              placeholder="Ex: VTR-101, USA-05"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Nome (Descrição)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              placeholder="Ex: Ambulância Básica, Viatura Comando"
            />
          </div>
           <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={formState.type}
              onChange={handleInputChange}
            >
              <option value={ResourceType.AMBULANCE}>Ambulância</option>
              <option value={ResourceType.POLICE_CAR}>Viatura Policial</option>
              <option value={ResourceType.FIRE_TRUCK}>Caminhão Bombeiros</option>
            </select>
          </div>
          {/* Em um app real, usaríamos um mapa para selecionar */}
           <div className="form-group">
            <label htmlFor="latitude">Latitude (Mock)</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              step="any"
              value={formState.latitude}
              onChange={handleInputChange}
            />
          </div>
           <div className="form-group">
            <label htmlFor="longitude">Longitude (Mock)</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              step="any"
              value={formState.longitude}
              onChange={handleInputChange}
            />
          </div>
          
          <button type="submit" className="admin-submit-btn">
            Salvar Viatura
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
};