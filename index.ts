import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

const JAVA_IP = 'feedback-recorders.gl.joinmc.link'
const BEDROCK_IP = 'allows-surveys.gl.at.ply.gg'
const BEDROCK_PORT = 5659

const app = new Elysia()
    // 1. เพิ่ม Route ตรงๆ ไว้ที่ Root ของ App เพื่อกันพลาด
    .get('/api/status', () => getStatus())
    .get('/status', () => getStatus()) // รองรับกรณี Vercel ตัด /api ออก
    .use(staticPlugin({
        assets: 'public',
        prefix: '/'
    }));

async function getStatus() {
    try {
        // ใช้ api.mcsrvstat.us/3/ จะเสถียรกว่ามากสำหรับ Vercel
        const res = await fetch(`https://api.mcsrvstat.us/3/${BEDROCK_IP}:${BEDROCK_PORT}`);
        const data = await res.json();
        
        if (!data.online) {
            const javaRes = await fetch(`https://api.mcsrvstat.us/3/${JAVA_IP}`);
            const javaData = await javaRes.json();
            if (javaData.online) return formatResponse(javaData);
        }
        return formatResponse(data);
    } catch (e) {
        return { online: false, error: "API Fetch Error" };
    }
}

function formatResponse(data: any) {
    return {
        online: data.online,
        players: {
            online: data.players?.online ?? 0,
            max: data.players?.max ?? 0,
            list: data.players?.list?.map((p: any) => typeof p === 'string' ? p : p.name) ?? []
        },
        version: data.version ?? "1.21.x",
        motd: data.motd?.clean ?? ["TheLarpBucket SMP"],
        hostname: data.hostname
    };
}

// ใช้ Export Default สำหรับ Bun Runtime บน Vercel
export default app;
