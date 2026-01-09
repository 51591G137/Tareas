// navigation.js - Funciones de navegación

function navTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'screen-settings') {
        showConfigTab('tab-users');
        renderSettings();
    }
    if(id === 'screen-home') renderHome();
}

function showConfigTab(tabId) {
    document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.config-tab-content').forEach(c => c.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
    
    if(tabId === 'tab-users') renderUsersTab();
    if(tabId === 'tab-tasks') renderTasksTab();
    if(tabId === 'tab-badges') renderBadgesTab();
}

function renderHome() {
    const list = document.getElementById('users-list-home');
    list.innerHTML = '';
    if(db.users.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999;">No hay usuarios. Crea uno en configuración.</p>';
    } else {
        db.users.forEach(u => {
            list.innerHTML += `<div class="user-item" onclick="login(${u.id})"><strong>${u.name}</strong><span>→</span></div>`;
        });
    }
}

function renderSettings() {
    renderUsersTab();
    renderTasksTab();
    renderBadgesTab();
}

function login(id) {
    currentUser = db.users.find(u => u.id === id);
    document.getElementById('screen-home').classList.remove('active');
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-title').innerText = `Tareas de ${currentUser.name}`;
    showView('view-tasks');
}

function logout() {
    document.getElementById('main-app').style.display = 'none';
    currentUser = null;
    navTo('screen-home');
}