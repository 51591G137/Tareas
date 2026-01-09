// missions.js - Gestión de misiones globales

function toggleRepeat() {
    document.getElementById('repeat-options').style.display = 
        document.getElementById('gm-repeat').checked ? 'block' : 'none';
}

function toggleEditRepeat() {
    document.getElementById('edit-repeat-options').style.display = 
        document.getElementById('edit-mission-repeat').checked ? 'block' : 'none';
}

function toggleTimeRange() {
    document.getElementById('time-range-options').style.display = 
        document.getElementById('gm-time-range').checked ? 'block' : 'none';
}

function toggleEditTimeRange() {
    document.getElementById('edit-time-range-options').style.display = 
        document.getElementById('edit-mission-time-range').checked ? 'block' : 'none';
}

function saveGlobalMission() {
    const title = document.getElementById('gm-title').value.trim();
    const description = document.getElementById('gm-description').value.trim();
    const type = document.getElementById('gm-type').value;
    const startDate = document.getElementById('gm-start-date').value;
    const endDate = document.getElementById('gm-end-date').value;
    const isRepeat = document.getElementById('gm-repeat').checked;
    const hasTimeRange = document.getElementById('gm-time-range').checked;
    const assignedUsers = Array.from(document.querySelectorAll('.assign-user:checked')).map(el => parseInt(el.value));
    const selectMessage = document.getElementById('gm-select-msg').value.trim();
    const completeMessage = document.getElementById('gm-complete-msg').value.trim();
    
    if(!title) return alert("Escribe un título para la misión");
    if(assignedUsers.length === 0) return alert("Selecciona al menos un héroe");

    let scores = {};
    document.querySelectorAll('.superpower-score-group').forEach(group => {
        const superpower = group.dataset.superpower;
        scores[superpower] = {};
        group.querySelectorAll('.power-score-input').forEach(input => {
            const power = input.dataset.power;
            scores[superpower][power] = parseInt(input.value) || 0;
        });
    });

    let timeStart = null;
    let timeEnd = null;
    if(hasTimeRange) {
        timeStart = document.getElementById('gm-time-start').value;
        timeEnd = document.getElementById('gm-time-end').value;
        if(!timeStart || !timeEnd) return alert("Especifica el horario completo");
    }

    const groupId = 'group_' + Date.now();

    if(!isRepeat) {
        assignedUsers.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            const missionId = Date.now() + Math.random();
            
            const mission = {
                id: missionId,
                groupId: groupId,
                title: title,
                baseTitle: title,
                description: description,
                type: type,
                date: startDate,
                startDate: startDate,
                endDate: endDate || startDate,
                timeStart: timeStart,
                timeEnd: timeEnd,
                status: 'En espera',
                scores: scores,
                isRepeat: false,
                userId: userId,
                selectMessage: selectMessage || '¡Excelente elección, héroe! 🦸',
                completeMessage: completeMessage || '¡Misión cumplida! Has ganado experiencia 🌟'
            };
            
            user.missions.push(mission);
            db.globalMissions.push(mission);
        });
    } else {
        const selectedDays = Array.from(document.querySelectorAll('.day-opt:checked')).map(el => parseInt(el.value));
        if(selectedDays.length === 0) return alert("Selecciona al menos un día de repetición");
        
        assignedUsers.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            createRepeatedMissions(user, title, description, type, startDate, endDate, selectedDays, scores, groupId, userId, timeStart, timeEnd, selectMessage, completeMessage);
        });
    }

    save();
    alert("¡Misiones creadas correctamente! 🎯");
    
    document.getElementById('gm-title').value = '';
    document.getElementById('gm-description').value = '';
    document.getElementById('gm-start-date').value = '';
    document.getElementById('gm-end-date').value = '';
    document.getElementById('gm-select-msg').value = '';
    document.getElementById('gm-complete-msg').value = '';
    document.querySelectorAll('.power-score-input').forEach(i => i.value = 0);
    
    renderMissionsTab();
}

