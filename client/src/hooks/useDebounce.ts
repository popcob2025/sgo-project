import { useState, useEffect } from 'react';

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Isso é útil para evitar chamadas de API excessivas em campos de input.
 * @param value O valor a ser "atrasado" (ex: texto da narrativa)
 * @param delay O tempo de atraso em milissegundos (ex: 500)
 * @returns O valor após o atraso
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um temporizador (timeout) para atualizar o valor
    // somente após o 'delay' ter passado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza: se o 'value' mudar (usuário digitar de novo),
    // o temporizador anterior é cancelado e um novo é criado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-executa o efeito se o valor ou o delay mudarem

  return debouncedValue;
}