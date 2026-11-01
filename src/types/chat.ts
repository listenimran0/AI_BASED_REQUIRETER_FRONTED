export type CardRef = { type: string; ref: Record<string, any> };

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  cards: CardRef[];
  createdAt: string;
};

export type Conversation = { id: string; title: string; activeJobId?: string };