function createRepeatedMissions(user, title, description, type, startDateStr, endDateStr, days, scores, groupId, userId, timeStart, timeEnd, selectMessage, completeMessage) {
    let current = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
    current.setHours(0, 0, 0, 0);
    
    let count = 0;
    let attempts = 0;
    
    while(count < 3 && attempts < 30) {
        if(days.includes(current.getDay())) {
            const dateStr = current.toISOString().split('T')[0];
            const missionId = Date.now() + Math.random() + count;
            
            const mission = {
                id: missionId,
                groupId: groupId,
                title: title,
                baseTitle: title,
                description: description,
                type: type,
                date: dateStr,
                startDate: dateStr,
                endDate: endDateStr || dateStr,
                timeStart: timeStart,
                timeEnd: timeEnd,
                status: 'En espera',
                scores: scores,
                isRepeat: true,
                repeatDays: days,
                userId: userId,
                selectMessage: selectMessage || '¡Excelente elección, héroe! 🦸',
                completeMessage: completeMessage || '¡Misión cumplida! Has ganado experiencia 🌟'
            };
            
            user.missions.push(mission);
            db.globalMissions.push(mission);
            count++;
        }
        current.setDate(current.getDate() + 1);
        attempts++;
    }
}

function renderMissionsTab() {
    // Renderizar selector de tipo de misión
    const typeSelect = document.getElementById('gm-type');
    typeSelect.innerHTML = '';
    db.missionTypes.forEach(type => {
        typeSelect.innerHTML += `<option value="${type.id}">${type.icon} ${type.name}</option>`;
    });

    // Renderizar asignación de usuarios
    const assignList = document.getElementById('gm-user-assign');
    assignList.innerHTML = '';
    if(db.users.length === 0) {
        assignList.innerHTML = '<p style="color:#999; font-size:12px;">Crea héroes primero</p>';
    } else {
        db.users.forEach(u => {
            assignList.innerHTML += `<label><input type="checkbox" class="assign-user" value="${u.id}"> ${u.name}</label>`;
        });
    }

    // Renderizar campos de puntuación por superpoder y poder
    const scoresDiv = document.getElementById('gm-scores');
    scoresDiv.innerHTML = '';
    db.superpowers.forEach(sp => {
        const spDiv = document.createElement('div');
        spDiv.className = 'superpower-score-group';
        spDiv.dataset.superpower = sp.name;
        
        spDiv.innerHTML = `<h5 style="margin: 10px 0 5px 0;">${sp.name}</h5>`;
        
        sp.powers.forEach(power => {
            spDiv.innerHTML += `
                <label style="font-size: 12px;">
                    ${power} 
                    <input type="number" class="power-score-input" data-power="${power}" value="0" min="0" style="width: 60px;">
                </label>
            `;
        });
        
        scoresDiv.appendChild(spDiv);
    });

    renderGlobalMissions();
    renderMissionTypes();
}

