import api from "./api";

export interface InitiateUploadRequest {
  nome_arquivo: string;
  tamanho_bytes: number;
  content_type: string;
}

export interface InitiateUploadResponse {
  upload_url: string;
  s3_key: string;
}

export interface ConfirmUploadRequest {
  s3_key: string;
}

export interface ConfirmUploadResponse {
  foto_perfil_url: string;
  message: string;
}

const avatarService = {
  /**
   * Inicia o processo de upload de avatar
   */
  async initiateUpload(file: File): Promise<InitiateUploadResponse> {
    const request: InitiateUploadRequest = {
      nome_arquivo: file.name,
      tamanho_bytes: file.size,
      content_type: file.type,
    };

    const response = await api.post("/api/auth/avatar/initiate-upload", request);
    return response.data.data; // Acessa o campo 'data' dentro do JSON response
  },

  /**
   * Faz o upload do arquivo para o S3 usando a presigned URL
   */
  async uploadToS3(file: File, uploadUrl: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload para o S3: ${response.statusText}`);
    }
  },

  /**
   * Confirma o upload do avatar
   */
  async confirmUpload(s3Key: string): Promise<ConfirmUploadResponse> {
    const request: ConfirmUploadRequest = {
      s3_key: s3Key,
    };

    const response = await api.post("/api/auth/avatar/confirm-upload", request);
    return response.data.data; // Acessa o campo 'data' dentro do JSON response
  },

  /**
   * Remove a foto de perfil do usuário
   */
  async deleteAvatar(): Promise<void> {
    await api.delete("/api/auth/avatar");
  },

  /**
   * Processo completo de upload de avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    // Validar arquivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Arquivo muito grande. Tamanho máximo: 5MB");
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido. Use JPG, PNG ou WebP");
    }

    // Passo 1: Iniciar upload
    const { upload_url, s3_key } = await this.initiateUpload(file);

    // Passo 2: Upload para S3
    await this.uploadToS3(file, upload_url);

    // Passo 3: Confirmar upload
    const { foto_perfil_url } = await this.confirmUpload(s3_key);

    return foto_perfil_url;
  },
};

export default avatarService;
