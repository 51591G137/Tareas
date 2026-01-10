// navigation.js - Funciones de navegación

function navTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'screen-settings') {
        showConfigTab('tab-heroes');
        renderSettings();
    }
    if(id === 'screen-home') renderHome();
}

function showConfigTab(tabId) {
    document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.config-tab-content').forEach(c => c.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
    
    if(tabId === 'tab-heroes') renderUsersTab();
    if(tabId === 'tab-missions') renderMissionsTab();
    if(tabId === 'tab-powers') renderSuperpowersTab();
    if(tabId === 'tab-badges') renderBadgesTab();
}

function renderHome() {
    const list = document.getElementById('users-list-home');
    list.innerHTML = '';
    if(db.users.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999;">No hay héroes. Crea uno en configuración.</p>';
    } else {
        db.users.forEach(u => {
            list.innerHTML += `<div class="user-item" onclick="login(${u.id})"><strong>🦸 ${u.name}</strong><span>→</span></div>`;
        });
    }
}

function renderSettings() {
    renderUsersTab();
    renderMissionsTab();
    renderSuperpowersTab();
    renderBadgesTab();
}

function login(id) {
    currentUser = db.users.find(u => u.id === id);
    
    // Asegurar que el usuario tenga la estructura correcta
    if(!currentUser.missions) currentUser.missions = [];
    if(!currentUser.powerScores) {
        currentUser.powerScores = {};
        db.superpowers.forEach(sp => {
            currentUser.powerScores[sp.name] = {};
            sp.powers.forEach(power => {
                currentUser.powerScores[sp.name][power] = 0;
            });
        });
    }
    
    document.getElementById('screen-home').classList.remove('active');
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-title').innerText = `Misiones de ${currentUser.name}`;
    showView('view-missions');
}

function logout() {
    document.getElementById('main-app').style.display = 'none';
    currentUser = null;
    navTo('screen-home');
}

// --- Funciones para secciones expandibles ---

function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const toggle = document.getElementById(sectionId + '-toggle');
    
    content.classList.toggle('expanded');
    
    if (content.classList.contains('expanded')) {
        toggle.textContent = '▲';
    } else {
        toggle.textContent = '▼';
    }
    
    // Forzar reflow para asegurar la animación
    content.style.maxHeight = content.classList.contains('expanded') ? content.scrollHeight + 'px' : '0';
}

// Inicialización de secciones expandibles
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar secciones expandibles
    setTimeout(() => {
        const missionTypesSection = document.getElementById('mission-types-section');
        const createMissionSection = document.getElementById('create-mission-section');
        
        if (missionTypesSection) {
            missionTypesSection.classList.add('expanded');
            const toggle = document.getElementById('mission-types-toggle');
            if (toggle) toggle.textContent = '▲';
        }
        
        if (createMissionSection) {
            createMissionSection.classList.add('expanded');
            const toggle = document.getElementById('create-mission-toggle');
            if (toggle) toggle.textContent = '▲';
        }
    }, 100);
});