function renderGlobalMissions() {
    const container = document.getElementById('global-missions-list');
    container.innerHTML = '';
    
    const groups = {};
    db.globalMissions.forEach(gm => {
        if(!groups[gm.groupId]) groups[gm.groupId] = [];
        groups[gm.groupId].push(gm);
    });

    if(Object.keys(groups).length === 0) {
        container.innerHTML = '<p style="color:#999; font-size:12px;">No hay misiones globales creadas</p>';
        return;
    }

    Object.keys(groups).forEach(groupId => {
        const missions = groups[groupId];
        const firstMission = missions[0];
        const assignedUsers = db.users.filter(u => missions.some(m => m.userId === u.id)).map(u => u.name).join(', ');
        
        const missionType = db.missionTypes.find(t => t.id === firstMission.type);
        const typeLabel = missionType ? `${missionType.icon} ${missionType.name}` : firstMission.type;
        
        const dayOrder = [1, 2, 3, 4, 5, 6, 0];
        const daysText = firstMission.isRepeat ? 
            dayOrder
                .filter(d => firstMission.repeatDays.includes(d))
                .map(d => dayNamesShort[d])
                .join(', ') 
            : '';
        
        let timeInfo = '';
        if(firstMission.timeStart && firstMission.timeEnd) {
            timeInfo = `<small>🕐 ${firstMission.timeStart} - ${firstMission.timeEnd}</small><br>`;
        }
        
        container.innerHTML += `
            <div class="card admin-mission-card" style="position: relative; padding-right: 70px;">
                <strong>${firstMission.baseTitle || firstMission.title}</strong><br>
                <small style="color: var(--primary);">${typeLabel}</small><br>
                <small>📅 ${firstMission.startDate || firstMission.date || 'Sin fecha'} ${firstMission.endDate && firstMission.endDate !== firstMission.startDate ? 'a ' + firstMission.endDate : ''}</small><br>
                ${timeInfo}
                <small>👥 ${assignedUsers}</small><br>
                ${firstMission.isRepeat ? '<small>🔄 Repetitiva (' + daysText + ')</small>' : ''}
                <button class="edit-mission-btn" onclick="openEditMissionModal('${groupId}')">✏️</button>
            </div>
        `;
    });
}

function renderMissionTypes() {
    const container = document.getElementById('mission-types-list');
    container.innerHTML = '';
    
    db.missionTypes.forEach((type, index) => {
        container.innerHTML += `
            <div class="mission-type-item">
                <input type="text" value="${type.icon}" onchange="editMissionTypeIcon(${index}, this.value)" style="width: 50px; text-align: center;" maxlength="2">
                <input type="text" value="${type.name}" onchange="editMissionTypeName(${index}, this.value)" style="flex: 1;">
                ${db.missionTypes.length > 1 ? `<button class="danger small" onclick="deleteMissionType(${index})">Eliminar</button>` : ''}
            </div>
        `;
    });
}

function addMissionType() {
    const icon = document.getElementById('new-mission-type-icon').value.trim();
    const name = document.getElementById('new-mission-type-name').value.trim();
    
    if(!icon || !name) return alert('Completa todos los campos');
    
    const id = 'type_' + Date.now();
    db.missionTypes.push({ id, name, icon });
    save();
    
    document.getElementById('new-mission-type-icon').value = '';
    document.getElementById('new-mission-type-name').value = '';
    
    renderMissionsTab();
}

function editMissionTypeIcon(index, newIcon) {
    if(!newIcon.trim()) return alert('El icono no puede estar vacío');
    db.missionTypes[index].icon = newIcon.trim();
    save();
}

function editMissionTypeName(index, newName) {
    if(!newName.trim()) return alert('El nombre no puede estar vacío');
    db.missionTypes[index].name = newName.trim();
    save();
    renderMissionsTab();
}

function deleteMissionType(index) {
    if(db.missionTypes.length <= 1) return alert('Debe haber al menos un tipo de misión');
    if(!confirm('¿Eliminar este tipo de misión?')) return;
    
    const typeId = db.missionTypes[index].id;
    db.missionTypes.splice(index, 1);
    
    // Cambiar misiones de este tipo a 'special'
    db.users.forEach(user => {
        if(user.missions) {
            user.missions.forEach(mission => {
                if(mission.type === typeId) {
                    mission.type = 'special';
                }
            });
        }
    });
    
    save();
    renderMissionsTab();
}

// Modal de edición de misión
let currentEditMissionGroupId = null;

