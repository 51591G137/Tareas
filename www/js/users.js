// users.js - Gestión de usuarios

function createUser() {
    const nameInput = document.getElementById('new-user-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Por favor, introduce un nombre');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        tasks: [],
        customScores: {}
    };
    
    // Inicializar customScores para cada categoría
    db.categories.forEach(cat => {
        newUser.customScores[cat] = 0;
    });
    
    db.users.push(newUser);
    save();
    nameInput.value = '';
    
    // Actualizar interfaces
    renderHome();
    renderUsersTab();
}

function renderUsersTab() {
    const container = document.getElementById('users-manage-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    db.users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-manage-item';
        userDiv.innerHTML = `
            <span>${user.name}</span>
            <div>
                <button class="secondary small" onclick="updateUserName(${user.id})">Editar</button>
                <button class="danger small" onclick="deleteUser(${user.id})">Eliminar</button>
            </div>
        `;
        container.appendChild(userDiv);
    });
    
    // Actualizar selector para editar puntuaciones
    loadUserScoresSelector();
}

function updateUserName(userId) {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('Nuevo nombre para el usuario:', user.name);
    if (newName && newName.trim()) {
        user.name = newName.trim();
        save();
        renderUsersTab();
        renderHome();
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de eliminar este usuario? Se perderán todas sus tareas.')) {
        const index = db.users.findIndex(u => u.id === userId);
        if (index > -1) {
            db.users.splice(index, 1);
            save();
            renderUsersTab();
            renderHome();
        }
    }
}

function loadUserScoresSelector() {
    const select = document.getElementById('edit-scores-user');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecciona un usuario</option>';
    db.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        select.appendChild(option);
    });
}

function loadUserScores() {
    const select = document.getElementById('edit-scores-user');
    const userId = parseInt(select.value);
    
    if (!userId) {
        document.getElementById('user-scores-editor').style.display = 'none';
        return;
    }
    
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    
    // Asegurar que customScores existe
    if (!user.customScores) {
        user.customScores = {};
        db.categories.forEach(cat => {
            user.customScores[cat] = 0;
        });
    }
    
    let html = '<div style="margin-top: 10px;">';
    db.categories.forEach(cat => {
        const value = user.customScores[cat] || 0;
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span>${cat}:</span>
                <input type="number" id="score-${cat}-${userId}" value="${value}" 
                       style="width: 60px; text-align: center; padding: 2px;">
            </div>
        `;
    });
    
    html += `<button onclick="saveUserScores(${userId})" class="small">Guardar Cambios</button>`;
    html += '</div>';
    
    document.getElementById('user-scores-editor').innerHTML = html;
    document.getElementById('user-scores-editor').style.display = 'block';
}

function saveUserScores(userId) {
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    
    db.categories.forEach(cat => {
        const input = document.getElementById(`score-${cat}-${userId}`);
        if (input) {
            user.customScores[cat] = parseInt(input.value) || 0;
        }
    });
    
    save();
    alert('Puntuaciones guardadas correctamente');
}

// Hacer funciones globales
window.createUser = createUser;
window.renderUsersTab = renderUsersTab;
window.updateUserName = updateUserName;
window.deleteUser = deleteUser;
window.loadUserScores = loadUserScores;
window.saveUserScores = saveUserScores;