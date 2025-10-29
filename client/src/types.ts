// Estes tipos devem espelhar as Entidades do Backend (NestJS)

export enum IncidentStatus {
  AWAITING_DISPATCH = 'awaiting_dispatch',
  DISPATCHED = 'dispatched',
  ON_SCENE = 'on_scene',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum ResourceStatus {
  AVAILABLE = 'available',
  EN_ROUTE = 'en_route',
  ON_SCENE = 'on_scene',
  RETURNING_BASE = 'returning',
  UNAVAILABLE = 'unavailable',
}

// Tipo simplificado da entidade Incident
export interface Incident {
  id: string;
  // ... outros campos (callerName, priority, etc.)
  status: IncidentStatus;
  // ...
  createdAt: string;
}

// Tipo simplificado da entidade Resource
export interface Resource {
  id: string;
  // ... outros campos (name, type, etc.)
  status: ResourceStatus;
  // ...
}