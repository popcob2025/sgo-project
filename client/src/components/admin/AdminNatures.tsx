import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import './AdminPanel.css'; // Reutiliza o CSS do painel de admin

// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/incidents/entities/incident-nature.entity.ts]
interface IncidentNature {
  id: string;
  code: string;
  name: string;
  description: string;
}

// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/incidents/dto/create-incident-nature.dto.ts]
interface CreateNatureDto {
  code: string;
  name: string;
  description: string;
}

const API_URL = 'http://localhost:3000';

const initialFormState: CreateNatureDto = {
  code: '',
  name: '',
  description: '',
};

export const AdminNatures = () => {
  const [natures, setNatures] = useState<IncidentNature[]>([]);
  const [formState, setFormState] = useState<CreateNatureDto>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthStore.getState(); // Pega o token para a API

  // --- API Call: Buscar Naturezas ---
  const fetchNatures = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/incidents/natures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar naturezas.');
      const data: IncidentNature[] = await response.json();
      setNatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Busca inicial ao montar o componente
  useEffect(() => {
    fetchNatures();
  }, [fetchNatures]);

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // --- API Call: Criar Natureza ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formState.code || !formState.name) {
      setError('Código e Nome são obrigatórios.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/incidents/natures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao criar natureza.');
      }

      alert('Natureza criada com sucesso!');
      setFormState(initialFormState); // Limpa o formulário
      fetchNatures(); // Atualiza a lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="admin-panel-container">
      {/* Coluna da Lista */}
      <div className="admin-list-col">
        <h2>Gerenciador de Naturezas</h2>
        {isLoading && <p className="loading-text">Carregando...</p>}
        
        <table className="admin-list-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {natures.map((nature) => (
              <tr key={nature.id}>
                <td>{nature.code}</td>
                <td>{nature.name}</td>
                <td>{nature.description}</td>
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
        <h3>Nova Natureza</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Código</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formState.code}
              onChange={handleInputChange}
              placeholder="Ex: 101"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              placeholder="Ex: Acidente de Trânsito"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              placeholder="Ex: Colisão entre veículos..."
            />
          </div>
          <button type="submit" className="admin-submit-btn">
            Salvar Natureza
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
};