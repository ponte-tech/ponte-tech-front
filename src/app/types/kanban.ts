// Kanban types
export interface Board {
  board_id: string;
  name: string;
  description?: string;
  is_default?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  column_id: string;
  board_id: string;
  name: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Observation {
  observation_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Card {
  card_id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  client_id?: string;
  identificador_demanda_cliente?: string;
  delivery_date?: string;
  assigned_to?: string[];
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  observations?: Observation[];
  history?: CardHistory[];
}

export interface CardHistory {
  history_id: string;
  changed_at: string;
  changed_by: string;
  field_changed: string;
  old_value?: string;
  new_value?: string;
}

// Request types
export interface CreateBoardRequest {
  name: string;
  description?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
}

export interface CreateColumnRequest {
  board_id: string;
  name: string;
  position: number;
}

export interface UpdateColumnRequest {
  name?: string;
  position?: number;
}

export interface CreateCardRequest {
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  client_id?: string;
  identificador_demanda_cliente?: string;
  delivery_date?: string;
  assigned_to?: string[];
  position: number;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  delivery_date?: string;
  identificador_demanda_cliente?: string;
  assigned_to?: string[];
}

export interface MoveCardRequest {
  column_id: string;
  position: number;
}

export interface AddObservationRequest {
  content: string;
}

// Response types
export interface ListBoardsResponse {
  boards: Board[];
}

export interface ListColumnsResponse {
  columns: Column[];
}

export interface ListCardsResponse {
  cards: Card[];
}
