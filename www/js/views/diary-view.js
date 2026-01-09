// ========================================
// DIARIO DEL HÉROE
// ========================================

function renderDiary() {
    const container = document.getElementById('diary-container');
    container.innerHTML = '';
    
    if(!currentUser.missions || currentUser.missions.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">Aún no hay entradas en tu diario 📖</p>';
        return;
    }
    
    // Filtrar misiones con fecha
    const datedMissions = currentUser.missions
        .filter(m => m.date || m.startDate)
        .sort((a, b) => {
            const dateA = a.date || a.startDate;
            const dateB = b.date || b.startDate;
            return new Date(dateB) - new Date(dateA);
        });
    
    if(datedMissions.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No hay misiones con fecha asignada</p>';
        return;
    }
    
    // Agrupar por fecha
    let currentDate = '';
    let dayContainer = null;
    
    datedMissions.forEach(mission => {
        const missionDate = mission.date || mission.startDate;
        
        if(missionDate !== currentDate) {
            currentDate = missionDate;
            const dateObj = new Date(missionDate + 'T00:00:00');
            const dayName = dayNames[dateObj.getDay()];
            
            dayContainer = document.createElement('div');
            dayContainer.className = 'diary-day';
            
            dayContainer.innerHTML = `
                <h4 class="diary-date">📅 ${missionDate} - ${dayName}</h4>
                <div class="diary-missions"></div>
            `;
            
            container.appendChild(dayContainer);
        }
        
        const missionsContainer = dayContainer.querySelector('.diary-missions');
        const missionCard = createDiaryMissionCard(mission);
        missionsContainer.appendChild(missionCard);
    });
}

function createDiaryMissionCard(mission) {
    const card = document.createElement('div');
    
    let statusClass = 'espera';
    let statusIcon = '⏳';
    let statusText = mission.status;
    
    if(mission.status === 'En proceso') {
        statusClass = 'proceso';
        statusIcon = '🔄';
    } else if(mission.status === 'Terminada') {
        statusClass = 'terminada';
        statusIcon = '✅';
    } else if(mission.status === 'Perdida') {
        statusClass = 'perdida';
        statusIcon = '❌';
    }
    
    card.className = `diary-mission-card st-${statusClass}`;
    
    let timeInfo = '';
    if(mission.timeStart && mission.timeEnd) {
        timeInfo = `<div class="diary-time">🕐 ${mission.timeStart} - ${mission.timeEnd}</div>`;
    }
    
    card.innerHTML = `
        <div class="diary-mission-header">
            <span class="diary-status-icon">${statusIcon}</span>
            <strong>${mission.title}</strong>
        </div>
        ${timeInfo}
        ${mission.description ? `<p class="diary-description">${mission.description}</p>` : ''}
        <div class="diary-mission-footer">
            <span class="diary-status">${statusText}</span>
            ${mission.isRepeat ? '<span class="diary-repeat">🔄 Repetitiva</span>' : ''}
        </div>
    `;
    
    return card;
}