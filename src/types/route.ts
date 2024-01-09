export interface Message {
  role: 'user' | 'assistant';
  content: string;
  conversationId: number;
}
