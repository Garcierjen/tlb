class ServerMonitor {
    constructor() {
        this.init();
    }

    private init() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fetchStatus());
        }
        this.initCopyHandlers();
        this.fetchStatus();
        setInterval(() => this.fetchStatus(), 60000);
    }

    async fetchStatus() {
        const btn = document.getElementById('refreshBtn') as HTMLButtonElement | null;
        const led = document.getElementById('led');
        const statusText = document.getElementById('statusText');

        if (!btn || !led || !statusText) return;

        btn.disabled = true;
        btn.textContent = 'SYNCING...';

        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            if (data.online) {
                led.className = 'led online';
                statusText.textContent = '● ONLINE';
                statusText.className = 'status-text online';

                const playersOnline = document.getElementById('playersOnline');
                const playersMax = document.getElementById('playersMax');
                const motd = document.getElementById('motd');
                const list = document.getElementById('playerList');

                if (playersOnline) playersOnline.textContent = String(data.players.online);
                if (playersMax) playersMax.textContent = String(data.players.max);
                if (motd) motd.textContent = data.motd.join(' ');

                if (list) {
                    list.innerHTML = data.players.list.length > 0
                        ? data.players.list.map((p: string) =>
                            `<span class="player-tag">${this.escHtml(p)}</span>`
                          ).join('')
                        : '<span class="no-players">no players online</span>';
                }
            } else {
                this.setOffline();
            }
        } catch (err) {
            console.error('Fetch failed:', err);
            this.setOffline();
        } finally {
            btn.disabled = false;
            btn.textContent = '▶ REFRESH STATUS';
        }
    }

    private setOffline() {
        const led = document.getElementById('led');
        const statusText = document.getElementById('statusText');
        const list = document.getElementById('playerList');

        if (led) led.className = 'led offline';

        if (statusText) {
            statusText.textContent = '✖ OFFLINE';
            statusText.className = 'status-text offline';
        }

        if (list) {
            list.innerHTML = '<span class="no-players">server unreachable</span>';
        }
    }

    private initCopyHandlers() {
        document.addEventListener('click', async (e) => {
            const target = (e.target as HTMLElement).closest('.ipcopy') as HTMLElement | null;
            if (!target) return;

            const address = target.getAttribute('data-address');
            if (!address) return;

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(address);
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = address;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                const hint = target.querySelector('.copy-hint') as HTMLElement | null;
                if (hint) {
                    const original = hint.textContent;
                    hint.textContent = '[ COPIED! ]';

                    setTimeout(() => {
                        hint.textContent = original || '[ CLICK TO COPY ]';
                    }, 1500);
                }

            } catch (err) {
                console.error('Copy failed:', err);
                alert('Failed to copy address');
            }
        });
    }

    private escHtml(s: string) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new ServerMonitor();
});