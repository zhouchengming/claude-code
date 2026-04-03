import * as React from 'react'
import type { CommandResultDisplay } from '../../commands.js'
import { Pane } from '../../components/design-system/Pane.js'
import { Box, Text, useInput } from '../../ink.js'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { roll, companionUserId, getCompanion } from '../../buddy/companion.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'

type Props = {
  onDone: (
    result?: string,
    options?: { display?: CommandResultDisplay },
  ) => void
}

function titleCaseSpecies(species: string): string {
  return species.charAt(0).toUpperCase() + species.slice(1)
}

function BuddyPane({ onDone }: Props): React.ReactNode {
  const existing = getCompanion()

  useInput((_input, key) => {
    if (key.escape) {
      onDone(undefined, { display: 'skip' })
    }
    if (key.return && !existing) {
      const { bones } = roll(companionUserId())
      const name = titleCaseSpecies(String(bones.species))
      saveGlobalConfig(c => ({
        ...c,
        companion: {
          name,
          personality: `A friendly ${bones.species} who roots for you while you work.`,
          hatchedAt: Date.now(),
        },
      }))
      onDone(`Your companion ${name} has hatched.`, { display: 'system' })
    }
  })

  if (existing) {
    return (
      <Pane color="permission">
        <Box flexDirection="column" gap={1}>
          <Text bold>{existing.name}</Text>
          <Text dimColor>{existing.personality}</Text>
          <Text dimColor>Press Esc to close.</Text>
        </Box>
      </Pane>
    )
  }

  return (
    <Pane color="permission">
      <Box flexDirection="column" gap={1}>
        <Text bold>No companion yet</Text>
        <Text dimColor>
          Press Enter to hatch one (appearance is tied to your account id). Esc
          to cancel.
        </Text>
      </Box>
    </Pane>
  )
}

export const call: LocalJSXCommandCall = async (onDone, _context, _args) => {
  return <BuddyPane onDone={onDone} />
}
