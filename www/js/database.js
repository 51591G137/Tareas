// database.js - GestiÃ³n de base de datos versión 5
const DB_VERSION = 5;

let db = loadDatabase();

function loadDatabase() {
    const stored = localStorage.getItem('eliteDB');
    let data;
    
    if(!stored) {
        data = { 
            version: DB_VERSION,
            users: [], 
            superpowers: [
                {
                    name: 'Responsabilidad',
                    powers: ['OrganizaciÃ³n', 'Puntualidad', 'Compromiso']
                },
                {
                    name: 'EmpatÃ­a',
                    powers: ['Amabilidad', 'Escucha activa', 'ComprensiÃ³n']
                },
                {
                    name: 'Autocontrol',
                    powers: ['Paciencia', 'GestiÃ³n emocional', 'ReflexiÃ³n']
                }
            ],
            missionTypes: [
                { id: 'special', name: 'Misiones Especiales', icon: 'â­' },
                { id: 'daily', name: 'Misiones Diarias', icon: 'ðŸŒ…' },
                { id: 'team', name: 'Misiones de Equipo', icon: 'ðŸ‘¥' },
                { id: 'challenge', name: 'DesafÃ­os', icon: 'ðŸŽ¯' }
            ],
            globalMissions: [],
            badges: []
        };
    } else {
        data = JSON.parse(stored);
        // Si hay versión antigua, simplemente actualizamos el número de versión
        // Asumimos que los backups ya tienen la estructura correcta
        data.version = DB_VERSION;
        
        // Asegurar estructuras básicas si faltan (por seguridad)
        if(!data.users) data.users = [];
        if(!data.superpowers) data.superpowers = [];
        if(!data.missionTypes) data.missionTypes = [];
        if(!data.globalMissions) data.globalMissions = [];
        if(!data.badges) data.badges = [];
        
        // Asegurar que cada usuario tenga powerScores si no los tiene
        data.users.forEach(user => {
            if(!user.powerScores) {
                user.powerScores = {};
                data.superpowers.forEach(sp => {
                    user.powerScores[sp.name] = {};
                    sp.powers.forEach(power => {
                        user.powerScores[sp.name][power] = 0;
                    });
                });
            }
            if(!user.missions) user.missions = [];
        });
    }
    
    return data;
}

function save() { 
    db.version = DB_VERSION;
    localStorage.setItem('eliteDB', JSON.stringify(db)); 
}

// Verificar misiones expiradas
function checkExpiredMissions() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    db.users.forEach(user => {
        if(!user.missions) return;
        
        user.missions.forEach(mission => {
            // Verificar fecha de finalizaciÃ³n
            if(mission.endDate && mission.endDate < todayStr && 
               mission.status !== 'Terminada' && mission.status !== 'Perdida') {
                mission.status = 'Perdida';
            }
            
            // Verificar si la misiÃ³n estÃ¡ en su rango horario (si tiene)
            if(mission.timeStart && mission.timeEnd) {
                const [startH, startM] = mission.timeStart.split(':').map(Number);
                const [endH, endM] = mission.timeEnd.split(':').map(Number);
                const startTime = startH * 60 + startM;
                const endTime = endH * 60 + endM;
                
                // Si estamos fuera del horario, marcar como no disponible temporalmente
                if(currentTime < startTime || currentTime > endTime) {
                    if(mission.status === 'En espera' || mission.status === 'En proceso') {
                        mission.temporarilyUnavailable = true;
                    }
                } else {
                    mission.temporarilyUnavailable = false;
                }
            }
        });
    });
    save();
}

// Verificar cada minuto
setInterval(checkExpiredMissions, 60000);
checkExpiredMissions();

// Hacer db global
window.db = db;
window.save = save;