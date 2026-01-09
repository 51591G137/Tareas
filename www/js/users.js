// users.js - Gestión de usuarios y puntuaciones

function createUser() {
    const name = document.getElementById('new-user-name').value.trim();
    if(!name) return alert('Escribe un nombre');
    if(db.users.some(u => u.name === name)) return alert('Ya existe un usuario con ese nombre');
    
    const newUser = {
        id: Date.now(),
        name: name,
        tasks: [],
        customScores: {}
    };
    
    db.categories.forEach(cat => {
        newUser.customScores[cat] = 0;
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
    if(!confirm('¿Borrar usuario? Se eliminarán todas sus tareas.')) return;
    
    db.globalTasks = db.globalTasks.filter(gt => gt.userId !== id);
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
    editScoresSelect.innerHTML = '<option value="">Selecciona un usuario</option>';
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
    
    if(!user.customScores) {
        user.customScores = {};
        db.categories.forEach(cat => {
            user.customScores[cat] = 0;
        });
    }
    
    let taskScores = {};
    db.categories.forEach(c => taskScores[c] = 0);
    user.tasks.forEach(t => {
        if(t.status === 'Terminada') {
            for(let cat in t.scores) {
                if(!taskScores[cat]) taskScores[cat] = 0;
                taskScores[cat] += t.scores[cat];
            }
        }
    });
    
    const editor = document.getElementById('user-scores-editor');
    editor.style.display = 'block';
    editor.innerHTML = '<p style="font-size: 12px; color: #666; margin-bottom: 10px;">Ajusta manualmente los puntos acumulados:</p>';
    
    db.categories.forEach(cat => {
        const totalFromTasks = taskScores[cat] || 0;
        const customValue = user.customScores[cat] || 0;
        const total = totalFromTasks + customValue;
        
        editor.innerHTML += `
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <strong>${cat}</strong><br>
                <small style="color: #666;">De tareas: ${totalFromTasks} pts</small><br>
                <label style="font-size: 12px;">Ajuste manual:</label>
                <input type="number" class="user-score-input" data-cat="${cat}" value="${customValue}" onchange="updateUserScore(${userId}, '${cat}', this.value)" style="margin-top: 5px;">
                <small style="color: var(--success); font-weight: bold;">Total: ${total} pts</small>
            </div>
        `;
    });
}

function updateUserScore(userId, category, value) {
    const user = db.users.find(u => u.id === userId);
    if(!user) return;
    
    if(!user.customScores) user.customScores = {};
    user.customScores[category] = parseInt(value) || 0;
    
    save();
    loadUserScores();
}