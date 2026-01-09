// app.js - Archivo maestro que coordina todas las vistas

// Constantes globales compartidas
window.dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
window.dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
window.monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Inicialización de la app
function initApp() {
    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar variables globales
        window.currentUser = null;
        
        // Asegurarse de que la base de datos esté cargada
        if (typeof db === 'undefined') {
            console.error('La base de datos no se cargó correctamente');
            window.db = loadDatabase();
            window.save = function() { 
                db.version = 5;
                localStorage.setItem('eliteDB', JSON.stringify(db)); 
            };
        }
        
        // Renderizar la pantalla de inicio
        renderHome();
    });
}

// Función principal para mostrar vistas
function showView(viewId) {
    document.querySelectorAll('#main-app .screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active');
    
    const titles = {
        'view-missions': 'Radar de Misiones - ' + currentUser.name,
        'view-powers': 'Galería de Poderes - ' + currentUser.name,
        'view-achievements': 'Logros - ' + currentUser.name,
        'view-diary': 'Diario del Héroe - ' + currentUser.name
    };
    document.getElementById('user-title').innerText = titles[viewId] || currentUser.name;
    
    const btnIndex = ['view-missions', 'view-powers', 'view-achievements', 'view-diary'].indexOf(viewId);
    if(btnIndex >= 0) {
        document.querySelectorAll('.nav-btn')[btnIndex].classList.add('active');
    }

    // Delegar a las vistas específicas
    if(viewId === 'view-missions') renderMissionsView();
    if(viewId === 'view-powers') renderPowersTreeView();
    if(viewId === 'view-achievements') renderAchievementsView();
    if(viewId === 'view-diary') renderDiaryView();
}

// Inicializar la app
initApp();