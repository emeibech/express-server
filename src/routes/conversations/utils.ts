import type { GetPagedChunk } from '@/types/route.js';

export function getPagedChunk({ conversations, page, length }: GetPagedChunk) {
  const chunk = conversations.filter((_item, index) => {
    const max = length * page;
    return index < max && index >= max - length;
  });

  return chunk;
}
