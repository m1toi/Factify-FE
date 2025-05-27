export interface Conversation {
  conversationId: number;
  user1Id: number;
  user1Username: string;
  user1ProfilePicture?: string; // e.g. "avatar2.png"
  user2Id: number;
  user2Username: string;
  user2ProfilePicture?: string; // e.g. "avatar2.png"
  createdAt: string;  // primim ISO date string
  lastMessage?: string;
  lastMessageSenderId?: number;
  lastMessageSentAt?: string;
}
