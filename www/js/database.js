// database.js - Gestión de base de datos
const DB_VERSION = 4;

let db = loadDatabase();

function loadDatabase() {
    const stored = localStorage.getItem('eliteDB');
    let data;
    
    if(!stored) {
        data = { 
            version: DB_VERSION,
            users: [], 
            categories: ['Responsabilidad', 'Amabilidad', 'Respeto'],
            globalTasks: [],
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
    
    if(!oldData.globalTasks) oldData.globalTasks = [];
    if(!oldData.categories) oldData.categories = ['Responsabilidad', 'Amabilidad', 'Respeto'];
    if(!oldData.users) oldData.users = [];
    if(!oldData.badges) oldData.badges = [];
    
    // Migración v1 -> v2
    if(currentVersion < 2) {
        oldData.users.forEach(user => {
            if(user.tasks) {
                user.tasks.forEach(task => {
                    if(!task.groupId) task.groupId = 'legacy_' + task.id;
                    if(!task.baseTitle && task.title) task.baseTitle = task.title;
                });
            }
        });
    }
    
    // Migración v2 -> v3
    if(currentVersion < 3) {
        oldData.users.forEach(user => {
            if(!user.customScores) {
                user.customScores = {};
                oldData.categories.forEach(cat => {
                    user.customScores[cat] = 0;
                });
            }
        });
    }

    // Migración v3 -> v4
    if(currentVersion < 4) {
        oldData.badges.forEach(badge => {
            if(!badge.requirementType) {
                if(badge.category && badge.points) {
                    badge.requirementType = 'category';
                    badge.categoryRequirement = {
                        category: badge.category,
                        points: badge.points
                    };
                } else {
                    badge.requirementType = 'total';
                    badge.totalPoints = badge.points || 0;
                }
            }
        });
    }
    
    oldData.version = DB_VERSION;
    save();
    return oldData;
}

function save() { 
    db.version = DB_VERSION;
    localStorage.setItem('eliteDB', JSON.stringify(db)); 
}

// Verificar tareas expiradas
function checkExpiredTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    db.users.forEach(user => {
        user.tasks.forEach(task => {
            if(task.date && task.date < todayStr && task.status !== 'Terminada' && task.status !== 'Perdida') {
                task.status = 'Perdida';
            }
        });
    });
    save();
}

// Verificar cada minuto
setInterval(checkExpiredTasks, 60000);
checkExpiredTasks();
// Hacer db global
window.db = db;
window.save = save;