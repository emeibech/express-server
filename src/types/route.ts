export interface Message {
  role: 'user' | 'assistant';
  content: string;
  conversationId: number;
}

export interface Conversation {
  id: number;
  title: string;
  timestamp: string;
}

export interface GetPagedChunk {
  conversations: Conversation[];
  length: number;
  page: number;
}