function openEditMissionModal(groupId) {
    currentEditMissionGroupId = groupId;
    const missions = db.globalMissions.filter(m => m.groupId === groupId);
    if(missions.length === 0) return;
    
    const firstMission = missions[0];
    
    document.getElementById('edit-mission-title').value = firstMission.baseTitle || firstMission.title;
    document.getElementById('edit-mission-description').value = firstMission.description || '';
    document.getElementById('edit-mission-type').value = firstMission.type;
    document.getElementById('edit-mission-start-date').value = firstMission.startDate || firstMission.date || '';
    document.getElementById('edit-mission-end-date').value = firstMission.endDate || firstMission.startDate || firstMission.date || '';
    document.getElementById('edit-mission-repeat').checked = firstMission.isRepeat;
    document.getElementById('edit-mission-select-msg').value = firstMission.selectMessage || '';
    document.getElementById('edit-mission-complete-msg').value = firstMission.completeMessage || '';
    
    // Rango horario
    if(firstMission.timeStart && firstMission.timeEnd) {
        document.getElementById('edit-mission-time-range').checked = true;
        document.getElementById('edit-time-range-options').style.display = 'block';
        document.getElementById('edit-mission-time-start').value = firstMission.timeStart;
        document.getElementById('edit-mission-time-end').value = firstMission.timeEnd;
    } else {
        document.getElementById('edit-mission-time-range').checked = false;
        document.getElementById('edit-time-range-options').style.display = 'none';
    }
    
    // Usuarios asignados
    const editUserAssign = document.getElementById('edit-mission-user-assign');
    editUserAssign.innerHTML = '';
    const currentUserIds = [...new Set(missions.map(m => m.userId))];
    db.users.forEach(u => {
        const checked = currentUserIds.includes(u.id) ? 'checked' : '';
        editUserAssign.innerHTML += `<label><input type="checkbox" class="edit-assign-user" value="${u.id}" ${checked}> ${u.name}</label>`;
    });
    
    // Días de repetición
    if(firstMission.isRepeat) {
        document.getElementById('edit-repeat-options').style.display = 'block';
        document.querySelectorAll('.edit-day-opt').forEach(cb => {
            cb.checked = firstMission.repeatDays.includes(parseInt(cb.value));
        });
    } else {
        document.getElementById('edit-repeat-options').style.display = 'none';
    }
    
    // Renderizar tipo de misión
    const typeSelect = document.getElementById('edit-mission-type');
    typeSelect.innerHTML = '';
    db.missionTypes.forEach(type => {
        const selected = type.id === firstMission.type ? 'selected' : '';
        typeSelect.innerHTML += `<option value="${type.id}" ${selected}>${type.icon} ${type.name}</option>`;
    });
    
    // Puntuaciones
    const scoresDiv = document.getElementById('edit-mission-scores');
    scoresDiv.innerHTML = '';
    db.superpowers.forEach(sp => {
        const spDiv = document.createElement('div');
        spDiv.className = 'superpower-score-group';
        spDiv.dataset.superpower = sp.name;
        
        spDiv.innerHTML = `<h5 style="margin: 10px 0 5px 0;">${sp.name}</h5>`;
        
        sp.powers.forEach(power => {
            const val = firstMission.scores[sp.name] && firstMission.scores[sp.name][power] ? firstMission.scores[sp.name][power] : 0;
            spDiv.innerHTML += `
                <label style="font-size: 12px;">
                    ${power} 
                    <input type="number" class="edit-power-score-input" data-power="${power}" value="${val}" min="0" style="width: 60px;">
                </label>
            `;
        });
        
        scoresDiv.appendChild(spDiv);
    });
    
    document.getElementById('edit-mission-modal').classList.add('active');
}

function closeEditMissionModal() {
    document.getElementById('edit-mission-modal').classList.remove('active');
    currentEditMissionGroupId = null;
}

