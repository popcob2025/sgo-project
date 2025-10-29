import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/auth.store'; // Importamos a store de auth
import './TriageForm.css';

// Copiado do backend para sabermos a prioridade
//
enum PriorityLevel {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  INFO = 'info',
}

// Tipo de resposta da API de análise
//
interface ScoredProtocol {
  protocolId: string;
  natureId: string;
  natureCode: string;
  natureName: string;
  score: number;
}

// Estado do formulário (baseado no CreateIncidentDto do backend)
//
interface FormState {
  callerName: string;
  callerPhone: string;
  address: string;
  addressNotes: string;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  protocolId: string | null;
}

const initialState: FormState = {
  callerName: '',
  callerPhone: '',
  address: '',
  addressNotes: '',
  // Mock: Em um app real, buscaríamos isso de um mapa (ex: Leaflet)
  latitude: -16.6869,
  longitude: -49.2648,
  priority: PriorityLevel.YELLOW,
  protocolId: null,
};

export const TriageForm = () => {
  // --- Estados do Componente ---
  const [narrative, setNarrative] = useState('');
  const [formState, setFormState] = useState<FormState>(initialState);
  const [suggestions, setSuggestions] = useState<ScoredProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pega o usuário e o token da store de autenticação
  const { user, token } = useAuthStore.getState();

  // --- Debounce ---
  // Aplica o hook useDebounce na narrativa (500ms de atraso)
  const debouncedNarrative = useDebounce(narrative, 500);

  // --- API Call: Analisar Narrativa (useEffect) ---
  const analyzeNarrative = useCallback(async () => {
    if (debouncedNarrative.length < 4) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:3000/incidents/triage/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Passo 2.6: Adicionar o Bearer Token
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ narrative: debouncedNarrative }),
        },
      );

      if (!response.ok) {
        throw new Error('Falha ao analisar a narrativa.');
      }
      
      const data: ScoredProtocol[] = await response.json();
      setSuggestions(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedNarrative, token]); // Depende da narrativa "atrasada" e do token

  // Dispara a análise quando a narrativa "atrasada" muda
  useEffect(() => {
    analyzeNarrative();
  }, [analyzeNarrative]);

  // --- Handlers ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectProtocol = (protocol: ScoredProtocol) => {
    setFormState((prev) => ({
      ...prev,
      protocolId: protocol.protocolId,
      // Opcional: Atualizar a prioridade padrão
      // priority: protocol.defaultPriority (precisaria adicionar ao DTO)
    }));
  };

  // --- API Call: Criar Ocorrência (onSubmit) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.protocolId) {
      alert('Por favor, selecione um protocolo sugerido.');
      return;
    }
    if (!user) {
      alert('Erro: Operador não identificado. Faça login novamente.');
      return;
    }

    setError(null);
    try {
      const payload = {
        ...formState,
        narrative, // Envia a narrativa completa
        operatorId: user.id, // Adiciona o ID do operador logado
      };

      const response = await fetch(
        'http://localhost:3000/incidents/triage/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Passo 2.6: Adicionar o Bearer Token
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao criar ocorrência.');
      }

      alert('Ocorrência criada com sucesso e enviada para a fila de despacho!');
      
      // Limpar o formulário
      setNarrative('');
      setFormState(initialState);
      setSuggestions([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      alert(`Erro ao criar ocorrência: ${error}`);
    }
  };

  const isFormInvalid = !formState.protocolId || !formState.callerName || !formState.address;

  return (
    <form className="triage-form-container" onSubmit={handleSubmit}>
      {/* Coluna 1: Narrativa e Sugestões */}
      <div className="triage-col">
        <h3>1. Narrativa da Ocorrência</h3>
        <div className="form-group">
          <label htmlFor="narrative">Descreva o que aconteceu:</label>
          <textarea
            id="narrative"
            name="narrative"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Ex: Acidente de carro, batida frontal, duas vítimas, uma presa nas ferragens..."
          />
        </div>

        <h3>2. Protocolos Sugeridos</h3>
        <div className="suggestions-box">
          {isLoading && <div className="loading-text">Analisando...</div>}
          {error && <div className="error-text">{error}</div>}
          {!isLoading && !error && suggestions.length === 0 && (
            <div className="loading-text">
              {debouncedNarrative.length > 3 ? 'Nenhum protocolo encontrado.' : 'Digite ao menos 4 caracteres...'}
            </div>
          )}
          <ul className="suggestions-list">
            {suggestions.map((proto) => (
              <li
                key={proto.protocolId}
                className={`suggestion-item ${
                  formState.protocolId === proto.protocolId ? 'selected' : ''
                }`}
                onClick={() => handleSelectProtocol(proto)}
              >
                <span className="suggestion-score">Score: {proto.score}</span>
                {proto.natureCode} - {proto.natureName}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Coluna 2: Dados do Solicitante e Ocorrência */}
      <div className="triage-col">
        <h3>3. Dados da Ocorrência</h3>

        <div className="form-group">
          <label htmlFor="callerName">Nome do Solicitante</label>
          <input
            type="text"
            id="callerName"
            name="callerName"
            value={formState.callerName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="callerPhone">Telefone</label>
          <input
            type="tel"
            id="callerPhone"
            name="callerPhone"
            value={formState.callerPhone}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Endereço</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formState.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="addressNotes">Ponto de Referência</label>
          <input
            type="text"
            id="addressNotes"
            name="addressNotes"
            value={formState.addressNotes}
            onChange={handleInputChange}
          />
        </div>
        
        {/* TODO: Integrar com API de Geocoding/Mapa */}
        {/* <div className="form-group">
          <label>Latitude: {formState.latitude}</label>
          <label>Longitude: {formState.longitude}</label>
        </div> */}

        <div className="form-group">
          <label htmlFor="priority">Prioridade</label>
          <select
            id="priority"
            name="priority"
            value={formState.priority}
            onChange={handleInputChange}
          >
            <option value={PriorityLevel.RED}>Vermelho (Emergência)</option>
            <option value={PriorityLevel.YELLOW}>Amarelo (Urgência)</option>
            <option value={PriorityLevel.GREEN}>Verde (Pouco Urgente)</option>
            <option value={PriorityLevel.INFO}>Informativo</option>
          </select>
        </div>

        <button type="submit" className="triage-submit-btn" disabled={isFormInvalid}>
          CRIAR OCORRÊNCIA
        </button>
      </div>
    </form>
  );
};