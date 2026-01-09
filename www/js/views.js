// views.js - Renderizado de vistas del usuario
const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dayNamesShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function showView(viewId) {
    document.querySelectorAll('#main-app .screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active');
    
    const titles = {
        'view-missions': 'Radar de Misiones - ' + currentUser.name,
        'view-powers': 'Galería de Poderes - ' + currentUser.name,
        'view-achievements': 'Logros - ' + currentUser.name,
        'view-diary': 'Diario del Héroe - ' + currentUser.name
    };
    document.getElementById('user-title').innerText = titles[viewId] || currentUser.name;
    
    const btnIndex = ['view-missions', 'view-powers', 'view-achievements', 'view-diary'].indexOf(viewId);
    if(btnIndex >= 0) {
        document.querySelectorAll('.nav-btn')[btnIndex].classList.add('active');
    }

    if(viewId === 'view-missions') renderMissions();
    if(viewId === 'view-powers') renderPowersTree();
    if(viewId === 'view-achievements') renderAchievements();
    if(viewId === 'view-diary') renderDiary();
}

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

// ========================================
// GALERÍA DE PODERES - ÁRBOL RADIAL
// ========================================

function renderPowersTree() {
    const container = document.getElementById('powers-container');
    container.innerHTML = '';
    
    // Calcular puntuaciones totales
    let userScores = {};
    db.superpowers.forEach(sp => {
        userScores[sp.name] = {};
        sp.powers.forEach(p => {
            userScores[sp.name][p] = 0;
        });
    });

    // Sumar puntos de misiones completadas
    if(currentUser.missions) {
        currentUser.missions.forEach(mission => {
            if(mission.status === 'Terminada') {
                for(let sp in mission.scores) {
                    for(let power in mission.scores[sp]) {
                        if(!userScores[sp]) userScores[sp] = {};
                        if(!userScores[sp][power]) userScores[sp][power] = 0;
                        userScores[sp][power] += mission.scores[sp][power];
                    }
                }
            }
        });
    }

    // Sumar puntos manuales
    if(currentUser.powerScores) {
        for(let sp in currentUser.powerScores) {
            for(let power in currentUser.powerScores[sp]) {
                if(!userScores[sp]) userScores[sp] = {};
                if(!userScores[sp][power]) userScores[sp][power] = 0;
                userScores[sp][power] += currentUser.powerScores[sp][power];
            }
        }
    }

    // Crear el SVG del árbol
    const treeContainer = document.createElement('div');
    treeContainer.className = 'power-tree-container';
    treeContainer.innerHTML = `
        <div class="tree-legend">
            <p style="text-align: center; color: #666; font-size: 13px; margin-bottom: 15px;">
                🌱 Tu árbol de poderes crece con cada misión completada
            </p>
        </div>
        <svg id="power-tree-svg" viewBox="0 0 800 800" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
        </svg>
        <div id="power-details" style="margin-top: 20px;"></div>
    `;
    
    container.appendChild(treeContainer);
    
    // Dibujar el árbol
    drawPowerTree(userScores);
}