function saveEditedMission() {
    if(!currentEditMissionGroupId) return;
    
    const title = document.getElementById('edit-mission-title').value.trim();
    const description = document.getElementById('edit-mission-description').value.trim();
    const type = document.getElementById('edit-mission-type').value;
    const startDate = document.getElementById('edit-mission-start-date').value;
    const endDate = document.getElementById('edit-mission-end-date').value;
    const isRepeat = document.getElementById('edit-mission-repeat').checked;
    const newUserIds = Array.from(document.querySelectorAll('.edit-assign-user:checked')).map(el => parseInt(el.value));
    const selectMessage = document.getElementById('edit-mission-select-msg').value.trim();
    const completeMessage = document.getElementById('edit-mission-complete-msg').value.trim();
    
    const hasTimeRange = document.getElementById('edit-mission-time-range').checked;
    let timeStart = null;
    let timeEnd = null;
    if(hasTimeRange) {
        timeStart = document.getElementById('edit-mission-time-start').value;
        timeEnd = document.getElementById('edit-mission-time-end').value;
    }
    
    if(!title) return alert("El título no puede estar vacío");
    if(newUserIds.length === 0) return alert("Selecciona al menos un héroe");
    
    let scores = {};
    document.querySelectorAll('.superpower-score-group').forEach(group => {
        const superpower = group.dataset.superpower;
        scores[superpower] = {};
        group.querySelectorAll('.edit-power-score-input').forEach(input => {
            const power = input.dataset.power;
            scores[superpower][power] = parseInt(input.value) || 0;
        });
    });
    
    const oldMissions = db.globalMissions.filter(m => m.groupId === currentEditMissionGroupId);
    const oldUserIds = [...new Set(oldMissions.map(m => m.userId))];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Eliminar misiones futuras de usuarios no seleccionados
    oldUserIds.forEach(userId => {
        if(!newUserIds.includes(userId)) {
            const user = db.users.find(u => u.id === userId);
            if(user && user.missions) {
                user.missions = user.missions.filter(m => 
                    m.groupId !== currentEditMissionGroupId || (m.date && m.date < todayStr)
                );
            }
            db.globalMissions = db.globalMissions.filter(m => 
                m.groupId !== currentEditMissionGroupId || m.userId !== userId || (m.date && m.date < todayStr)
            );
        }
    });
    
    // Eliminar misiones futuras de usuarios que continúan
    oldUserIds.filter(id => newUserIds.includes(id)).forEach(userId => {
        const user = db.users.find(u => u.id === userId);
        if(user && user.missions) {
            user.missions = user.missions.filter(m => 
                m.groupId !== currentEditMissionGroupId || (m.date && m.date < todayStr)
            );
        }
        db.globalMissions = db.globalMissions.filter(m => 
            m.groupId !== currentEditMissionGroupId || m.userId !== userId || (m.date && m.date < todayStr)
        );
    });
    
    // Crear nuevas misiones
    if(!isRepeat) {
        newUserIds.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            const missionId = Date.now() + Math.random();
            
            const mission = {
                id: missionId,
                groupId: currentEditMissionGroupId,
                title: title,
                baseTitle: title,
                description: description,
                type: type,
                date: startDate,
                startDate: startDate,
                endDate: endDate || startDate,
                timeStart: timeStart,
                timeEnd: timeEnd,
                status: 'En espera',
                scores: scores,
                isRepeat: false,
                userId: userId,
                selectMessage: selectMessage || '¡Excelente elección, héroe! 🦸',
                completeMessage: completeMessage || '¡Misión cumplida! Has ganado experiencia 🌟'
            };
            
            user.missions.push(mission);
            db.globalMissions.push(mission);
        });
    } else {
        const selectedDays = Array.from(document.querySelectorAll('.edit-day-opt:checked')).map(el => parseInt(el.value));
        if(selectedDays.length === 0) return alert("Selecciona al menos un día");
        
        newUserIds.forEach(userId => {
            const user = db.users.find(u => u.id === userId);
            createRepeatedMissions(user, title, description, type, startDate || todayStr, endDate, selectedDays, scores, currentEditMissionGroupId, userId, timeStart, timeEnd, selectMessage, completeMessage);
        });
    }
    
    save();
    alert("Misión actualizada 🎯");
    closeEditMissionModal();
    renderMissionsTab();
}