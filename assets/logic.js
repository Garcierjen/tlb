const HOST      = 'allows-surveys.gl.at.ply.gg:5659';
const JAVA_HOST = 'feedback-recorders.gl.joinmc.link';

const APIS = [
  `https://api.mcsrvstat.us/3/${HOST}`,
  `https://api.mcstatus.io/v2/status/bedrock/${HOST}`
];

let isFetching = false; 

function debounce(fn, delay = 1000) {
  let timer;
  return (...args) => {
    if (timer) return;
    fn(...args);
    timer = setTimeout(() => timer = null, delay);
  };
}

function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function queryAPI(url) {
  try {
    const res = await fetchWithTimeout(url, 5000);
    const data = await res.json();

    if (!data.online) return null;

    return {
      online: true,
      players: {
        online: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
        list: data.players?.list ?? []
      },
      version: {
        name: data.version?.name_clean ?? data.version?.name ?? '1.21.11 / 26.10'
      },
      motd: {
        clean: Array.isArray(data.motd?.clean)
          ? data.motd.clean
          : [data.motd?.clean ?? '']
      }
    };
  } catch {
    return null;
  }
}

async function fetchJavaPlayers() {
  try {
    const res = await fetchWithTimeout(
      `https://api.mcsrvstat.us/3/${JAVA_HOST}`,
      5000
    );
    const data = await res.json();

    if (data.online && data.players?.list?.length > 0) {
      return data.players.list;
    }
  } catch {}

  return [];
}

async function fetchStatus() {
  if (isFetching) return; 
  isFetching = true;

  const btn = document.getElementById('refreshBtn');
  const led = document.getElementById('led');
  const statusText = document.getElementById('statusText');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner">↻</span> PINGING...';
  statusText.className = 'status-text loading';
  statusText.textContent = 'CHECKING...';
  led.className = 'led';

  const unlock = setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '▶ REFRESH STATUS';
    isFetching = false;
  }, 7000);

  const t0 = Date.now();

  const results = await Promise.allSettled([
    queryAPI(APIS[0]),
    queryAPI(APIS[1]),
    fetchJavaPlayers()
  ]);

  clearTimeout(unlock);

  const r1 = results[0].status === 'fulfilled' ? results[0].value : null;
  const r2 = results[1].status === 'fulfilled' ? results[1].value : null;
  const javaPlayers = results[2].status === 'fulfilled' ? results[2].value : [];

  const data = r1 || r2;
  const ping = Date.now() - t0;

  if (data) {
    led.className = 'led online';
    statusText.className = 'status-text online';
    statusText.textContent = '● ONLINE';

    document.getElementById('playersOnline').textContent = data.players?.online ?? '0';
    document.getElementById('playersMax').textContent    = data.players?.max ?? '?';
    document.getElementById('version').textContent       = data.version?.name ?? '1.21.11 / 26.10';
    document.getElementById('ping').textContent          = ping + 'ms';
    document.getElementById('motd').textContent          =
      data.motd?.clean?.join(' ') || '(no message set)';

    const list = document.getElementById('playerList');
    const names = javaPlayers.length > 0
      ? javaPlayers
      : (data.players?.list ?? []);

    if (names.length > 0) {
      list.innerHTML = names.map(p =>
        `<span class="player-tag">${escHtml(p.name ?? p)}</span>`
      ).join('');
    } else {
      list.innerHTML = '<span class="no-players">no players online</span>';
    }

  } else {
    led.className = 'led offline';
    statusText.className = 'status-text offline';
    statusText.textContent = '✖ OFFLINE';
    reset();
  }

  document.getElementById('lastChecked').textContent =
    'last checked: ' + new Date().toLocaleTimeString();

  btn.disabled = false;
  btn.innerHTML = '▶ REFRESH STATUS';
  isFetching = false;
}

function reset() {
  document.getElementById('playersOnline').textContent = '—';
  document.getElementById('playersMax').textContent    = '—';
  document.getElementById('version').textContent       = '1.21.11 / 26.10';
  document.getElementById('ping').textContent          = '—';
  document.getElementById('motd').textContent          = '—';
  document.getElementById('playerList').innerHTML =
    '<span class="no-players">server unreachable</span>';
}

function copyAddress(addr, hintId) {
  const hint = document.getElementById(hintId);

  const done = () => {
    hint.textContent = '[ COPIED! ]';
    hint.className = 'copy-hint copied';
    setTimeout(() => {
      hint.textContent = '[ CLICK TO COPY ]';
      hint.className = 'copy-hint';
    }, 2000);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(addr).then(done);
  } else {
    const ta = document.createElement('textarea');
    ta.value = addr;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

const debouncedFetchStatus = debounce(fetchStatus, 1000);

fetchStatus();
setInterval(fetchStatus, 60000);