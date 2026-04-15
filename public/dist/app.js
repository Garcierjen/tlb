// public/app.ts
class ServerMonitor {
  constructor() {
    this.fetchStatus();
    setInterval(() => this.fetchStatus(), 60000);
    document.getElementById("refreshBtn").onclick = () => this.fetchStatus();
  }
  async fetchStatus() {
    const btn = document.getElementById("refreshBtn");
    const led = document.getElementById("led");
    const statusText = document.getElementById("statusText");
    btn.disabled = true;
    btn.textContent = "SYNCING...";
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (data.online) {
        led.className = "led online";
        statusText.textContent = "● ONLINE";
        statusText.className = "status-text online";
        document.getElementById("playersOnline").textContent = data.players.online;
        document.getElementById("playersMax").textContent = data.players.max;
        document.getElementById("motd").textContent = data.motd.join(" ");
        const list = document.getElementById("playerList");
        list.innerHTML = data.players.list.length > 0 ? data.players.list.map((p) => `<span class="player-tag">${p}</span>`).join("") : '<span class="no-players">no players online</span>';
      } else {
        this.setOffline();
      }
    } catch {
      this.setOffline();
    } finally {
      btn.disabled = false;
      btn.textContent = "▶ REFRESH STATUS";
    }
  }
  setOffline() {
    document.getElementById("led").className = "led offline";
    document.getElementById("statusText").textContent = "✖ OFFLINE";
    document.getElementById("statusText").className = "status-text offline";
    document.getElementById("playerList").innerHTML = '<span class="no-players">server unreachable</span>';
  }
}
new ServerMonitor;
