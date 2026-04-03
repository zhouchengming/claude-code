/**
 * Optional presets for 火山方舟 / 豆包（Anthropic Messages 兼容接入点）.
 *
 * 仅当 CLAUDE_CODE_USE_DOUBAO 为真时生效，且只填充「尚未设置」的变量，
 * 不与 Bedrock / Vertex / Foundry 并存时混用。
 *
 * 官方说明见：https://www.volcengine.com/docs/82379/1928262
 */
import { isEnvTruthy } from '../envUtils.js'

/** 北京地域默认推理网关（与方舟 OpenAI/兼容层文档一致，可按控制台实际地域调整） */
export const DOUBAO_ARK_DEFAULT_BASE_URL =
  'https://ark.cn-beijing.volces.com/api/v3'

function isOtherCloudProviderActive(): boolean {
  return (
    isEnvTruthy(process.env.CLAUDE_CODE_USE_BEDROCK) ||
    isEnvTruthy(process.env.CLAUDE_CODE_USE_VERTEX) ||
    isEnvTruthy(process.env.CLAUDE_CODE_USE_FOUNDRY)
  )
}

function hasAnthropicCredential(): boolean {
  const k = (v: string | undefined) => (v !== undefined && v.trim() !== '')
  return (
    k(process.env.ANTHROPIC_API_KEY) ||
    k(process.env.ANTHROPIC_AUTH_TOKEN) ||
    k(process.env.CLAUDE_CODE_OAUTH_TOKEN)
  )
}

function firstDoubaoApiKey(): string | undefined {
  const candidates = [
    process.env.DOUBAO_API_KEY,
    process.env.ARK_API_KEY,
    process.env.VOLCENGINE_API_KEY,
  ]
  for (const c of candidates) {
    if (c !== undefined && c.trim() !== '') {
      return c.trim()
    }
  }
  return undefined
}

/**
 * 在进程启动早期调用：根据 CLAUDE_CODE_USE_DOUBAO 写入默认 ANTHROPIC_*，
 * 便于与现有 Anthropic SDK 路径无缝衔接。
 */
export function applyDoubaoArkEnvDefaults(): void {
  if (!isEnvTruthy(process.env.CLAUDE_CODE_USE_DOUBAO)) {
    return
  }
  if (isOtherCloudProviderActive()) {
    return
  }

  if (!process.env.ANTHROPIC_BASE_URL?.trim()) {
    const override = process.env.DOUBAO_ARK_BASE_URL?.trim()
    process.env.ANTHROPIC_BASE_URL =
      override && override.length > 0 ? override : DOUBAO_ARK_DEFAULT_BASE_URL
  }

  if (!hasAnthropicCredential()) {
    const key = firstDoubaoApiKey()
    if (key) {
      process.env.ANTHROPIC_AUTH_TOKEN = key
    }
  }
}
