import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/auth.store';
import './AdminPanel.css'; // Reutiliza o CSS do painel de admin

// [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/incidents/entities/incident-nature.entity.ts]
interface IncidentNature {
  id: string;
  code: string;
  name: string;
}

const API_URL = 'http://localhost:3000';

export const AdminProtocols = () => {
  // Estado para o formulário
  const [selectedNatureId, setSelectedNatureId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para carregar o dropdown
  const [natures, setNatures] = useState<IncidentNature[]>([]);
  
  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { token } = useAuthStore.getState();

  // --- API Call: Buscar Naturezas (para o dropdown) ---
  const fetchNatures = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/incidents/natures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar naturezas.');
      const data: IncidentNature[] = await response.json();
      setNatures(data);
      // Pré-seleciona o primeiro item
      if (data.length > 0) {
        setSelectedNatureId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Busca inicial
  useEffect(() => {
    fetchNatures();
  }, [fetchNatures]);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleNatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNatureId(e.target.value);
  };

  // --- API Call: Upload do Protocolo ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedFile || !selectedNatureId) {
      setError('Por favor, selecione uma natureza e um arquivo PDF.');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('O arquivo deve ser um PDF.');
      return;
    }

    setIsLoading(true);

    // [cite: popcob2025/sgo-project/sgo-project-ee65e652fa411834c901a64caebfa856df813c2e/server/src/protocols/protocols.controller.ts] (POST /protocols/upload)
    // Para upload de arquivos, usamos FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('natureId', selectedNatureId);

    try {
      const response = await fetch(`${API_URL}/protocols/upload`, {
        method: 'POST',
        headers: {
          // NÃO definimos 'Content-Type'. O browser o fará
          // automaticamente com o 'boundary' correto para FormData.
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao processar o PDF.');
      }

      const result = await response.json();
      setSuccessMessage(`Protocolo "${result.fileName}" carregado e associado! (ID: ${result.id})`);
      
      // Limpar o formulário
      setSelectedFile(null);
      // Resetar o input de arquivo (necessário para re-upload do mesmo arquivo)
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-panel-container">
      {/* Esta tela só tem o formulário, então usamos a classe 'standalone' */}
      <div className="admin-form-col admin-form-col-standalone">
        <h3>Upload de Protocolo (PDF)</h3>
        <p>
          Envie um arquivo PDF contendo o protocolo de atendimento.
          A IA analisará este documento e o usará para sugerir 
          protocolos na tela de Triagem.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="natureId">Associar à Natureza:</label>
            <select
              id="natureId"
              name="natureId"
              value={selectedNatureId}
              onChange={handleNatureChange}
              disabled={isLoading}
            >
              {natures.length === 0 && <option>Carregando naturezas...</option>}
              {natures.map((nature) => (
                <option key={nature.id} value={nature.id}>
                  {nature.code} - {nature.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="file-input">Arquivo (PDF)</label>
            <input
              type="file"
              id="file-input"
              name="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="admin-submit-btn" disabled={isLoading}>
            {isLoading ? 'Processando PDF...' : 'Enviar Protocolo'}
          </button>
          
          {error && <p className="error-text">{error}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};