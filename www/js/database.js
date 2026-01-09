// database.js - Gestión de base de datos
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
                    powers: ['Organización', 'Puntualidad', 'Compromiso']
                },
                {
                    name: 'Empatía',
                    powers: ['Amabilidad', 'Escucha activa', 'Comprensión']
                },
                {
                    name: 'Autocontrol',
                    powers: ['Paciencia', 'Gestión emocional', 'Reflexión']
                }
            ],
            missionTypes: [
                { id: 'special', name: 'Misiones Especiales', icon: '⭐' },
                { id: 'daily', name: 'Misiones Diarias', icon: '🌅' },
                { id: 'team', name: 'Misiones de Equipo', icon: '👥' },
                { id: 'challenge', name: 'Desafíos', icon: '🎯' }
            ],
            globalMissions: [],
            badges: []
        };
    } else {
        data = JSON.parse(stored);
        if(!data.version || data.version < DB_VERSION) {
            data = migrateDatabase(data);
        }
    }
    
    return data;
}

function migrateDatabase(oldData) {
    const currentVersion = oldData.version || 1;
    
    // Asegurar estructuras básicas
    if(!oldData.globalMissions) oldData.globalMissions = [];
    if(!oldData.users) oldData.users = [];
    if(!oldData.badges) oldData.badges = [];
    
    // Nueva estructura: Superpoderes y Poderes
    if(!oldData.superpowers) {
        // Migrar de categorías a superpoderes
        if(oldData.categories && oldData.categories.length > 0) {
            oldData.superpowers = oldData.categories.map(cat => ({
                name: cat,
                powers: ['Nivel 1', 'Nivel 2', 'Nivel 3']
            }));
        } else {
            oldData.superpowers = [
                { name: 'Responsabilidad', powers: ['Organización', 'Puntualidad', 'Compromiso'] },
                { name: 'Empatía', powers: ['Amabilidad', 'Escucha activa', 'Comprensión'] },
                { name: 'Autocontrol', powers: ['Paciencia', 'Gestión emocional', 'Reflexión'] }
            ];
        }
        delete oldData.categories;
    }
    
    // Nueva estructura: Tipos de misiones
    if(!oldData.missionTypes) {
        oldData.missionTypes = [
            { id: 'special', name: 'Misiones Especiales', icon: '⭐' },
            { id: 'daily', name: 'Misiones Diarias', icon: '🌅' },
            { id: 'team', name: 'Misiones de Equipo', icon: '👥' },
            { id: 'challenge', name: 'Desafíos', icon: '🎯' }
        ];
    }
    
    // Migrar tareas a misiones
    if(oldData.users) {
        oldData.users.forEach(user => {
            if(user.tasks && !user.missions) {
                user.missions = user.tasks.map(task => migratTaskToMission(task));
                delete user.tasks;
            }
            
            // Migrar customScores a powerScores
            if(user.customScores && !user.powerScores) {
                user.powerScores = {};
                oldData.superpowers.forEach(sp => {
                    user.powerScores[sp.name] = {};
                    sp.powers.forEach(p => {
                        user.powerScores[sp.name][p] = 0;
                    });
                });
                delete user.customScores;
            }
            
            // Asegurar estructura de powerScores
            if(!user.powerScores) {
                user.powerScores = {};
                oldData.superpowers.forEach(sp => {
                    user.powerScores[sp.name] = {};
                    sp.powers.forEach(p => {
                        user.powerScores[sp.name][p] = 0;
                    });
                });
            }
        });
    }
    
    // Migrar globalTasks a globalMissions
    if(oldData.globalTasks && !oldData.globalMissions) {
        oldData.globalMissions = oldData.globalTasks.map(task => migratTaskToMission(task));
        delete oldData.globalTasks;
    }
    
    oldData.version = DB_VERSION;
    localStorage.setItem('eliteDB', JSON.stringify(oldData));
    return oldData;
}

function migratTaskToMission(task) {
    return {
        id: task.id,
        groupId: task.groupId,
        title: task.title,
        baseTitle: task.baseTitle || task.title,
        description: task.description || '',
        type: task.isRepeat ? 'daily' : 'special',
        date: task.date,
        startDate: task.date,
        endDate: task.date,
        timeStart: null,
        timeEnd: null,
        status: task.status || 'En espera',
        scores: migratScores(task.scores || {}),
        isRepeat: task.isRepeat || false,
        repeatDays: task.repeatDays || [],
        userId: task.userId,
        selectMessage: '¡Excelente elección, héroe! 🦸',
        completeMessage: '¡Misión cumplida! Has ganado experiencia 🌟'
    };
}

function migratScores(oldScores) {
    // Los scores antiguos eran por categoría
    // Ahora necesitamos estructura: { superpoder: { poder: puntos } }
    const newScores = {};
    
    // Si no hay superpowers definidos todavía, usar estructura temporal
    if(!db || !db.superpowers) {
        return oldScores;
    }
    
    // Intentar mapear los scores antiguos a la nueva estructura
    for(let category in oldScores) {
        const superpower = db.superpowers.find(sp => sp.name === category);
        if(superpower) {
            newScores[category] = {};
            // Distribuir puntos entre los poderes
            const pointsPerPower = Math.floor(oldScores[category] / superpower.powers.length);
            superpower.powers.forEach(power => {
                newScores[category][power] = pointsPerPower;
            });
        }
    }
    
    return newScores;
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
            // Verificar fecha de finalización
            if(mission.endDate && mission.endDate < todayStr && 
               mission.status !== 'Terminada' && mission.status !== 'Perdida') {
                mission.status = 'Perdida';
            }
            
            // Verificar si la misión está en su rango horario (si tiene)
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