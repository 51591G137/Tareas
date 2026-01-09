// views.js - Renderizado de vistas del usuario
const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function showView(viewId) {
    document.querySelectorAll('#main-app .screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active');
    
    const titles = {
        'view-tasks': 'Tareas de ' + currentUser.name,
        'view-calendar': 'Calendario de ' + currentUser.name,
        'view-scores': 'Puntuación de ' + currentUser.name,
        'view-badges': 'Insignias de ' + currentUser.name
    };
    document.getElementById('user-title').innerText = titles[viewId] || currentUser.name;
    
    const btnIndex = ['view-tasks', 'view-calendar', 'view-scores', 'view-badges'].indexOf(viewId);
    if(btnIndex >= 0) {
        document.querySelectorAll('.nav-btn')[btnIndex].classList.add('active');
    }

    if(viewId === 'view-tasks') renderTasks();
    if(viewId === 'view-calendar') renderCalendar();
    if(viewId === 'view-scores') renderScores();
    if(viewId === 'view-badges') renderBadges();
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    
    const activeTasks = currentUser.tasks.filter(t => 
        t.status === 'En espera' || t.status === 'En proceso'
    );
    
    if(activeTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No tienes tareas pendientes 🎉</p>';
        return;
    }
    
    activeTasks.forEach(t => {
        let statusClass = 'espera';
        if(t.status === 'En proceso') statusClass = 'proceso';
        
        let scoresHtml = '<div class="task-scores">';
        for(let cat in t.scores) {
            if(t.scores[cat] > 0) {
                scoresHtml += `<span>${cat}: +${t.scores[cat]}</span>`;
            }
        }
        scoresHtml += '</div>';
        
        container.innerHTML += `
            <div class="card task-card st-${statusClass}" onclick="openStatusModal(${t.id})">
                <span class="status-indicator status-${statusClass}">${t.status}</span>
                <h4 style="margin: 5px 0;">${t.title}</h4>
                <small>📅 ${t.date || 'Sin fecha'}</small>
                ${t.isRepeat ? '<br><small style="color: var(--primary);">🔄 Repetitiva</small>' : ''}
                ${scoresHtml}
            </div>
        `;
    });
}

function renderCalendar() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';
    
    const datedTasks = currentUser.tasks
        .filter(t => t.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if(datedTasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No hay tareas con fecha asignada</p>';
        return;
    }
    
    // Agrupar tareas por períodos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const pastTasks = [];
    const thisWeekTasks = [];
    const futureTasks = [];
    
    datedTasks.forEach(t => {
        const taskDate = new Date(t.date + 'T00:00:00');
        if(taskDate < startOfWeek) {
            pastTasks.push(t);
        } else if(taskDate <= endOfWeek) {
            thisWeekTasks.push(t);
        } else {
            futureTasks.push(t);
        }
    });
    
    // PASADAS (contraídas por defecto)
    if(pastTasks.length > 0) {
        const pastSection = createCalendarSection('Antiguas', pastTasks, true, true);
        container.appendChild(pastSection);
    }
    
    // ESTA SEMANA (expandidas)
    if(thisWeekTasks.length > 0) {
        const weekSection = createCalendarSection('Esta Semana', thisWeekTasks, false, false);
        container.appendChild(weekSection);
    }
    
    // FUTURAS (contraídas)
    if(futureTasks.length > 0) {
        const futureSection = createCalendarSection('Siguientes', futureTasks, true, true);
        container.appendChild(futureSection);
    }
}

