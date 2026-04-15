class Anubis {
    constructor() {
        this.sync();
        setInterval(() => this.sync(), 60000);
        document.getElementById('refreshBtn')!.onclick = () => this.sync();
    }

    async sync() {
        const btn = document.getElementById('refreshBtn') as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'SYNCING...';

        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            
            (document.getElementById('led') as HTMLElement).className = data.online ? 'led online' : 'led offline';
            (document.getElementById('statusText') as HTMLElement).textContent = data.online ? '● ONLINE' : '✖ OFFLINE';
            (document.getElementById('playersOnline') as HTMLElement).textContent = data.players.online;
            (document.getElementById('playersMax') as HTMLElement).textContent = data.players.max;
            (document.getElementById('motd') as HTMLElement).textContent = data.motd.join(' ');
            
            const list = document.getElementById('playerList') as HTMLElement;
            list.innerHTML = data.players.list.length > 0 
                ? data.players.list.map((p: string) => `<span class="player-tag">${p}</span>`).join('')
                : '<span class="no-players">no players online</span>';

        } catch (err) {
            console.error('Offline');
        } finally {
            btn.disabled = false;
            btn.textContent = '▶ REFRESH STATUS';
        }
    }
}
new Anubis();
