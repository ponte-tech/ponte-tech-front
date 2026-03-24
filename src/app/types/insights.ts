export interface InsightsFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  analystId?: string;
  boardId?: string;
}

export interface InsightsData {
  total_tasks: number;
  total_tasks_change?: number;
  completed_tasks: number;
  completed_tasks_change?: number;
  in_progress_tasks: number;
  completion_rate: number;
  completion_rate_change?: number;
  avg_time_to_complete: number;
  avg_tasks_per_analyst: number;
  tasks_created_this_week: number;
  tasks_completed_this_week: number;
}

export interface TasksByClient {
  client_id: string;
  client_name: string;
  created: number;
  completed: number;
  total: number;
}

export interface TasksByAnalyst {
  analyst_id: string;
  analyst_name: string;
  assigned: number;
  completed: number;
  in_progress: number;
  total: number;
  completion_rate: number;
}

export interface TasksByStatus {
  name: string;
  value: number;
  columnId: string;
}

export interface TimelineData {
  date: string;
  created: number;
  completed: number;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface AnalystOption {
  id: string;
  name: string;
  foto_perfil_url?: string;
}

export interface BoardOption {
  id: string;
  name: string;
}
