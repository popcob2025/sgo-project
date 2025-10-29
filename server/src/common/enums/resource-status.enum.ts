export enum ResourceStatus {
  AVAILABLE = 'available', // Disponível (no quartel)
  EN_ROUTE = 'en_route', // Em deslocamento (para a ocorrência)
  ON_SCENE = 'on_scene', // No local da ocorrência
  RETURNING_BASE = 'returning', // Retornando ao quartel
  UNAVAILABLE = 'unavailable', // Indisponível (manutenção, fora de serviço)
}
