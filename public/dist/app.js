// public/app.ts
class Anubis {
  constructor() {
    this.sync();
    setInterval(() => this.sync(), 60000);
    document.getElementById("refreshBtn").onclick = () => this.sync();
  }
  async sync() {
    const btn = document.getElementById("refreshBtn");
    btn.disabled = true;
    btn.textContent = "SYNCING...";
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      document.getElementById("led").className = data.online ? "led online" : "led offline";
      document.getElementById("statusText").textContent = data.online ? "● ONLINE" : "✖ OFFLINE";
      document.getElementById("playersOnline").textContent = data.players.online;
      document.getElementById("playersMax").textContent = data.players.max;
      document.getElementById("motd").textContent = data.motd.join(" ");
      const list = document.getElementById("playerList");
      list.innerHTML = data.players.list.length > 0 ? data.players.list.map((p) => `<span class="player-tag">${p}</span>`).join("") : '<span class="no-players">no players online</span>';
    } catch (err) {
      console.error("Offline");
    } finally {
      btn.disabled = false;
      btn.textContent = "▶ REFRESH STATUS";
    }
  }
}
new Anubis;
