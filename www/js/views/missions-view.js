// ========================================
// RADAR DE MISIONES
// ========================================

function renderMissions() {
    const container = document.getElementById('missions-container');
    container.innerHTML = '';
    
    if(!currentUser.missions || currentUser.missions.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No tienes misiones asignadas aún 🎯</p>';
        return;
    }
    
    // Agrupar misiones por tipo
    const missionsByType = {};
    db.missionTypes.forEach(type => {
        missionsByType[type.id] = [];
    });
    
    // Filtrar misiones disponibles (no terminadas ni perdidas)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    currentUser.missions.forEach(mission => {
        if(mission.status === 'Terminada' || mission.status === 'Perdida') return;
        
        // Verificar si la misión está en su rango de fechas
        const startDate = mission.startDate || mission.date;
        const endDate = mission.endDate || mission.date;
        
        if(startDate && todayStr < startDate) return; // No ha empezado
        if(endDate && todayStr > endDate) return; // Ya terminó
        
        // Verificar si la misión está en su rango horario
        if(mission.timeStart && mission.timeEnd) {
            const [startH, startM] = mission.timeStart.split(':').map(Number);
            const [endH, endM] = mission.timeEnd.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;
            
            if(currentTime < startTime || currentTime > endTime) {
                mission.temporarilyUnavailable = true;
            } else {
                mission.temporarilyUnavailable = false;
            }
        }
        
        const type = mission.type || 'special';
        if(missionsByType[type]) {
            missionsByType[type].push(mission);
        }
    });
    
    // Renderizar cada grupo de misiones
    db.missionTypes.forEach(type => {
        const missions = missionsByType[type.id];
        if(missions.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'mission-type-section';
        
        section.innerHTML = `
            <h3 class="mission-type-header">
                <span class="mission-type-icon">${type.icon}</span>
                ${type.name}
                <span class="mission-count">(${missions.length})</span>
            </h3>
            <div class="mission-type-content"></div>
        `;
        
        const content = section.querySelector('.mission-type-content');
        
        missions.forEach(mission => {
            const card = createMissionCard(mission);
            content.appendChild(card);
        });
        
        container.appendChild(section);
    });
}

function createMissionCard(mission) {
    const card = document.createElement('div');
    
    let statusClass = 'espera';
    if(mission.status === 'En proceso') statusClass = 'proceso';
    if(mission.temporarilyUnavailable) statusClass = 'unavailable';
    
    card.className = `card mission-card st-${statusClass}`;
    card.onclick = () => openMissionModal(mission.id);
    
    let timeInfo = '';
    if(mission.timeStart && mission.timeEnd) {
        timeInfo = `<small>🕐 ${mission.timeStart} - ${mission.timeEnd}</small><br>`;
    }
    
    let dateInfo = '';
    if(mission.startDate && mission.endDate) {
        if(mission.startDate === mission.endDate) {
            dateInfo = `<small>📅 ${mission.startDate}</small><br>`;
        } else {
            dateInfo = `<small>📅 ${mission.startDate} a ${mission.endDate}</small><br>`;
        }
    } else if(mission.date) {
        dateInfo = `<small>📅 ${mission.date}</small><br>`;
    }
    
    let statusText = mission.status;
    if(mission.temporarilyUnavailable) {
        statusText = 'Fuera de horario ⏰';
    }
    
    card.innerHTML = `
        <span class="status-indicator status-${statusClass}">${statusText}</span>
        <h4 style="margin: 5px 0;">${mission.title}</h4>
        ${dateInfo}
        ${timeInfo}
        ${mission.isRepeat ? '<small style="color: var(--primary);">🔄 Repetitiva</small><br>' : ''}
        ${mission.description ? `<p style="font-size: 12px; color: #666; margin-top: 5px;">${mission.description}</p>` : ''}
        <div class="mission-rewards">
            ${renderMissionRewards(mission)}
        </div>
    `;
    
    return card;
}

function renderMissionRewards(mission) {
    let html = '<div class="reward-chips">';
    
    for(let superpower in mission.scores) {
        for(let power in mission.scores[superpower]) {
            const points = mission.scores[superpower][power];
            if(points > 0) {
                html += `<span class="reward-chip">💎 ${power}: +${points}</span>`;
            }
        }
    }
    
    html += '</div>';
    return html;
}
