class ServerMonitor {
    constructor() {
        this.fetchStatus();
        setInterval(() => this.fetchStatus(), 60000);

        document.getElementById('refreshBtn')!.onclick = () => this.fetchStatus();

        this.initCopyHandlers();
    }

    async fetchStatus() {
        const btn = document.getElementById('refreshBtn') as HTMLButtonElement;
        const led = document.getElementById('led') as HTMLElement;
        const statusText = document.getElementById('statusText') as HTMLElement;

        btn.disabled = true;
        btn.textContent = 'SYNCING...';

        try {
            const res = await fetch('/api/status');
            const data = await res.json();

            if (data.online) {
                led.className = 'led online';
                statusText.textContent = '● ONLINE';
                statusText.className = 'status-text online';
                
                (document.getElementById('playersOnline') as HTMLElement).textContent = data.players.online;
                (document.getElementById('playersMax') as HTMLElement).textContent = data.players.max;
                (document.getElementById('motd') as HTMLElement).textContent = data.motd.join(' ');
                
                const list = document.getElementById('playerList') as HTMLElement;
                list.innerHTML = data.players.list.length > 0 
                    ? data.players.list.map((p: string) => `<span class="player-tag">${p}</span>`).join('')
                    : '<span class="no-players">no players online</span>';
            } else {
                this.setOffline();
            }
        } catch {
            this.setOffline();
        } finally {
            btn.disabled = false;
            btn.textContent = '▶ REFRESH STATUS';
        }
    }

    private setOffline() {
        (document.getElementById('led') as HTMLElement).className = 'led offline';
        (document.getElementById('statusText') as HTMLElement).textContent = '✖ OFFLINE';
        (document.getElementById('statusText') as HTMLElement).className = 'status-text offline';
        (document.getElementById('playerList') as HTMLElement).innerHTML = '<span class="no-players">server unreachable</span>';
    }

    private initCopyHandlers() {
        const rows = document.querySelectorAll<HTMLElement>('.address-row');

        rows.forEach(row => {
            row.addEventListener('click', async () => {
                const address = row.getAttribute('data-address');
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

                    const hint = row.querySelector('.copy-hint') as HTMLElement | null;
                    if (hint) {
                        const original = hint.textContent;
                        hint.textContent = '[ COPIED! ]';

                        setTimeout(() => {
                            hint.textContent = original!;
                        }, 1500);
                    }

                } catch {
                    alert('Failed to copy address');
                }
            });
        });
    }
}

new ServerMonitor();