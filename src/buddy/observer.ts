import type { Message } from '../types/message.js'
import { getGlobalConfig } from '../utils/config.js'
import { getContentText } from '../utils/messages.js'
import { getCompanion } from './companion.js'

/** Short reactions for the companion bubble after each assistant turn (no extra API call). */
const REACTIONS = [
  'Nice.',
  'Solid turn.',
  'Hmm, interesting.',
  'Keep going!',
  'Looking good.',
  'I like where this is headed.',
  'Sharp.',
  'One step at a time.',
]

function simpleHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function lastAssistantText(messages: Message[], maxChars: number): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]!
    if (m.type !== 'assistant') continue
    const t = getContentText(m.content)
    if (t?.trim()) {
      const trimmed = t.trim()
      return trimmed.length > maxChars ? trimmed.slice(0, maxChars) : trimmed
    }
  }
  return ''
}

/**
 * After an assistant reply completes, optionally sets a short companion reaction.
 * Skips when there is no hatched companion, companion is muted, or no assistant text.
 */
export async function fireCompanionObserver(
  messages: Message[],
  onReaction: (reaction: string) => void,
): Promise<void> {
  if (!getCompanion() || getGlobalConfig().companionMuted) return
  const snippet = lastAssistantText(messages, 2000)
  if (!snippet) return
  const idx =
    simpleHash(`${snippet}\0${messages.length}`) % REACTIONS.length
  onReaction(REACTIONS[idx]!)
}
