import { Elysia } from 'elysia'

const JAVA_IP = 'feedback-recorders.gl.joinmc.link'
const BEDROCK_IP = 'allows-surveys.gl.at.ply.gg'
const BEDROCK_PORT = 5659

const app = new Elysia()
  .get('/api/status', async () => {
    try {
      const res = await fetch(
        `https://api.mcsrvstat.us/3/${BEDROCK_IP}:${BEDROCK_PORT}`
      )
      const data = await res.json()
      if (!data || data.online === false) {
        const javaRes = await fetch(
          `https://api.mcsrvstat.us/3/${JAVA_IP}`
        )
        const javaData = await javaRes.json()

        if (javaData.online) return formatResponse(javaData)
      }

      return formatResponse(data)
    } catch (e) {
      console.error(e)
      return { online: false, error: 'API Error' }
    }
  })

function formatResponse(data: any) {
  return {
    online: data.online,
    players: {
      online: data.players?.online ?? 0,
      max: data.players?.max ?? 0,
      list:
        data.players?.list?.map((p: any) =>
          typeof p === 'string' ? p : p.name
        ) ?? []
    },
    version: data.version ?? '1.21.x',
    motd: data.motd?.clean ?? ['TheLarpBucket SMP'],
    hostname: data.hostname
  }
}

export default {
  fetch: app.fetch
}