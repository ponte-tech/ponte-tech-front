import api from "./api";

export interface WikiTopic {
  topic_id: string;
  name: string;
  description?: string;
  icon?: string;
  position: number;
  page_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WikiPage {
  page_id: string;
  topic_id: string;
  title: string;
  content: string;
  slug: string;
  position: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface WikiPageSummary {
  page_id: string;
  topic_id: string;
  title: string;
  slug: string;
  position: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicRequest {
  name: string;
  description?: string;
  icon?: string;
  position?: number;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  icon?: string;
  position?: number;
}

export interface CreatePageRequest {
  topic_id: string;
  title: string;
  content?: string;
  slug?: string;
  position?: number;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
  slug?: string;
  position?: number;
}

class WikiService {
  private baseUrl = "/api/wiki";

  // --- Topics ---

  async listTopics(): Promise<WikiTopic[]> {
    const response = await api.get(`${this.baseUrl}/topics`);
    if (response.data?.success && response.data?.data) {
      return response.data.data.topics || [];
    }
    return response.data?.topics || [];
  }

  async getTopic(topicId: string): Promise<WikiTopic> {
    const response = await api.get(`${this.baseUrl}/topics/${topicId}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async createTopic(data: CreateTopicRequest): Promise<WikiTopic> {
    const response = await api.post(`${this.baseUrl}/topics`, data);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async updateTopic(topicId: string, data: UpdateTopicRequest): Promise<WikiTopic> {
    const response = await api.put(`${this.baseUrl}/topics/${topicId}`, data);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async deleteTopic(topicId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/topics/${topicId}`);
  }

  // --- Pages ---

  async listPages(topicId: string): Promise<WikiPageSummary[]> {
    const response = await api.get(`${this.baseUrl}/topics/${topicId}/pages`);
    if (response.data?.success && response.data?.data) {
      return response.data.data.pages || [];
    }
    return response.data?.pages || [];
  }

  async getPage(pageId: string): Promise<WikiPage> {
    const response = await api.get(`${this.baseUrl}/pages/${pageId}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async createPage(data: CreatePageRequest): Promise<WikiPage> {
    const response = await api.post(`${this.baseUrl}/pages`, data);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async updatePage(pageId: string, data: UpdatePageRequest): Promise<WikiPage> {
    const response = await api.put(`${this.baseUrl}/pages/${pageId}`, data);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  }

  async deletePage(pageId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/pages/${pageId}`);
  }

  // --- Image Upload ---

  async uploadImage(file: File): Promise<string> {
    // 1. Get presigned URL
    const initiateResponse = await api.post(`${this.baseUrl}/images/upload/initiate`, {
      nome_arquivo: file.name,
      content_type: file.type,
      tamanho_bytes: file.size,
    });

    const { upload_url, image_url } = initiateResponse.data?.data || initiateResponse.data;

    // 2. Upload directly to S3
    await fetch(upload_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return image_url;
  }
}

const wikiService = new WikiService();
export default wikiService;
