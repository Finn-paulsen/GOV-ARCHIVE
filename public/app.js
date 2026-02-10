(() => {
  // Simple retro desktop behavior: login overlay -> desktop, icons open draggable windows, taskbar, start menu
  const loginForm = document.getElementById('login-form');
  const loginOverlay = document.getElementById('login-overlay');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const taskbarWindows = document.getElementById('taskbar-windows');
  const clockEl = document.getElementById('clock');
  const desktop = document.getElementById('desktop');

  let zCounter = 1000;

  function updateClock(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // if page was opened with ?auth=1 then mark authenticated immediately
  try{
    const params = new URLSearchParams(location.search);
    if(params.get('auth') === '1'){
      document.body.classList.add('authenticated');
      if(loginOverlay) loginOverlay.style.display = 'none';
    }
  }catch(e){}

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      if(!user){ alert('Bitte Benutzernamen eingeben.'); return; }
      document.body.classList.add('authenticated');
      // fade out login overlay then remove
      loginOverlay.style.transition = 'opacity 300ms';
      loginOverlay.style.opacity = 0;
      setTimeout(()=> loginOverlay.remove(), 350);
    });
  }

  startButton.addEventListener('click', ()=>{
    startMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (ev)=>{
    if(!startMenu.contains(ev.target) && ev.target !== startButton){
      startMenu.classList.add('hidden');
    }
  });

  // Icon double-click to open windows
  document.querySelectorAll('.icon').forEach(icon => {
    let last = 0;
    icon.addEventListener('click', ()=>{
      const now = Date.now();
      if(now - last < 350){
        openApp(icon.dataset.app);
      }
      last = now;
    });
  });

  function openApp(appId){
    const appTitle = ({
      'my-computer': 'Mein Rechner',
      'documents': 'Dokumente',
      'recycle': 'Papierkorb',
      'about': 'Über dieses System',
      'terminal': 'Terminal'
    })[appId] || appId;

    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = '120px';
    win.style.top = '80px';
    win.style.zIndex = ++zCounter;

    const tbBtn = document.createElement('button');
    tbBtn.className = 'tb-item';
    tbBtn.textContent = appTitle;
    taskbarWindows.appendChild(tbBtn);

    const titlebar = document.createElement('div');
    titlebar.className = 'titlebar';
    titlebar.innerHTML = `<div class="title">${appTitle}</div>`;

    const controls = document.createElement('div');
    controls.className = 'controls';
    const closeBtn = document.createElement('button'); closeBtn.textContent='X';
    const minBtn = document.createElement('button'); minBtn.textContent='_';
    controls.appendChild(minBtn); controls.appendChild(closeBtn);

    titlebar.appendChild(controls);

    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = getAppContent(appId);

    win.appendChild(titlebar);
    win.appendChild(content);
    document.body.appendChild(win);

    // z-index on focus
    win.addEventListener('mousedown', ()=> win.style.zIndex = ++zCounter);

    // close
    closeBtn.addEventListener('click', ()=>{
      win.remove();
      tbBtn.remove();
    });

    // taskbar toggle
    tbBtn.addEventListener('click', ()=>{
      if(win.style.display === 'none'){
        win.style.display = '';
        win.style.zIndex = ++zCounter;
      } else {
        win.style.display = 'none';
      }
    });

    // draggable
    makeDraggable(win, titlebar);
  }

  function getAppContent(appId){
    if(appId === 'my-computer'){
      return `<p>System: Retro Regierungsrechner Demo</p><p>Festplatten: 1 (C:)</p>`;
    }
    if(appId === 'documents'){
      return `<p>Keine Dokumente vorhanden.</p>`;
    }
    if(appId === 'recycle'){
      return `<p>Papierkorb ist leer.</p>`;
    }
    if(appId === 'about' || appId === 'about-system'){
      return `<h3>Retro Regierungsrechner</h3><p>Demo Oberfläche im Stil von Windows 98/XP.</p>`;
    }
    // Terminal-Fenster wird nicht mehr erzeugt
    return `<p>App: ${appId}</p>`;
  }

  function makeDraggable(winEl, handle){
    let dragging = false, startX=0, startY=0, origX=0, origY=0;
    handle.addEventListener('mousedown', (e)=>{
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      origX = parseInt(winEl.style.left || 0, 10);
      origY = parseInt(winEl.style.top || 0, 10);
      winEl.style.zIndex = ++zCounter;
      document.body.classList.add('dragging');
    });
    document.addEventListener('mousemove', (e)=>{
      if(!dragging) return;
      const dx = e.clientX - startX; const dy = e.clientY - startY;
      winEl.style.left = (origX + dx) + 'px';
      winEl.style.top = (origY + dy) + 'px';
    });
    document.addEventListener('mouseup', ()=>{
      dragging = false; document.body.classList.remove('dragging');
    });
  }

  // start menu actions
  startMenu.addEventListener('click', (e)=>{
    const action = e.target.dataset.action;
    if(!action) return;
    if(action === 'open-about') openApp('about');
    if(action === 'open-terminal') openApp('terminal');
    if(action === 'logout') location.reload();
  });

})();