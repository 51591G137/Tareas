// navigation.js - Funciones de navegación

function navTo(view) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mostrar la pantalla solicitada
    if (view === 'screen-home') {
        document.getElementById('screen-home').classList.add('active');
        document.getElementById('main-app').style.display = 'none';
        renderHome();
    } else if (view === 'screen-settings') {
        document.getElementById('screen-settings').classList.add('active');
        renderSettings();
    } else if (view === 'main-app') {
        document.getElementById('main-app').style.display = 'block';
        showView('view-tasks');
    }
}

function showConfigTab(tabId) {
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.config-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Quitar active de todas las pestañas
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada y activarla
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[onclick="showConfigTab('${tabId}')"]`).classList.add('active');
    
    // Renderizar contenido específico de la pestaña
    if (tabId === 'tab-users') {
        renderUsersTab();
    } else if (tabId === 'tab-tasks') {
        renderTasksTab();
    } else if (tabId === 'tab-badges') {
        renderBadgesTab();
    }
}

function renderHome() {
    const container = document.getElementById('users-list-home');
    container.innerHTML = '';
    
    db.users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-card';
        userDiv.innerHTML = `
            <div style="font-size: 24px;">👤</div>
            <div style="font-weight: bold; margin-top: 5px;">${user.name}</div>
        `;
        userDiv.onclick = () => {
            currentUser = user;
            navTo('main-app');
        };
        container.appendChild(userDiv);
    });
}

function renderSettings() {
    // Inicializar todas las pestañas de configuración
    renderUsersTab();
    renderCategoriesList();
    renderGlobalTasks();
    renderBadgesList();
    loadUserScoresSelector();
}

function logout() {
    currentUser = null;
    navTo('screen-home');
}

// Hacer funciones globales
window.navTo = navTo;
window.showConfigTab = showConfigTab;
window.renderHome = renderHome;
window.renderSettings = renderSettings;
window.logout = logout;