// tasks.js - Gestión de tareas globales

function saveGlobalTask() {
    const title = document.getElementById('gt-title').value.trim();
    const date = document.getElementById('gt-date').value || null;
    const repeat = document.getElementById('gt-repeat').checked;
    
    if (!title) {
        alert('Por favor, introduce un título para la tarea');
        return;
    }
    
    // Obtener usuarios seleccionados
    const assignedUsers = [];
    document.querySelectorAll('#gt-user-assign input:checked').forEach(cb => {
        assignedUsers.push(parseInt(cb.value));
    });
    
    if (assignedUsers.length === 0) {
        alert('Selecciona al menos un usuario');
        return;
    }
    
    // Obtener puntuaciones
    const scores = {};
    db.categories.forEach(cat => {
        const input = document.getElementById(`gt-score-${cat}`);
        if (input) {
            const value = parseInt(input.value) || 0;
            if (value > 0) scores[cat] = value;
        }
    });
    
    // Obtener días de repetición
    let repeatDays = [];
    if (repeat) {
        document.querySelectorAll('.day-opt:checked').forEach(cb => {
            repeatDays.push(parseInt(cb.value));
        });
    }
    
    const groupId = Date.now();
    const today = new Date();
    
    // Crear tareas para cada usuario
    assignedUsers.forEach(userId => {
        const user = db.users.find(u => u.id === userId);
        if (!user) return;
        
        if (repeat && repeatDays.length > 0) {
            // Crear tareas repetitivas para los próximos 7 días
            for (let i = 0; i < 7; i++) {
                const taskDate = new Date(today);
                taskDate.setDate(today.getDate() + i);
                
                if (repeatDays.includes(taskDate.getDay())) {
                    const taskDateStr = taskDate.toISOString().split('T')[0];
                    const taskId = groupId + i;
                    
                    const task = {
                        id: taskId,
                        groupId: groupId,
                        title: `${title}. ${dayNames[taskDate.getDay()]}`,
                        baseTitle: title,
                        date: taskDateStr,
                        status: 'En espera',
                        scores: scores,
                        isRepeat: true,
                        repeatDays: repeatDays,
                        userId: userId
                    };
                    
                    if (!user.tasks.some(t => t.groupId === groupId && t.date === taskDateStr)) {
                        user.tasks.push(task);
                    }
                }
            }
        } else {
            // Tarea única
            const task = {
                id: groupId,
                groupId: groupId,
                title: title,
                baseTitle: title,
                date: date,
                status: 'En espera',
                scores: scores,
                isRepeat: false,
                repeatDays: [],
                userId: userId
            };
            
            user.tasks.push(task);
        }
    });
    
    // Guardar tarea global
    const globalTask = {
        id: groupId,
        title: title,
        date: date,
        repeat: repeat,
        repeatDays: repeatDays,
        scores: scores,
        assignedUsers: assignedUsers,
        createdAt: new Date().toISOString()
    };
    
    db.globalTasks.push(globalTask);
    save();
    
    // Limpiar formulario
    document.getElementById('gt-title').value = '';
    document.getElementById('gt-date').value = '';
    document.getElementById('gt-repeat').checked = false;
    toggleRepeat();
    document.querySelectorAll('#gt-user-assign input').forEach(cb => cb.checked = false);
    
    // Actualizar interfaz
    renderGlobalTasks();
    alert('Tarea(s) creada(s) correctamente');
}

function toggleRepeat() {
    const options = document.getElementById('repeat-options');
    if (document.getElementById('gt-repeat').checked) {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

function toggleEditRepeat() {
    const options = document.getElementById('edit-repeat-options');
    if (document.getElementById('edit-task-repeat').checked) {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

function renderTasksTab() {
    // Renderizar lista de categorías con campos de puntuación
    const scoresContainer = document.getElementById('gt-scores');
    scoresContainer.innerHTML = '';
    
    db.categories.forEach(cat => {
        scoresContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span>${cat}:</span>
                <input type="number" id="gt-score-${cat}" value="0" min="0" 
                       style="width: 60px; text-align: center; padding: 2px;">
            </div>
        `;
    });
    
    // Renderizar lista de usuarios para asignación
    const userAssignContainer = document.getElementById('gt-user-assign');
    userAssignContainer.innerHTML = '';
    
    db.users.forEach(user => {
        userAssignContainer.innerHTML += `
            <label style="display: block; margin-bottom: 5px;">
                <input type="checkbox" value="${user.id}"> ${user.name}
            </label>
        `;
    });
    
    // Renderizar tareas globales existentes
    renderGlobalTasks();
}

function renderGlobalTasks() {
    const container = document.getElementById('global-tasks-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (db.globalTasks.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">No hay tareas globales creadas</p>';
        return;
    }
    
    db.globalTasks.forEach(task => {
        const assignedNames = task.assignedUsers.map(id => {
            const user = db.users.find(u => u.id === id);
            return user ? user.name : 'Desconocido';
        }).join(', ');
        
        container.innerHTML += `
            <div class="card" style="margin-bottom: 10px;">
                <h4>${task.title}</h4>
                <small>Asignada a: ${assignedNames}</small><br>
                <small>Fecha: ${task.date || 'Sin fecha'}</small><br>
                <small>${task.repeat ? 'Repetitiva' : 'Única'}</small>
                <div style="margin-top: 5px;">
                    <button class="secondary small" onclick="editGlobalTask(${task.id})">Editar</button>
                    <button class="danger small" onclick="deleteGlobalTask(${task.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
}

// Hacer funciones globales
window.saveGlobalTask = saveGlobalTask;
window.toggleRepeat = toggleRepeat;
window.toggleEditRepeat = toggleEditRepeat;
window.renderTasksTab = renderTasksTab;
window.renderGlobalTasks = renderGlobalTasks;