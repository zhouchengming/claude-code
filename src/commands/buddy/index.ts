import type { Command } from '../../commands.js'

const buddy = {
  type: 'local-jsx',
  name: 'buddy',
  description: 'Hatch or view your terminal companion',
  immediate: true,
  load: () => import('./buddy.js'),
} satisfies Command

export default buddy
