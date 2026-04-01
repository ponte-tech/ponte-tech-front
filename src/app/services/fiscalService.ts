import api from './api';
import type {
  NotaFiscal,
  NotaFiscalComColaborador,
  ListNotasFiscaisResponse,
  InitiateUploadRequest,
  InitiateUploadResponse,
  AtualizarStatusNotaRequest,
} from '../types/fiscal';
import type { ApiResponse } from '../types/api';

const BASE_URL_COLABORADOR = '/api/colaborador/fiscal';
const BASE_URL_ADMIN = '/api/admin/fiscal';

/**
 * Serviço de Notas Fiscais
 * Gerencia upload e acompanhamento de notas fiscais
 */

// Colaborador - Iniciar upload de nota fiscal
export const initiateUpload = async (request: InitiateUploadRequest): Promise<InitiateUploadResponse> => {
  const response = await api.post<ApiResponse<InitiateUploadResponse>>(
    `${BASE_URL_COLABORADOR}/notas-fiscais/upload/initiate`,
    request
  );
  return response.data.data!;
};

// Colaborador - Upload do arquivo PDF para S3 usando presigned URL
export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
};

// Colaborador - Listar notas fiscais
export const listNotasFiscais = async (): Promise<NotaFiscal[]> => {
  const response = await api.get<ApiResponse<NotaFiscal[]>>(
    `${BASE_URL_COLABORADOR}/notas-fiscais`
  );
  return response.data.data || [];
};

// Colaborador - Obter nota fiscal por ID
export const getNotaFiscal = async (id: string): Promise<NotaFiscal> => {
  const response = await api.get<ApiResponse<NotaFiscal>>(
    `${BASE_URL_COLABORADOR}/notas-fiscais/${id}`
  );
  return response.data.data!;
};

// Admin - Atualizar status de nota fiscal
export const atualizarStatusNota = async (
  id: string,
  request: AtualizarStatusNotaRequest
): Promise<NotaFiscal> => {
  const response = await api.put<ApiResponse<NotaFiscal>>(
    `${BASE_URL_ADMIN}/notas-fiscais/${id}/status`,
    request
  );
  return response.data.data!;
};

// Admin - Listar notas fiscais por colaborador e mês
export const listNotasFiscaisByColaborador = async (
  colaboradorId: string,
  mes?: string
): Promise<NotaFiscal[]> => {
  const params = new URLSearchParams();
  if (mes) params.append('ano_mes', mes);

  const response = await api.get<ApiResponse<NotaFiscal[]>>(
    `${BASE_URL_ADMIN}/colaboradores/${colaboradorId}/notas-fiscais?${params.toString()}`
  );
  return response.data.data || [];
};

// Admin - Marcar nota fiscal como paga
export const marcarNotaComoPaga = async (id: string): Promise<NotaFiscal> => {
  return atualizarStatusNota(id, { status: 'PAGA' });
};

// Admin - Listar todas as notas fiscais com paginação e filtros
export const listAllNotasFiscais = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  colaborador_id?: string;
  mes_referencia?: string;
}): Promise<ListNotasFiscaisResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.colaborador_id) queryParams.append('colaborador_id', params.colaborador_id);
  if (params?.mes_referencia) queryParams.append('mes_referencia', params.mes_referencia);

  const response = await api.get<ApiResponse<ListNotasFiscaisResponse>>(
    `${BASE_URL_ADMIN}/notas-fiscais?${queryParams.toString()}`
  );
  return response.data.data!;
};

// Admin - Download de nota fiscal
export const downloadNotaFiscal = async (id: string): Promise<Blob> => {
  // Get presigned URL from API
  const response = await api.get<ApiResponse<{ url: string; nome_arquivo: string; expires_in: number }>>(
    `${BASE_URL_ADMIN}/notas-fiscais/${id}/download`
  );

  const downloadUrl = response.data.data!.url;

  // Download file directly from S3 using presigned URL
  const fileResponse = await fetch(downloadUrl);
  if (!fileResponse.ok) {
    throw new Error('Failed to download file from S3');
  }

  return await fileResponse.blob();
};

const fiscalServiceExport = {
  initiateUpload,
  uploadFileToS3,
  listNotasFiscais,
  getNotaFiscal,
  atualizarStatusNota,
  listNotasFiscaisByColaborador,
  marcarNotaComoPaga,
  listAllNotasFiscais,
  downloadNotaFiscal,
};

export default fiscalServiceExport;
