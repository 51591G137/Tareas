// database.js - Gestión de base de datos versión 6
const DB_VERSION = 6;

let db = loadDatabase();

function loadDatabase() {
    const stored = localStorage.getItem('eliteDB');
    let data;
    
    if(!stored) {
        data = { 
            version: DB_VERSION,
            users: [], 
            superpowers: [
                { name: 'Justicia', powers: ['Contribución', 'Equipo'] },
                { name: 'Sabiduría', powers: ['Curiosidad', 'Aprendizaje'] },
                { name: 'Coraje', powers: ['Voluntad', 'Autonomía'] },
                { name: 'Humanidad', powers: ['Empatía', 'Afecto'] },
                { name: 'Templanza', powers: ['Autocontrol', 'Orden'] },
                { name: 'Trascendencia', powers: ['Gratitud', 'Optimismo'] }
            ],
            missionTypes: [
                { id: 'special', name: 'Misiones Especiales', icon: '⭐' },
                { id: 'daily', name: 'Misiones Diarias', icon: '🌅' },
                { id: 'team', name: 'Misiones de Equipo', icon: '👥' },
                { id: 'challenge', name: 'Desafíos', icon: '🎯' }
            ],
            globalMissions: [
                { id: 2001, groupId: 'preset_1', title: '🍽️ Poner la mesa para la cena', baseTitle: '🍽️ Poner la mesa para la cena', description: 'Ayuda a preparar la mesa antes de cenar', type: 'daily', scores: { 'Justicia': { 'Contribución': 10, 'Equipo': 5 }, 'Humanidad': { 'Empatía': 5, 'Afecto': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2002, groupId: 'preset_2', title: '🦷 Lavarse los dientes (mañana)', baseTitle: '🦷 Lavarse los dientes (mañana)', description: 'Cepillarse los dientes por la mañana', type: 'daily', scores: { 'Coraje': { 'Voluntad': 5, 'Autonomía': 5 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2003, groupId: 'preset_3', title: '🦷 Lavarse los dientes (tarde)', baseTitle: '🦷 Lavarse los dientes (tarde)', description: 'Cepillarse los dientes por la tarde', type: 'daily', scores: { 'Coraje': { 'Voluntad': 5, 'Autonomía': 5 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2004, groupId: 'preset_4', title: '🦷 Lavarse los dientes (noche)', baseTitle: '🦷 Lavarse los dientes (noche)', description: 'Cepillarse los dientes antes de dormir', type: 'daily', scores: { 'Coraje': { 'Voluntad': 5, 'Autonomía': 5 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2005, groupId: 'preset_5', title: '🍬 Lavarse los dientes tras comer dulce', baseTitle: '🍬 Lavarse los dientes tras comer dulce', description: 'Cepillarse después de comer golosinas', type: 'special', scores: { 'Templanza': { 'Autocontrol': 10, 'Orden': 5 }, 'Sabiduría': { 'Curiosidad': 5, 'Aprendizaje': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2006, groupId: 'preset_6', title: '🧩 Hacer un puzle', baseTitle: '🧩 Hacer un puzle', description: 'Completar un rompecabezas', type: 'challenge', scores: { 'Sabiduría': { 'Curiosidad': 10, 'Aprendizaje': 10 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2007, groupId: 'preset_7', title: '🚽 Hacer pis antes de acostarse', baseTitle: '🚽 Hacer pis antes de acostarse', description: 'Ir al baño antes de dormir', type: 'daily', scores: { 'Coraje': { 'Voluntad': 5, 'Autonomía': 10 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2008, groupId: 'preset_8', title: '👋 Decir buenos días / buenas noches', baseTitle: '👋 Decir buenos días / buenas noches', description: 'Saludar y despedirse con cariño', type: 'daily', scores: { 'Trascendencia': { 'Gratitud': 10, 'Optimismo': 5 }, 'Humanidad': { 'Empatía': 5, 'Afecto': 10 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2009, groupId: 'preset_9', title: '🎒 Preparar la mochila/ropa solo', baseTitle: '🎒 Preparar la mochila/ropa solo', description: 'Organizar tus cosas sin ayuda', type: 'daily', scores: { 'Coraje': { 'Voluntad': 10, 'Autonomía': 10 }, 'Justicia': { 'Contribución': 5, 'Equipo': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2010, groupId: 'preset_10', title: '🧸 Recoger los juguetes al terminar', baseTitle: '🧸 Recoger los juguetes al terminar', description: 'Ordenar después de jugar', type: 'daily', scores: { 'Templanza': { 'Autocontrol': 10, 'Orden': 10 }, 'Justicia': { 'Contribución': 5, 'Equipo': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2011, groupId: 'preset_11', title: '📖 Leer 15 minutos un libro', baseTitle: '📖 Leer 15 minutos un libro', description: 'Disfrutar de la lectura', type: 'daily', scores: { 'Sabiduría': { 'Curiosidad': 15, 'Aprendizaje': 10 }, 'Coraje': { 'Voluntad': 5, 'Autonomía': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2012, groupId: 'preset_12', title: '🥕 Ayudar a lavar la verdura/fruta', baseTitle: '🥕 Ayudar a lavar la verdura/fruta', description: 'Colaborar en la cocina', type: 'team', scores: { 'Justicia': { 'Contribución': 10, 'Equipo': 10 }, 'Sabiduría': { 'Curiosidad': 5, 'Aprendizaje': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2013, groupId: 'preset_13', title: '✏️ Hacer los deberes (Mates)', baseTitle: '✏️ Hacer los deberes (Mates)', description: 'Completar las tareas de matemáticas', type: 'daily', scores: { 'Sabiduría': { 'Curiosidad': 10, 'Aprendizaje': 15 }, 'Coraje': { 'Voluntad': 10, 'Autonomía': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2014, groupId: 'preset_14', title: '✏️ Hacer los deberes (Lengua)', baseTitle: '✏️ Hacer los deberes (Lengua)', description: 'Completar las tareas de lengua', type: 'daily', scores: { 'Sabiduría': { 'Curiosidad': 10, 'Aprendizaje': 15 }, 'Coraje': { 'Voluntad': 10, 'Autonomía': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2015, groupId: 'preset_15', title: '💧 Beber un vaso de agua al despertar', baseTitle: '💧 Beber un vaso de agua al despertar', description: 'Hidratarse al levantarse', type: 'daily', scores: { 'Coraje': { 'Voluntad': 5, 'Autonomía': 5 }, 'Templanza': { 'Autocontrol': 5, 'Orden': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2016, groupId: 'preset_16', title: '🍎 Probar un alimento nuevo', baseTitle: '🍎 Probar un alimento nuevo', description: 'Experimentar con nuevos sabores', type: 'challenge', scores: { 'Coraje': { 'Voluntad': 15, 'Autonomía': 10 }, 'Sabiduría': { 'Curiosidad': 10, 'Aprendizaje': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2017, groupId: 'preset_17', title: '👟 Dejar los zapatos en su sitio', baseTitle: '👟 Dejar los zapatos en su sitio', description: 'Guardar el calzado correctamente', type: 'daily', scores: { 'Templanza': { 'Autocontrol': 5, 'Orden': 10 }, 'Justicia': { 'Contribución': 5, 'Equipo': 5 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' },
                { id: 2018, groupId: 'preset_18', title: '🛏️ Hacer la cama', baseTitle: '🛏️ Hacer la cama', description: 'Arreglar tu cama cada mañana', type: 'daily', scores: { 'Justicia': { 'Contribución': 10, 'Equipo': 5 }, 'Coraje': { 'Voluntad': 5, 'Autonomía': 10 } }, selectMessage: '¡Excelente elección, héroe! 🦸', completeMessage: '¡Misión cumplida! Has ganado experiencia ✨' }
            ],
            badges: [
                { id: 1001, name: 'Guardián de la Cortesía', emoji: '🚪', requirementType: 'mission', missionRequirement: { missionTitle: 'Sujetar la puerta', times: 1 } },
                { id: 1002, name: 'Repartidor de Cariño', emoji: '🤗', requirementType: 'mission', missionRequirement: { missionTitle: 'Dar un abrazo espontáneo', times: 1 } },
                { id: 1003, name: 'Corazón Empático', emoji: '💝', requirementType: 'mission', missionRequirement: { missionTitle: 'Consolar a alguien triste', times: 1 } },
                { id: 1004, name: 'Generosidad de Oro', emoji: '🏆', requirementType: 'mission', missionRequirement: { missionTitle: 'Ceder el turno o un juguete', times: 1 } },
                { id: 1005, name: 'Héroe del Orden Común', emoji: '🦸', requirementType: 'mission', missionRequirement: { missionTitle: 'Recoger algo que no es suyo', times: 1 } },
                { id: 1006, name: 'Iniciativa Brillante', emoji: '💡', requirementType: 'mission', missionRequirement: { missionTitle: 'Ayudar sin que se lo pidan', times: 1 } },
                { id: 1007, name: 'Líder Justo', emoji: '⚖️', requirementType: 'mission', missionRequirement: { missionTitle: 'Explicar una regla de un juego', times: 1 } },
                { id: 1008, name: 'Valentía del Corazón', emoji: '❤️', requirementType: 'mission', missionRequirement: { missionTitle: 'Pedir perdón tras un error', times: 1 } },
                { id: 1009, name: 'Maestro de la Calma', emoji: '🧘', requirementType: 'mission', missionRequirement: { missionTitle: 'Esperar con paciencia', times: 1 } },
                { id: 1010, name: 'Respeto Silencioso', emoji: '🤫', requirementType: 'mission', missionRequirement: { missionTitle: 'Bajar el volumen si alguien descansa', times: 1 } },
                { id: 1011, name: 'Buscador de Verdades', emoji: '🔍', requirementType: 'mission', missionRequirement: { missionTitle: 'Hacer una pregunta profunda', times: 1 } },
                { id: 1012, name: 'Mente de Inventora', emoji: '🧠', requirementType: 'mission', missionRequirement: { missionTitle: 'Encontrar una solución creativa', times: 1 } },
                { id: 1013, name: 'Pequeño Mentor', emoji: '🎓', requirementType: 'mission', missionRequirement: { missionTitle: 'Enseñar algo a otra persona', times: 1 } },
                { id: 1014, name: 'Eco de Gratitud', emoji: '🙏', requirementType: 'mission', missionRequirement: { missionTitle: 'Dar las gracias por la comida', times: 1 } },
                { id: 1015, name: 'Amigo de la Naturaleza', emoji: '🌱', requirementType: 'mission', missionRequirement: { missionTitle: 'Cuidar una planta o animal', times: 1 } },
                { id: 1016, name: 'Rayo de Esperanza', emoji: '⚡', requirementType: 'mission', missionRequirement: { missionTitle: 'Decir algo positivo de un mal momento', times: 1 } },
                { id: 1017, name: 'Superador de Sombras', emoji: '🌟', requirementType: 'mission', missionRequirement: { missionTitle: 'Hacer algo que le daba miedo', times: 1 } },
                { id: 1018, name: 'Voz de la Honestidad', emoji: '🗣️', requirementType: 'mission', missionRequirement: { missionTitle: 'Decir la verdad aunque sea difícil', times: 1 } }
            ]
        };
    } else {
        data = JSON.parse(stored);
        
        // Migración a v6
        if(!data.version || data.version < 6) {
            if(!data.users) data.users = [];
            if(!data.superpowers) data.superpowers = [];
            if(!data.missionTypes) data.missionTypes = [];
            if(!data.globalMissions) data.globalMissions = [];
            if(!data.badges) data.badges = [];
            
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
                if(!user.completedMissionsLog) user.completedMissionsLog = [];
                if(!user.unlockedBadges) user.unlockedBadges = [];
            });
            
            data.version = 6;
        }
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
            if(mission.endDate && mission.endDate < todayStr && 
               mission.status !== 'Terminada' && mission.status !== 'Perdida') {
                mission.status = 'Perdida';
            }
            
            if(mission.timeStart && mission.timeEnd) {
                const [startH, startM] = mission.timeStart.split(':').map(Number);
                const [endH, endM] = mission.timeEnd.split(':').map(Number);
                const startTime = startH * 60 + startM;
                const endTime = endH * 60 + endM;
                
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

setInterval(checkExpiredMissions, 60000);
checkExpiredMissions();

window.db = db;
window.save = save;