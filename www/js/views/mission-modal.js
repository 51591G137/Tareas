// ========================================
// MODAL DE MISIÓN
// ========================================

let currentMissionId = null;

function openMissionModal(missionId) {
    currentMissionId = missionId;
    const mission = currentUser.missions.find(m => m.id === missionId);
    if(!mission) return;
    
    // Si la misión está fuera de horario, no permitir interacción
    if(mission.temporarilyUnavailable) {
        alert('⏰ Esta misión solo está disponible en el horario especificado.');
        return;
    }
    
    document.getElementById('mission-modal-title').innerText = mission.title;
    document.getElementById('mission-modal-description').innerText = mission.description || 'Sin descripción';
    document.getElementById('mission-modal-select-msg').innerText = mission.selectMessage || '¡Excelente elección, héroe! 🦸';
    
    // Mostrar recompensas
    let rewardsHtml = '';
    for(let sp in mission.scores) {
        for(let power in mission.scores[sp]) {
            const points = mission.scores[sp][power];
            if(points > 0) {
                rewardsHtml += `<div class="reward-item">💎 ${power}: +${points} pts</div>`;
            }
        }
    }
    document.getElementById('mission-modal-rewards').innerHTML = rewardsHtml || '<p style="color:#999;">Sin recompensas</p>';
    
    document.getElementById('mission-modal').classList.add('active');
}

function closeMissionModal() {
    document.getElementById('mission-modal').classList.remove('active');
    currentMissionId = null;
}

function startMission() {
    if(!currentMissionId) return;
    
    const mission = currentUser.missions.find(m => m.id === currentMissionId);
    if(!mission) return;
    
    mission.status = 'En proceso';
    save();
    
    closeMissionModal();
    renderMissions();
    renderDiary();
    alert(mission.selectMessage || '¡Misión en marcha! 🚀');
}

function completeMission() {
    if(!currentMissionId) return;
    
    const mission = currentUser.missions.find(m => m.id === currentMissionId);
    if(!mission) return;
    
    mission.status = 'Terminada';
    
    // Registrar en el log de misiones completadas
    logCompletedMission(mission);
    
    // Generar siguiente tarea repetitiva si aplica
    if(mission.isRepeat && mission.repeatDays) {
        generateNextRepeatingMission(mission);
    }
    
    save();
    closeMissionModal();
    renderMissions();
    renderPowersTree();
    renderAchievements();
    renderDiary();
    
    alert(mission.completeMessage || '¡Misión cumplida! Has ganado experiencia 🌟');
}

function generateNextRepeatingMission(completedMission) {
    const futureMissions = currentUser.missions.filter(m => 
        m.groupId === completedMission.groupId && 
        (m.status === 'En espera' || m.status === 'En proceso') &&
        m.id !== completedMission.id
    );
    
    if(futureMissions.length >= 3) return;
    
    const missionDate = new Date((completedMission.date || completedMission.startDate) + 'T00:00:00');
    let nextDate = new Date(missionDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    let found = false;
    let attempts = 0;
    
    while(!found && attempts < 30) {
        if(completedMission.repeatDays.includes(nextDate.getDay())) {
            const nextDateStr = nextDate.toISOString().split('T')[0];
            
            const exists = currentUser.missions.some(m => 
                m.groupId === completedMission.groupId && 
                (m.date === nextDateStr || m.startDate === nextDateStr)
            );
            
            if(!exists) {
                const newMissionId = Date.now() + Math.random();
                const newMission = {
                    id: newMissionId,
                    groupId: completedMission.groupId,
                    title: `${completedMission.baseTitle}`,
                    baseTitle: completedMission.baseTitle,
                    description: completedMission.description,
                    type: completedMission.type,
                    date: nextDateStr,
                    startDate: nextDateStr,
                    endDate: nextDateStr,
                    timeStart: completedMission.timeStart,
                    timeEnd: completedMission.timeEnd,
                    status: 'En espera',
                    scores: completedMission.scores,
                    isRepeat: true,
                    repeatDays: completedMission.repeatDays,
                    userId: currentUser.id,
                    selectMessage: completedMission.selectMessage,
                    completeMessage: completedMission.completeMessage
                };
                
                currentUser.missions.push(newMission);
                
                const userIndex = db.users.findIndex(u => u.id === currentUser.id);
                db.users[userIndex] = currentUser;
                
                found = true;
            }
        }
        nextDate.setDate(nextDate.getDate() + 1);
        attempts++;
    }
}