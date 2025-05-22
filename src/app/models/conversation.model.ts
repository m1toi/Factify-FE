export interface Conversation {
  conversationId: number;
  user1Id: number;
  user1Username: string;
  user2Id: number;
  user2Username: string;
  createdAt: string;  // primim ISO date string
  // mai putem adăuga pe viitor: lastMessage, lastSentAt, avatarUrl etc.
}
