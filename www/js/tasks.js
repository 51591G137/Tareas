// tasks.js - Gestión de tareas globales

function toggleRepeat() {
    document.getElementById('repeat-options').style.display = 
        document.getElementById('gt-repeat').checked ? 'block' : 'none';
}

function toggleEditRepeat() {
    document.getElementById('edit-repeat-options').style.display = 
        document.getElementById('edit-task-repeat').checked ? 'block' : 'none';
}

function saveGlobalTask() {
    const title = document.getElementById('gt-title').value.trim();
    const startDate = document.getElementById('gt-date').value;
    const isRepeat = document.getElementById('gt-repeat').checked;
    const assignedUsers = Array.from(document.querySelectorAll('.assign-user:checked')).map(el => parseInt(el.value));
    
    if(!title) return alert("Escribe un título para la tarea");
    if(assignedUsers.length === 0) return alert("Selecciona al menos un usuario");

    let scores = {};
    document.querySelectorAll('.sc-in').forEach(i => {
        scores[i.dataset.cat] = parseInt(i.value) || 0;
    });

    const groupId = 'group_' + Date.now();

    if(!isRepeat) {
        assignedUsers.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            const taskId = Date.now() + Math.random();
            
            const task = {
                id: taskId,
                groupId: groupId,
                title: title,
                baseTitle: title,
                date: startDate,
                status: 'En espera',
                scores: scores,
                isRepeat: false,
                userId: userId
            };
            
            user.tasks.push(task);
            db.globalTasks.push(task);
        });
    } else {
        const selectedDays = Array.from(document.querySelectorAll('.day-opt:checked')).map(el => parseInt(el.value));
        if(selectedDays.length === 0) return alert("Selecciona al menos un día de repetición");
        
        assignedUsers.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            createRepeatedTasks(user, title, startDate, selectedDays, scores, groupId, userId);
        });
    }

    save();
    alert("Tareas creadas correctamente");
    
    document.getElementById('gt-title').value = '';
    document.getElementById('gt-date').value = '';
    document.querySelectorAll('.sc-in').forEach(i => i.value = 0);
    
    renderTasksTab();
}

function createRepeatedTasks(user, title, startDateStr, days, scores, groupId, userId) {
    let current = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
    current.setHours(0, 0, 0, 0);
    
    let count = 0;
    let attempts = 0;
    
    while(count < 3 && attempts < 30) {
        if(days.includes(current.getDay())) {
            const dateStr = current.toISOString().split('T')[0];
            const taskId = Date.now() + Math.random() + count;
            
            const task = {
                id: taskId,
                groupId: groupId,
                title: `${title}. ${dayNames[current.getDay()]}`,
                baseTitle: title,
                date: dateStr,
                status: 'En espera',
                scores: scores,
                isRepeat: true,
                repeatDays: days,
                userId: userId
            };
            
            user.tasks.push(task);
            db.globalTasks.push(task);
            count++;
        }
        current.setDate(current.getDate() + 1);
        attempts++;
    }
}

function renderTasksTab() {
    const catList = document.getElementById('categories-list');
    catList.innerHTML = '';
    db.categories.forEach((cat, index) => {
        catList.innerHTML += `
            <div class="category-item" draggable="true" ondragstart="dragCategory(event, ${index})" ondragover="allowDrop(event)" ondrop="dropCategory(event, ${index})">
                <span class="drag-handle">☰</span>
                <input type="text" value="${cat}" onchange="editCategory(${index}, this.value)">
                <button class="danger small" onclick="deleteCategory(${index})">Eliminar</button>
            </div>
        `;
    });

    const assignList = document.getElementById('gt-user-assign');
    assignList.innerHTML = '';
    if(db.users.length === 0) {
        assignList.innerHTML = '<p style="color:#999; font-size:12px;">Crea usuarios primero</p>';
    } else {
        db.users.forEach(u => {
            assignList.innerHTML += `<label><input type="checkbox" class="assign-user" value="${u.id}"> ${u.name}</label>`;
        });
    }

    const scoresDiv = document.getElementById('gt-scores');
    scoresDiv.innerHTML = '';
    db.categories.forEach(cat => {
        scoresDiv.innerHTML += `<label>${cat} <input type="number" class="sc-in" data-cat="${cat}" value="0" min="0"></label>`;
    });

    renderGlobalTasks();
}

function renderGlobalTasks() {
    const container = document.getElementById('global-tasks-list');
    container.innerHTML = '';
    
    const groups = {};
    db.globalTasks.forEach(gt => {
        if(!groups[gt.groupId]) groups[gt.groupId] = [];
        groups[gt.groupId].push(gt);
    });

    if(Object.keys(groups).length === 0) {
        container.innerHTML = '<p style="color:#999; font-size:12px;">No hay tareas globales creadas</p>';
        return;
    }

    Object.keys(groups).forEach(groupId => {
        const tasks = groups[groupId];
        const firstTask = tasks[0];
        const assignedUsers = db.users.filter(u => tasks.some(t => t.userId === u.id)).map(u => u.name).join(', ');
        
        const dayOrder = [1, 2, 3, 4, 5, 6, 0];
        const daysText = firstTask.isRepeat ? 
            dayOrder
                .filter(d => firstTask.repeatDays.includes(d))
                .map(d => dayNamesShort[d])
                .join(', ') 
            : '';
        
        container.innerHTML += `
            <div class="card admin-task-card" style="position: relative; padding-right: 70px;">
                <strong>${firstTask.baseTitle || firstTask.title}</strong><br>
                <small>📅 ${firstTask.date || 'Sin fecha'}</small><br>
                <small>👥 ${assignedUsers}</small><br>
                ${firstTask.isRepeat ? '<small>🔄 Repetitiva (' + daysText + ')</small>' : ''}
                <button class="edit-task-btn" onclick="openEditTaskModal('${groupId}')">✏️</button>
            </div>
        `;
    });
}

