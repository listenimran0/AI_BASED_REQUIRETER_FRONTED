import type { ChatMessage } from '@/types';

// Live cards (a campaign, a reply) update themselves, so showing the same one in several
// messages just repeats it. Keep only the newest copy.
function cardKey(card: { type: string; ref: Record<string, unknown> }) {
  if (card.type === 'campaign') return `campaign:${card.ref.campaignId}`;
  if (card.type === 'replies' && card.ref.replyId) return `reply:${card.ref.replyId}`;
  return null;
}

export function dedupeCards(messages: ChatMessage[]): ChatMessage[] {
  const newest = new Map<string, string>();
  for (const m of messages)
    for (const c of m.cards) {
      const key = cardKey(c);
      if (key) newest.set(key, m.id);
    }
  return messages.map((m) => {
    const cards = m.cards.filter((c) => {
      const key = cardKey(c);
      return !key || newest.get(key) === m.id;
    });
    return cards.length === m.cards.length ? m : { ...m, cards };
  });
}