function drawPowerTree(userScores) {
    const svg = document.getElementById('power-tree-svg');
    const centerX = 400;
    const centerY = 400;
    
    // Calcular total de puntos
    let totalPoints = 0;
    for(let sp in userScores) {
        for(let power in userScores[sp]) {
            totalPoints += userScores[sp][power];
        }
    }
    
    // Tamaño del tronco basado en puntos totales
    const trunkHeight = Math.min(80 + totalPoints * 0.5, 200);
    const trunkWidth = 20 + totalPoints * 0.1;
    
    // Dibujar tronco central
    const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    trunk.setAttribute('x', centerX - trunkWidth/2);
    trunk.setAttribute('y', centerY);
    trunk.setAttribute('width', trunkWidth);
    trunk.setAttribute('height', trunkHeight);
    trunk.setAttribute('fill', '#8B4513');
    trunk.setAttribute('rx', '5');
    trunk.classList.add('tree-trunk');
    svg.appendChild(trunk);
    
    // Calcular ángulos para distribuir los superpoderes
    const superpowers = db.superpowers;
    const angleStep = (2 * Math.PI) / superpowers.length;
    
    // Colores para cada superpoder
    const colors = [
        '#667eea', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#30cfd0',
        '#a8edea', '#fed6e3', '#c471f5'
    ];
    
    // Dibujar cada superpoder como rama principal
    superpowers.forEach((sp, spIndex) => {
        const angle = angleStep * spIndex - Math.PI/2; // Empezar desde arriba
        
        // Calcular puntos totales del superpoder
        let spTotalPoints = 0;
        sp.powers.forEach(power => {
            spTotalPoints += userScores[sp.name][power] || 0;
        });
        
        // Longitud de la rama principal basada en puntos
        const mainBranchLength = 80 + spTotalPoints * 0.8;
        const mainBranchEndX = centerX + Math.cos(angle) * mainBranchLength;
        const mainBranchEndY = centerY + Math.sin(angle) * mainBranchLength;
        
        // Dibujar rama principal (superpoder)
        const mainBranch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mainBranch.setAttribute('x1', centerX);
        mainBranch.setAttribute('y1', centerY);
        mainBranch.setAttribute('x2', mainBranchEndX);
        mainBranch.setAttribute('y2', mainBranchEndY);
        mainBranch.setAttribute('stroke', colors[spIndex % colors.length]);
        mainBranch.setAttribute('stroke-width', 8 + spTotalPoints * 0.15);
        mainBranch.setAttribute('stroke-linecap', 'round');
        mainBranch.classList.add('tree-branch', 'main-branch');
        svg.appendChild(mainBranch);
        
        // Círculo en el extremo de la rama principal
        const mainCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        mainCircle.setAttribute('cx', mainBranchEndX);
        mainCircle.setAttribute('cy', mainBranchEndY);
        mainCircle.setAttribute('r', 15 + spTotalPoints * 0.1);
        mainCircle.setAttribute('fill', colors[spIndex % colors.length]);
        mainCircle.classList.add('tree-node', 'superpower-node');
        svg.appendChild(mainCircle);
        
        // Texto del superpoder
        const mainText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mainText.setAttribute('x', mainBranchEndX);
        mainText.setAttribute('y', mainBranchEndY + 5);
        mainText.setAttribute('text-anchor', 'middle');
        mainText.setAttribute('fill', 'white');
        mainText.setAttribute('font-size', '12');
        mainText.setAttribute('font-weight', 'bold');
        mainText.textContent = spTotalPoints;
        svg.appendChild(mainText);
        
        // Dibujar sub-ramas (poderes)
        sp.powers.forEach((power, powerIndex) => {
            const powerPoints = userScores[sp.name][power] || 0;
            if(powerPoints === 0) return; // No dibujar si no tiene puntos
            
            // Calcular ángulo de la sub-rama
            const subAngleOffset = (powerIndex - (sp.powers.length - 1) / 2) * 0.4;
            const subAngle = angle + subAngleOffset;
            
            // Longitud de la sub-rama basada en puntos
            const subBranchLength = 40 + powerPoints * 0.6;
            const subBranchEndX = mainBranchEndX + Math.cos(subAngle) * subBranchLength;
            const subBranchEndY = mainBranchEndY + Math.sin(subAngle) * subBranchLength;
            
            // Dibujar sub-rama
            const subBranch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            subBranch.setAttribute('x1', mainBranchEndX);
            subBranch.setAttribute('y1', mainBranchEndY);
            subBranch.setAttribute('x2', subBranchEndX);
            subBranch.setAttribute('y2', subBranchEndY);
            subBranch.setAttribute('stroke', colors[spIndex % colors.length]);
            subBranch.setAttribute('stroke-width', 3 + powerPoints * 0.1);
            subBranch.setAttribute('stroke-linecap', 'round');
            subBranch.setAttribute('opacity', '0.8');
            subBranch.classList.add('tree-branch', 'sub-branch');
            svg.appendChild(subBranch);
            
            // Hoja en el extremo de la sub-rama
            const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            leaf.setAttribute('cx', subBranchEndX);
            leaf.setAttribute('cy', subBranchEndY);
            leaf.setAttribute('r', 8 + powerPoints * 0.08);
            leaf.setAttribute('fill', colors[spIndex % colors.length]);
            leaf.setAttribute('opacity', '0.9');
            leaf.classList.add('tree-leaf');
            
            // Tooltip con información del poder
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${power}: ${powerPoints} pts`;
            leaf.appendChild(title);
            
            svg.appendChild(leaf);
        });
        
        // Etiqueta del superpoder fuera del círculo
        const labelDistance = mainBranchLength + 40;
        const labelX = centerX + Math.cos(angle) * labelDistance;
        const labelY = centerY + Math.sin(angle) * labelDistance;
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', colors[spIndex % colors.length]);
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', 'bold');
        label.textContent = sp.name;
        svg.appendChild(label);
    });
    
    // Añadir nivel del árbol en el centro
    const level = Math.floor(totalPoints / 50) + 1;
    const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerLabel.setAttribute('x', centerX);
    centerLabel.setAttribute('y', centerY + trunkHeight + 30);
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('fill', '#8B4513');
    centerLabel.setAttribute('font-size', '16');
    centerLabel.setAttribute('font-weight', 'bold');
    centerLabel.textContent = `🌳 Nivel ${level}`;
    svg.appendChild(centerLabel);
    
    // Añadir detalles debajo del árbol
    renderPowerDetails(userScores);
}

function renderPowerDetails(userScores) {
    const container = document.getElementById('power-details');
    container.innerHTML = '<h4 style="text-align: center; margin-bottom: 15px;">Detalle de Poderes</h4>';
    
    db.superpowers.forEach((sp, spIndex) => {
        let spTotal = 0;
        sp.powers.forEach(power => {
            spTotal += userScores[sp.name][power] || 0;
        });
        
        if(spTotal === 0) return; // No mostrar si no tiene puntos
        
        const spDetail = document.createElement('div');
        spDetail.className = 'power-detail-card';
        spDetail.innerHTML = `
            <h5 style="margin-bottom: 10px;">${sp.name} <span style="color: var(--success);">(${spTotal} pts)</span></h5>
            <div class="power-detail-list"></div>
        `;
        
        const list = spDetail.querySelector('.power-detail-list');
        sp.powers.forEach(power => {
            const points = userScores[sp.name][power] || 0;
            if(points === 0) return;
            
            list.innerHTML += `
                <div class="power-detail-item">
                    <span>⚡ ${power}</span>
                    <span style="font-weight: bold;">${points} pts</span>
                </div>
            `;
        });
        
        container.appendChild(spDetail);
    });
}

// ========================================
// LOGROS Y RECONOCIMIENTOS
// ========================================

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    
    if(db.badges.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:40px;">No hay logros configurados aún 🏆</p>';
        return;
    }

    // Calcular puntuaciones del usuario
    let userScores = {};
    db.superpowers.forEach(sp => {
        userScores[sp.name] = {};
        sp.powers.forEach(p => {
            userScores[sp.name][p] = 0;
        });
    });

    if(currentUser.missions) {
        currentUser.missions.forEach(mission => {
            if(mission.status === 'Terminada') {
                for(let sp in mission.scores) {
                    for(let power in mission.scores[sp]) {
                        if(!userScores[sp]) userScores[sp] = {};
                        if(!userScores[sp][power]) userScores[sp][power] = 0;
                        userScores[sp][power] += mission.scores[sp][power];
                    }
                }
            }
        });
    }

    if(currentUser.powerScores) {
        for(let sp in currentUser.powerScores) {
            for(let power in currentUser.powerScores[sp]) {
                if(!userScores[sp]) userScores[sp] = {};
                if(!userScores[sp][power]) userScores[sp][power] = 0;
                userScores[sp][power] += currentUser.powerScores[sp][power];
            }
        }
    }

    // Calcular total de puntos
    let totalPoints = 0;
    for(let sp in userScores) {
        for(let power in userScores[sp]) {
            totalPoints += userScores[sp][power];
        }
    }

    container.innerHTML = '<div class="badges-grid"></div>';
    const grid = container.querySelector('.badges-grid');

    db.badges.forEach(badge => {
        let unlocked = false;
        let progressText = '';
        
        if(badge.requirementType === 'total') {
            unlocked = totalPoints >= badge.totalPoints;
            progressText = unlocked ? '🎉 Desbloqueado' : `${totalPoints}/${badge.totalPoints} pts`;
        } else if(badge.requirementType === 'category') {
            // Adaptado para superpoderes
            let categoryPoints = 0;
            if(userScores[badge.categoryRequirement.category]) {
                for(let power in userScores[badge.categoryRequirement.category]) {
                    categoryPoints += userScores[badge.categoryRequirement.category][power];
                }
            }
            unlocked = categoryPoints >= badge.categoryRequirement.points;
            progressText = unlocked ? '🎉 Desbloqueado' : `${categoryPoints}/${badge.categoryRequirement.points} pts en ${badge.categoryRequirement.category}`;
        } else if(badge.requirementType === 'multiple') {
            unlocked = Object.entries(badge.multipleRequirements).every(([cat, req]) => {
                let catPoints = 0;
                if(userScores[cat]) {
                    for(let power in userScores[cat]) {
                        catPoints += userScores[cat][power];
                    }
                }
                return catPoints >= req;
            });
            if(!unlocked) {
                const progress = Object.entries(badge.multipleRequirements).map(([cat, req]) => {
                    let current = 0;
                    if(userScores[cat]) {
                        for(let power in userScores[cat]) {
                            current += userScores[cat][power];
                        }
                    }
                    return `${cat}: ${current}/${req}`;
                }).join(', ');
                progressText = progress;
            } else {
                progressText = '🎉 Desbloqueado';
            }
        }
        
        const badgeCard = document.createElement('div');
        badgeCard.className = 'badge-item';
        
        badgeCard.innerHTML = `
            <div class="badge-image ${unlocked ? 'unlocked' : 'locked'}">
                ${badge.emoji}
            </div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-progress">${progressText}</div>
        `;
        
        grid.appendChild(badgeCard);
    });
}

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