let currentEditTaskGroupId = null;

function openEditTaskModal(groupId) {
    currentEditTaskGroupId = groupId;
    const tasks = db.globalTasks.filter(t => t.groupId === groupId);
    if(tasks.length === 0) return;
    
    const firstTask = tasks[0];
    
    document.getElementById('edit-task-title').value = firstTask.baseTitle || firstTask.title;
    document.getElementById('edit-task-date').value = firstTask.date || '';
    document.getElementById('edit-task-repeat').checked = firstTask.isRepeat;
    
    const editUserAssign = document.getElementById('edit-task-user-assign');
    editUserAssign.innerHTML = '';
    const currentUserIds = [...new Set(tasks.map(t => t.userId))];
    db.users.forEach(u => {
        const checked = currentUserIds.includes(u.id) ? 'checked' : '';
        editUserAssign.innerHTML += `<label><input type="checkbox" class="edit-assign-user" value="${u.id}" ${checked}> ${u.name}</label>`;
    });
    
    if(firstTask.isRepeat) {
        document.getElementById('edit-repeat-options').style.display = 'block';
        document.querySelectorAll('.edit-day-opt').forEach(cb => {
            cb.checked = firstTask.repeatDays.includes(parseInt(cb.value));
        });
    } else {
        document.getElementById('edit-repeat-options').style.display = 'none';
    }
    
    const scoresDiv = document.getElementById('edit-task-scores');
    scoresDiv.innerHTML = '';
    db.categories.forEach(cat => {
        const val = firstTask.scores[cat] || 0;
        scoresDiv.innerHTML += `<label>${cat} <input type="number" class="edit-sc-in" data-cat="${cat}" value="${val}" min="0"></label>`;
    });
    
    document.getElementById('edit-task-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-task-modal').classList.remove('active');
    currentEditTaskGroupId = null;
}

function saveEditedTask() {
    if(!currentEditTaskGroupId) return;
    
    const title = document.getElementById('edit-task-title').value.trim();
    const date = document.getElementById('edit-task-date').value;
    const isRepeat = document.getElementById('edit-task-repeat').checked;
    const newUserIds = Array.from(document.querySelectorAll('.edit-assign-user:checked')).map(el => parseInt(el.value));
    
    if(!title) return alert("El título no puede estar vacío");
    if(newUserIds.length === 0) return alert("Selecciona al menos un usuario");
    
    let scores = {};
    document.querySelectorAll('.edit-sc-in').forEach(i => {
        scores[i.dataset.cat] = parseInt(i.value) || 0;
    });
    
    const oldTasks = db.globalTasks.filter(t => t.groupId === currentEditTaskGroupId);
    const oldUserIds = [...new Set(oldTasks.map(t => t.userId))];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    oldUserIds.forEach(userId => {
        if(!newUserIds.includes(userId)) {
            const user = db.users.find(u => u.id === userId);
            if(user) {
                user.tasks = user.tasks.filter(t => 
                    t.groupId !== currentEditTaskGroupId || t.date < todayStr
                );
            }
            db.globalTasks = db.globalTasks.filter(t => 
                t.groupId !== currentEditTaskGroupId || t.userId !== userId || t.date < todayStr
            );
        }
    });
    
    oldUserIds.filter(id => newUserIds.includes(id)).forEach(userId => {
        const user = db.users.find(u => u.id === userId);
        if(user) {
            user.tasks = user.tasks.filter(t => 
                t.groupId !== currentEditTaskGroupId || t.date < todayStr
            );
        }
        db.globalTasks = db.globalTasks.filter(t => 
            t.groupId !== currentEditTaskGroupId || t.userId !== userId || t.date < todayStr
        );
    });
    
    if(!isRepeat) {
        newUserIds.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            const taskId = Date.now() + Math.random();
            
            const task = {
                id: taskId,
                groupId: currentEditTaskGroupId,
                title: title,
                baseTitle: title,
                date: date,
                status: 'En espera',
                scores: scores,
                isRepeat: false,
                userId: userId
            };
            
            user.tasks.push(task);
            db.globalTasks.push(task);
        });
    } else {
        const selectedDays = Array.from(document.querySelectorAll('.edit-day-opt:checked')).map(el => parseInt(el.value));
        if(selectedDays.length === 0) return alert("Selecciona al menos un día");
        
        newUserIds.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            createRepeatedTasks(user, title, date || todayStr, selectedDays, scores, currentEditTaskGroupId, userId);
        });
    }
    
    save();
    alert("Tarea actualizada");
    closeEditModal();
    renderTasksTab();
}