function createCalendarSection(title, tasks, collapsed, groupByMonth) {
    const section = document.createElement('div');
    section.className = 'calendar-section';
    
    const header = document.createElement('div');
    header.className = 'calendar-section-header' + (collapsed ? ' collapsed' : '');
    header.innerHTML = `
        <span>${title} (${tasks.length})</span>
        <span class="toggle-icon">▼</span>
    `;
    header.onclick = function() {
        this.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    };
    
    const content = document.createElement('div');
    content.className = 'calendar-section-content' + (collapsed ? ' collapsed' : '');
    
    if(groupByMonth) {
        // Agrupar por mes
        const tasksByMonth = {};
        tasks.forEach(t => {
            const date = new Date(t.date + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if(!tasksByMonth[monthKey]) {
                tasksByMonth[monthKey] = {
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    tasks: []
                };
            }
            tasksByMonth[monthKey].tasks.push(t);
        });
        
        // Renderizar cada mes
        Object.keys(tasksByMonth).sort().forEach(monthKey => {
            const monthData = tasksByMonth[monthKey];
            const monthDiv = createMonthGroup(
                monthNames[monthData.month] + ' ' + monthData.year,
                monthData.tasks,
                true
            );
            content.appendChild(monthDiv);
        });
    } else {
        // Renderizar día por día
        let lastDate = '';
        tasks.forEach(t => {
            if(t.date !== lastDate) {
                const dateObj = new Date(t.date + 'T00:00:00');
                const dayName = dayNames[dateObj.getDay()];
                const dayHeader = document.createElement('h4');
                dayHeader.className = 'calendar-day-header';
                dayHeader.innerText = `${t.date} - ${dayName}`;
                content.appendChild(dayHeader);
                lastDate = t.date;
            }
            
            const taskCard = createTaskCard(t);
            content.appendChild(taskCard);
        });
    }
    
    section.appendChild(header);
    section.appendChild(content);
    return section;
}

function createMonthGroup(title, tasks, collapsed) {
    const monthDiv = document.createElement('div');
    monthDiv.style.marginBottom = '15px';
    
    const header = document.createElement('div');
    header.className = 'calendar-month-header' + (collapsed ? ' collapsed' : '');
    header.innerHTML = `
        <span>${title} (${tasks.length})</span>
        <span class="toggle-icon" style="font-size: 14px;">▼</span>
    `;
    
    const content = document.createElement('div');
    content.className = 'calendar-month-content' + (collapsed ? ' collapsed' : '');
    
    header.onclick = function() {
        this.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    };
    
    let lastDate = '';
    tasks.forEach(t => {
        if(t.date !== lastDate) {
            const dateObj = new Date(t.date + 'T00:00:00');
            const dayName = dayNames[dateObj.getDay()];
            const dayHeader = document.createElement('h4');
            dayHeader.className = 'calendar-day-header';
            dayHeader.innerText = `${t.date} - ${dayName}`;
            content.appendChild(dayHeader);
            lastDate = t.date;
        }
        
        const taskCard = createTaskCard(t);
        content.appendChild(taskCard);
    });
    
    monthDiv.appendChild(header);
    monthDiv.appendChild(content);
    return monthDiv;
}

function createTaskCard(task) {
    const card = document.createElement('div');
    
    let statusClass = 'espera';
    if(task.status === 'En proceso') statusClass = 'proceso';
    if(task.status === 'Terminada') statusClass = 'terminada';
    if(task.status === 'Perdida') statusClass = 'perdida';
    
    card.className = `card st-${statusClass}`;
    card.style.borderLeft = '4px solid';
    card.innerHTML = `
        <span class="status-indicator status-${statusClass}">${task.status}</span>
        <strong>${task.title}</strong>
    `;
    
    return card;
}

function renderScores() {
    const container = document.getElementById('scores-container');
    container.innerHTML = '';
    
    let totals = {};
    db.categories.forEach(c => totals[c] = 0);

    currentUser.tasks.forEach(t => {
        if(t.status === 'Terminada') {
            for(let cat in t.scores) {
                if(!totals[cat]) totals[cat] = 0;
                totals[cat] += t.scores[cat];
            }
        }
    });

    if(currentUser.customScores) {
        for(let cat in currentUser.customScores) {
            if(!totals[cat]) totals[cat] = 0;
            totals[cat] += currentUser.customScores[cat];
        }
    }

    for(let cat in totals) {
        container.innerHTML += `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px;">${cat}</strong> 
                <span style="font-size: 24px; color: var(--success); font-weight: bold;">${totals[cat]}</span>
            </div>
        `;
    }
}

function renderBadges() {
    const container = document.getElementById('badges-container');
    container.innerHTML = '';
    
    if(db.badges.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No hay insignias configuradas</p>';
        return;
    }

    let userScores = {};
    db.categories.forEach(c => userScores[c] = 0);

    currentUser.tasks.forEach(t => {
        if(t.status === 'Terminada') {
            for(let cat in t.scores) {
                if(!userScores[cat]) userScores[cat] = 0;
                userScores[cat] += t.scores[cat];
            }
        }
    });

    if(currentUser.customScores) {
        for(let cat in currentUser.customScores) {
            if(!userScores[cat]) userScores[cat] = 0;
            userScores[cat] += currentUser.customScores[cat];
        }
    }

    const totalPoints = Object.values(userScores).reduce((a, b) => a + b, 0);

    container.innerHTML = '<div class="badge-grid"></div>';
    const grid = container.querySelector('.badge-grid');

    db.badges.forEach(badge => {
        let unlocked = false;
        let progressText = '';
        
        if(badge.requirementType === 'total') {
            unlocked = totalPoints >= badge.totalPoints;
            progressText = unlocked ? '🎉 Desbloqueada' : `${totalPoints}/${badge.totalPoints} pts`;
        } else if(badge.requirementType === 'category') {
            const userPoints = userScores[badge.categoryRequirement.category] || 0;
            unlocked = userPoints >= badge.categoryRequirement.points;
            progressText = unlocked ? '🎉 Desbloqueada' : `${userPoints}/${badge.categoryRequirement.points} pts en ${badge.categoryRequirement.category}`;
        } else if(badge.requirementType === 'multiple') {
            unlocked = Object.entries(badge.multipleRequirements).every(([cat, req]) => {
                return (userScores[cat] || 0) >= req;
            });
            if(!unlocked) {
                const progress = Object.entries(badge.multipleRequirements).map(([cat, req]) => {
                    const current = userScores[cat] || 0;
                    return `${cat}: ${current}/${req}`;
                }).join(', ');
                progressText = progress;
            } else {
                progressText = '🎉 Desbloqueada';
            }
        }
        
        grid.innerHTML += `
            <div class="badge-item">
                <div class="badge-image ${unlocked ? 'unlocked' : 'locked'}">
                    ${badge.emoji}
                </div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-progress">${progressText}</div>
            </div>
        `;
    });
}

// Modal de estado
let currentTaskId = null;

function openStatusModal(taskId) {
    currentTaskId = taskId;
    const task = currentUser.tasks.find(t => t.id === taskId);
    if(!task) return;
    
    document.getElementById('modal-task-title').innerText = task.title;
    document.getElementById('status-modal').classList.add('active');
}

function closeStatusModal() {
    document.getElementById('status-modal').classList.remove('active');
    currentTaskId = null;
}

function changeTaskStatus(newStatus) {
    if(!currentTaskId) return;
    
    const task = currentUser.tasks.find(t => t.id === currentTaskId);
    if(!task) return;
    
    task.status = newStatus;
    
    if((newStatus === 'Terminada' || newStatus === 'Perdida') && task.isRepeat && task.repeatDays) {
        generateNextRepeatingTask(task);
    }
    
    save();
    closeStatusModal();
    renderTasks();
    renderCalendar();
    renderScores();
    renderBadges();
}

function generateNextRepeatingTask(completedTask) {
    const futureTasks = currentUser.tasks.filter(t => 
        t.groupId === completedTask.groupId && 
        (t.status === 'En espera' || t.status === 'En proceso') &&
        t.id !== completedTask.id
    );
    
    if(futureTasks.length >= 3) return;
    
    const taskDate = new Date(completedTask.date + 'T00:00:00');
    let nextDate = new Date(taskDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    let found = false;
    let attempts = 0;
    
    while(!found && attempts < 30) {
        if(completedTask.repeatDays.includes(nextDate.getDay())) {
            const nextDateStr = nextDate.toISOString().split('T')[0];
            
            const exists = currentUser.tasks.some(t => 
                t.groupId === completedTask.groupId && 
                t.date === nextDateStr
            );
            
            if(!exists) {
                const newTaskId = Date.now() + Math.random();
                const newTask = {
                    id: newTaskId,
                    groupId: completedTask.groupId,
                    title: `${completedTask.baseTitle}. ${dayNames[nextDate.getDay()]}`,
                    baseTitle: completedTask.baseTitle,
                    date: nextDateStr,
                    status: 'En espera',
                    scores: completedTask.scores,
                    isRepeat: true,
                    repeatDays: completedTask.repeatDays,
                    userId: currentUser.id
                };
                
                currentUser.tasks.push(newTask);
                
                const userIndex = db.users.findIndex(u => u.id === currentUser.id);
                db.users[userIndex] = currentUser;
                
                found = true;
            }
        }
        nextDate.setDate(nextDate.getDate() + 1);
        attempts++;
    }
}
// Función auxiliar para mostrar mensajes
function showMessage(message, type = 'info') {
    const colors = {
        'info': '#3498db',
        'success': '#2ecc71',
        'warning': '#f39c12',
        'error': '#e74c3c'
    };
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Añadir estilos para las animaciones
if (!document.querySelector('#message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}