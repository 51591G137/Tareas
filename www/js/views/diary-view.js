// ========================================
// DIARIO DEL HÉROE - Vista de resumen temporal
// ========================================

function renderDiary() {
    const container = document.getElementById('diary-container');
    container.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px;">📖 Mi Diario de Héroe</h3>';
    
    if(!currentUser.completedMissionsLog) currentUser.completedMissionsLog = [];
    if(!currentUser.unlockedBadges) currentUser.unlockedBadges = [];
    
    // Obtener fechas clave
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Filtrar eventos por período
    const last3Days = filterEventsByPeriod(currentUser, threeDaysAgo, now);
    const lastWeek = filterEventsByPeriod(currentUser, oneWeekAgo, now);
    const olderEvents = filterEventsByPeriod(currentUser, new Date('2020-01-01'), oneWeekAgo);
    
    // Renderizar secciones
    container.innerHTML += renderDiarySection('🌟 Últimos 3 días', last3Days, 'recent');
    container.innerHTML += renderDiarySection('📅 Última semana', lastWeek, 'week');
    container.innerHTML += renderDiarySection('📚 Meses anteriores', olderEvents, 'old');
}

function filterEventsByPeriod(user, startDate, endDate) {
    const events = [];
    
    // Filtrar misiones completadas
    if(user.completedMissionsLog) {
        user.completedMissionsLog.forEach(log => {
            if(log.completedAt) {
                const logDate = new Date(log.completedAt);
                if(logDate >= startDate && logDate <= endDate) {
                    events.push({
                        type: 'mission',
                        date: logDate,
                        data: log
                    });
                }
            }
        });
    }
    
    // Filtrar logros desbloqueados
    if(user.unlockedBadges) {
        user.unlockedBadges.forEach(badgeId => {
            const badge = db.badges.find(b => b.id === badgeId);
            if(badge && badge.unlockedAt) {
                const badgeDate = new Date(badge.unlockedAt);
                if(badgeDate >= startDate && badgeDate <= endDate) {
                    events.push({
                        type: 'badge',
                        date: badgeDate,
                        data: badge
                    });
                }
            }
        });
    }
    
    // Ordenar por fecha descendente
    events.sort((a, b) => b.date - a.date);
    
    return events;
}

function renderDiarySection(title, events, sectionClass) {
    if(events.length === 0) {
        return `
            <div class="diary-section ${sectionClass}">
                <h4 class="diary-section-title">${title}</h4>
                <p style="text-align: center; color: #999; padding: 20px;">
                    No hay eventos registrados en este período
                </p>
            </div>
        `;
    }
    
    // Agrupar eventos por fecha
    const groupedByDate = {};
    events.forEach(event => {
        const dateKey = event.date.toISOString().split('T')[0];
        if(!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(event);
    });
    
    let html = `
        <div class="diary-section ${sectionClass}">
            <h4 class="diary-section-title">${title}</h4>
    `;
    
    // Renderizar cada día
    Object.keys(groupedByDate).sort().reverse().forEach(dateKey => {
        const dayEvents = groupedByDate[dateKey];
        const date = new Date(dateKey + 'T00:00:00');
        const dayName = dayNames[date.getDay()];
        const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
        
        html += `
            <div class="diary-day-entry">
                <div class="diary-day-header">
                    <span class="diary-day-icon">📆</span>
                    <div>
                        <strong>${dayName}</strong><br>
                        <small>${formattedDate}</small>
                    </div>
                </div>
                <div class="diary-day-content">
        `;
        
        // Contar misiones y logros del día
        const missions = dayEvents.filter(e => e.type === 'mission');
        const badges = dayEvents.filter(e => e.type === 'badge');
        
        html += `
            <div class="diary-day-summary">
                <span>✅ ${missions.length} misión${missions.length !== 1 ? 'es' : ''} completada${missions.length !== 1 ? 's' : ''}</span>
                ${badges.length > 0 ? `<span>🏆 ${badges.length} logro${badges.length !== 1 ? 's' : ''} desbloqueado${badges.length !== 1 ? 's' : ''}</span>` : ''}
            </div>
        `;
        
        // Renderizar misiones
        if(missions.length > 0) {
            html += '<div class="diary-missions-list">';
            missions.forEach(event => {
                const mission = event.data;
                const time = event.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                
                // Calcular puntos ganados
                let totalPoints = 0;
                let pointsBreakdown = [];
                if(mission.scores) {
                    for(let sp in mission.scores) {
                        for(let power in mission.scores[sp]) {
                            const points = mission.scores[sp][power];
                            if(points > 0) {
                                totalPoints += points;
                                pointsBreakdown.push(`${power}: +${points}`);
                            }
                        }
                    }
                }
                
                html += `
                    <div class="diary-mission-entry">
                        <div class="diary-mission-header">
                            <span class="diary-mission-icon">✨</span>
                            <strong>${mission.title}</strong>
                            <span class="diary-mission-time">${time}</span>
                        </div>
                        ${mission.description ? `<p class="diary-mission-desc">${mission.description}</p>` : ''}
                        ${totalPoints > 0 ? `
                            <div class="diary-mission-rewards">
                                <span class="diary-points-total">💎 +${totalPoints} puntos</span>
                                <small class="diary-points-detail">${pointsBreakdown.join(', ')}</small>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Renderizar logros
        if(badges.length > 0) {
            html += '<div class="diary-badges-list">';
            badges.forEach(event => {
                const badge = event.data;
                const time = event.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                
                html += `
                    <div class="diary-badge-entry">
                        <span class="diary-badge-icon">${badge.emoji}</span>
                        <div class="diary-badge-info">
                            <strong>¡Logro desbloqueado!</strong>
                            <p>${badge.name}</p>
                        </div>
                        <span class="diary-badge-time">${time}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// Función auxiliar para registrar misión completada
function logCompletedMission(mission) {
    if(!currentUser.completedMissionsLog) currentUser.completedMissionsLog = [];
    
    currentUser.completedMissionsLog.push({
        title: mission.title,
        description: mission.description,
        type: mission.type,
        scores: mission.scores,
        completedAt: new Date().toISOString()
    });
    
    // Verificar si se desbloquearon nuevos logros
    checkAndUnlockBadges();
    
    save();
}

// Función para verificar y desbloquear logros
function checkAndUnlockBadges() {
    if(!currentUser.unlockedBadges) currentUser.unlockedBadges = [];
    
    db.badges.forEach(badge => {
        // Si ya está desbloqueado, saltar
        if(currentUser.unlockedBadges.includes(badge.id)) return;
        
        // Verificar si cumple los requisitos
        if(checkBadgeUnlocked(badge, currentUser)) {
            currentUser.unlockedBadges.push(badge.id);
            badge.unlockedAt = new Date().toISOString();
            
            // Notificar al usuario
            setTimeout(() => {
                alert(`🎉 ¡Logro desbloqueado!\n\n${badge.emoji} ${badge.name}`);
            }, 500);
        }
    });
    
    save();
}