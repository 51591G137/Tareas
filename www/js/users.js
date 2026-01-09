// users.js - Gestión de usuarios (héroes) y puntuaciones

function createUser() {
    const name = document.getElementById('new-user-name').value.trim();
    if(!name) return alert('Escribe un nombre');
    if(db.users.some(u => u.name === name)) return alert('Ya existe un héroe con ese nombre');
    
    const newUser = {
        id: Date.now(),
        name: name,
        missions: [],
        powerScores: {}
    };
    
    // Inicializar puntuaciones de poderes
    db.superpowers.forEach(sp => {
        newUser.powerScores[sp.name] = {};
        sp.powers.forEach(power => {
            newUser.powerScores[sp.name][power] = 0;
        });
    });
    
    db.users.push(newUser);
    save();
    document.getElementById('new-user-name').value = '';
    renderUsersTab();
    renderHome();
}

function updateUserName(id, name) {
    const u = db.users.find(u => u.id === id);
    if(u && name.trim()) {
        u.name = name.trim();
        save();
    }
}

function deleteUser(id) {
    if(!confirm('¿Borrar héroe? Se eliminarán todas sus misiones.')) return;
    
    db.globalMissions = db.globalMissions.filter(gm => gm.userId !== id);
    db.users = db.users.filter(u => u.id !== id);
    save();
    renderUsersTab();
    renderHome();
}

function renderUsersTab() {
    const list = document.getElementById('users-manage-list');
    list.innerHTML = '';
    db.users.forEach(u => {
        list.innerHTML += `
            <div class="user-item" style="cursor: default;">
                <input type="text" value="${u.name}" onchange="updateUserName(${u.id}, this.value)" style="width: 60%; margin: 0;">
                <button class="danger small" onclick="deleteUser(${u.id})">Eliminar</button>
            </div>`;
    });

    const editScoresSelect = document.getElementById('edit-scores-user');
    editScoresSelect.innerHTML = '<option value="">Selecciona un héroe</option>';
    db.users.forEach(u => {
        editScoresSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    });
}

function loadUserScores() {
    const userId = parseInt(document.getElementById('edit-scores-user').value);
    if(!userId) {
        document.getElementById('user-scores-editor').style.display = 'none';
        return;
    }
    
    const user = db.users.find(u => u.id === userId);
    if(!user) return;
    
    // Asegurar estructura de powerScores
    if(!user.powerScores) {
        user.powerScores = {};
        db.superpowers.forEach(sp => {
            user.powerScores[sp.name] = {};
            sp.powers.forEach(power => {
                user.powerScores[sp.name][power] = 0;
            });
        });
    }
    
    // Calcular puntos de misiones
    let missionScores = {};
    db.superpowers.forEach(sp => {
        missionScores[sp.name] = {};
        sp.powers.forEach(power => {
            missionScores[sp.name][power] = 0;
        });
    });
    
    if(user.missions) {
        user.missions.forEach(mission => {
            if(mission.status === 'Terminada') {
                for(let sp in mission.scores) {
                    for(let power in mission.scores[sp]) {
                        if(!missionScores[sp]) missionScores[sp] = {};
                        if(!missionScores[sp][power]) missionScores[sp][power] = 0;
                        missionScores[sp][power] += mission.scores[sp][power];
                    }
                }
            }
        });
    }
    
    const editor = document.getElementById('user-scores-editor');
    editor.style.display = 'block';
    editor.innerHTML = '<p style="font-size: 12px; color: #666; margin-bottom: 10px;">Ajusta manualmente los puntos acumulados:</p>';
    
    db.superpowers.forEach(sp => {
        const spSection = document.createElement('div');
        spSection.className = 'power-score-section';
        spSection.innerHTML = `<h4 style="margin-top: 15px; color: var(--primary);">${sp.name}</h4>`;
        
        sp.powers.forEach(power => {
            const fromMissions = missionScores[sp.name] && missionScores[sp.name][power] ? missionScores[sp.name][power] : 0;
            const customValue = user.powerScores[sp.name] && user.powerScores[sp.name][power] ? user.powerScores[sp.name][power] : 0;
            const total = fromMissions + customValue;
            
            spSection.innerHTML += `
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                    <strong>⚡ ${power}</strong><br>
                    <small style="color: #666;">De misiones: ${fromMissions} pts</small><br>
                    <label style="font-size: 12px;">Ajuste manual:</label>
                    <input type="number" class="user-power-score-input" data-sp="${sp.name}" data-power="${power}" value="${customValue}" onchange="updateUserPowerScore(${userId}, '${sp.name}', '${power}', this.value)" style="margin-top: 5px;">
                    <small style="color: var(--success); font-weight: bold;">Total: ${total} pts</small>
                </div>
            `;
        });
        
        editor.appendChild(spSection);
    });
}

function updateUserPowerScore(userId, superpower, power, value) {
    const user = db.users.find(u => u.id === userId);
    if(!user) return;
    
    if(!user.powerScores) user.powerScores = {};
    if(!user.powerScores[superpower]) user.powerScores[superpower] = {};
    user.powerScores[superpower][power] = parseInt(value) || 0;
    
    save();
    loadUserScores();
}