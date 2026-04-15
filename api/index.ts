import { Elysia } from 'elysia'

const HOST = 'allows-surveys.gl.at.ply.gg:5659'
const JAVA_HOST = 'feedback-recorders.gl.joinmc.link'

const app = new Elysia({ prefix: '/api' })
    .get('/status', async () => {
        try {
            const [bedrock, java] = await Promise.all([
                fetch(`https://mcsrvstat.us{HOST}`).then(r => r.json()),
                fetch(`https://mcsrvstat.us{JAVA_HOST}`).then(r => r.json())
            ]);

            return {
                online: bedrock.online || java.online,
                players: {
                    online: bedrock.players?.online || java.players?.online || 0,
                    max: bedrock.players?.max || java.players?.max || 0,
                    list: java.players?.list?.map((p: any) => typeof p === 'string' ? p : p.name) || []
                },
                version: bedrock.version || "26.10",
                motd: bedrock.motd?.clean || java.motd?.clean || ["TheLarpBucket SMP"]
            };
        } catch (e) {
            return { online: false, error: 'API_TIMEOUT' };
        }
    });

export const GET = app.handle;
export const POST = app.handle;
