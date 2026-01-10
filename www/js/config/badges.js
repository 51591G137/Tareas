// badges.js - Gestión de logros con múltiples tipos de requisitos

function toggleBadgeRequirements() {
    const type = document.getElementById('badge-req-type').value;
    document.getElementById('badge-total-req').style.display = type === 'total' ? 'block' : 'none';
    document.getElementById('badge-category-req').style.display = type === 'category' ? 'block' : 'none';
    document.getElementById('badge-multiple-req').style.display = type === 'multiple' ? 'block' : 'none';
    document.getElementById('badge-mission-req').style.display = type === 'mission' ? 'block' : 'none';
    document.getElementById('badge-missions-req').style.display = type === 'missions' ? 'block' : 'none';
    document.getElementById('badge-mission-times-req').style.display = type === 'mission-times' ? 'block' : 'none';
    document.getElementById('badge-badges-req').style.display = type === 'badges' ? 'block' : 'none';
}

function toggleEditBadgeRequirements() {
    const type = document.getElementById('edit-badge-req-type').value;
    document.getElementById('edit-badge-total-req').style.display = type === 'total' ? 'block' : 'none';
    document.getElementById('edit-badge-category-req').style.display = type === 'category' ? 'block' : 'none';
    document.getElementById('edit-badge-multiple-req').style.display = type === 'multiple' ? 'block' : 'none';
    document.getElementById('edit-badge-mission-req').style.display = type === 'mission' ? 'block' : 'none';
    document.getElementById('edit-badge-missions-req').style.display = type === 'missions' ? 'block' : 'none';
    document.getElementById('edit-badge-mission-times-req').style.display = type === 'mission-times' ? 'block' : 'none';
    document.getElementById('edit-badge-badges-req').style.display = type === 'badges' ? 'block' : 'none';
}

function addBadge() {
    const name = document.getElementById('badge-name').value.trim();
    const emoji = document.getElementById('badge-emoji').value.trim();
    const reqType = document.getElementById('badge-req-type').value;
    
    if(!name || !emoji) return alert('Completa nombre y emoji');
    
    const badge = {
        id: Date.now(),
        name: name,
        emoji: emoji,
        requirementType: reqType
    };
    
    if(reqType === 'total') {
        const points = parseInt(document.getElementById('badge-total-points').value);
        if(!points || points < 1) return alert('Especifica los puntos totales');
        badge.totalPoints = points;
    } else if(reqType === 'category') {
        const category = document.getElementById('badge-category').value;
        const points = parseInt(document.getElementById('badge-category-points').value);
        if(!points || points < 1) return alert('Especifica los puntos');
        badge.categoryRequirement = { category, points };
    } else if(reqType === 'multiple') {
        const requirements = {};
        document.querySelectorAll('.badge-multi-score').forEach(input => {
            const val = parseInt(input.value) || 0;
            if(val > 0) requirements[input.dataset.cat] = val;
        });
        if(Object.keys(requirements).length === 0) return alert('Especifica al menos un requisito');
        badge.multipleRequirements = requirements;
    } else if(reqType === 'mission') {
        const missionTitle = document.getElementById('badge-mission-title').value.trim();
        const times = parseInt(document.getElementById('badge-mission-times').value) || 1;
        if(!missionTitle) return alert('Especifica el título de la misión');
        badge.missionRequirement = { missionTitle, times };
    } else if(reqType === 'missions') {
        const missionTitles = document.getElementById('badge-missions-titles').value
            .split('\n')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        if(missionTitles.length === 0) return alert('Especifica al menos una misión');
        badge.missionsRequirement = missionTitles;
    } else if(reqType === 'mission-times') {
        const missionTitle = document.getElementById('badge-mission-times-title').value.trim();
        const times = parseInt(document.getElementById('badge-mission-times-count').value);
        if(!missionTitle) return alert('Especifica el título de la misión');
        if(!times || times < 1) return alert('Especifica cuántas veces');
        badge.missionTimesRequirement = { missionTitle, times };
    } else if(reqType === 'badges') {
        const requiredBadges = Array.from(document.querySelectorAll('.req-badge:checked'))
            .map(cb => parseInt(cb.value));
        if(requiredBadges.length === 0) return alert('Selecciona al menos un logro');
        badge.badgesRequirement = requiredBadges;
    }
    
    db.badges.push(badge);
    save();
    
    document.getElementById('badge-name').value = '';
    document.getElementById('badge-emoji').value = '';
    document.getElementById('badge-total-points').value = '';
    document.getElementById('badge-category-points').value = '';
    document.querySelectorAll('.badge-multi-score').forEach(i => i.value = 0);
    document.getElementById('badge-mission-title').value = '';
    document.getElementById('badge-mission-times').value = '1';
    document.getElementById('badge-missions-titles').value = '';
    document.getElementById('badge-mission-times-title').value = '';
    document.getElementById('badge-mission-times-count').value = '';
    document.querySelectorAll('.req-badge').forEach(cb => cb.checked = false);
    
    renderBadgesList();
}

function renderBadgesList() {
    const container = document.getElementById('badges-list');
    container.innerHTML = '';
    
    if(db.badges.length === 0) {
        container.innerHTML = '<p style="color:#999; font-size:12px;">No hay logros creados</p>';
        return;
    }
    
    db.badges.forEach(badge => {
        let reqText = '';
        if(badge.requirementType === 'total') {
            reqText = `Total: ${badge.totalPoints} pts`;
        } else if(badge.requirementType === 'category') {
            reqText = `${badge.categoryRequirement.category}: ${badge.categoryRequirement.points} pts`;
        } else if(badge.requirementType === 'multiple') {
            const reqs = Object.entries(badge.multipleRequirements).map(([cat, pts]) => `${cat}: ${pts}`).join(', ');
            reqText = reqs;
        } else if(badge.requirementType === 'mission') {
            reqText = `Completar: "${badge.missionRequirement.missionTitle}"`;
        } else if(badge.requirementType === 'missions') {
            reqText = `Completar ${badge.missionsRequirement.length} misiones específicas`;
        } else if(badge.requirementType === 'mission-times') {
            reqText = `"${badge.missionTimesRequirement.missionTitle}" ${badge.missionTimesRequirement.times}x`;
        } else if(badge.requirementType === 'badges') {
            reqText = `Desbloquear ${badge.badgesRequirement.length} logros`;
        }
        
        container.innerHTML += `
            <div class="badge-config-item">
                <div class="badge-emoji-display">${badge.emoji}</div>
                <div style="flex: 1;">
                    <strong>${badge.name}</strong><br>
                    <small>${reqText}</small>
                </div>
                <button class="small" style="background: var(--info); width: auto; margin-right: 5px;" onclick="openEditBadgeModal(${badge.id})">Editar</button>
                <button class="danger small" onclick="deleteBadge(${badge.id})">Eliminar</button>
            </div>
        `;
    });
}

function renderBadgesTab() {
    // Selector de superpoder para requisito de categoría
    const badgeCatSelect = document.getElementById('badge-category');
    badgeCatSelect.innerHTML = '';
    db.superpowers.forEach(sp => {
        badgeCatSelect.innerHTML += `<option value="${sp.name}">${sp.name}</option>`;
    });

    // Inputs para requisitos múltiples
    const multiScores = document.getElementById('badge-multiple-scores');
    multiScores.innerHTML = '';
    db.superpowers.forEach(sp => {
        multiScores.innerHTML += `<label>${sp.name} <input type="number" class="badge-multi-score" data-cat="${sp.name}" value="0" min="0"></label>`;
    });
    
    // Lista de logros existentes para requisito de badges
    const badgesList = document.getElementById('badge-badges-list');
    badgesList.innerHTML = '';
    db.badges.forEach(b => {
        badgesList.innerHTML += `
            <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 5px;">
                <input type="checkbox" class="req-badge" value="${b.id}">
                <span>${b.emoji} ${b.name}</span>
            </label>
        `;
    });

    renderBadgesList();
}

let currentEditBadgeId = null;

function openEditBadgeModal(badgeId) {
    currentEditBadgeId = badgeId;
    const badge = db.badges.find(b => b.id === badgeId);
    if(!badge) return;
    
    document.getElementById('edit-badge-name').value = badge.name;
    document.getElementById('edit-badge-emoji').value = badge.emoji;
    document.getElementById('edit-badge-req-type').value = badge.requirementType;
    
    const catSelect = document.getElementById('edit-badge-category');
    catSelect.innerHTML = '';
    db.superpowers.forEach(sp => {
        catSelect.innerHTML += `<option value="${sp.name}">${sp.name}</option>`;
    });
    
    const multiScores = document.getElementById('edit-badge-multiple-scores');
    multiScores.innerHTML = '';
    db.superpowers.forEach(sp => {
        const val = badge.multipleRequirements ? (badge.multipleRequirements[sp.name] || 0) : 0;
        multiScores.innerHTML += `<label>${sp.name} <input type="number" class="edit-badge-multi-score" data-cat="${sp.name}" value="${val}" min="0"></label>`;
    });
    
    const badgesList = document.getElementById('edit-badge-badges-list');
    badgesList.innerHTML = '';
    db.badges.filter(b => b.id !== badgeId).forEach(b => {
        const checked = badge.badgesRequirement && badge.badgesRequirement.includes(b.id) ? 'checked' : '';
        badgesList.innerHTML += `
            <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 5px;">
                <input type="checkbox" class="edit-req-badge" value="${b.id}" ${checked}>
                <span>${b.emoji} ${b.name}</span>
            </label>
        `;
    });
    
    if(badge.requirementType === 'total') {
        document.getElementById('edit-badge-total-points').value = badge.totalPoints || 0;
    } else if(badge.requirementType === 'category') {
        document.getElementById('edit-badge-category').value = badge.categoryRequirement.category;
        document.getElementById('edit-badge-category-points').value = badge.categoryRequirement.points;
    } else if(badge.requirementType === 'mission') {
        document.getElementById('edit-badge-mission-title').value = badge.missionRequirement.missionTitle;
        document.getElementById('edit-badge-mission-times').value = badge.missionRequirement.times || 1;
    } else if(badge.requirementType === 'missions') {
        document.getElementById('edit-badge-missions-titles').value = badge.missionsRequirement.join('\n');
    } else if(badge.requirementType === 'mission-times') {
        document.getElementById('edit-badge-mission-times-title').value = badge.missionTimesRequirement.missionTitle;
        document.getElementById('edit-badge-mission-times-count').value = badge.missionTimesRequirement.times;
    }
    
    toggleEditBadgeRequirements();
    document.getElementById('edit-badge-modal').classList.add('active');
}

function closeEditBadgeModal() {
    document.getElementById('edit-badge-modal').classList.remove('active');
    currentEditBadgeId = null;
}

function saveEditedBadge() {
    const badge = db.badges.find(b => b.id === currentEditBadgeId);
    if(!badge) return;
    
    badge.name = document.getElementById('edit-badge-name').value.trim();
    badge.emoji = document.getElementById('edit-badge-emoji').value.trim();
    badge.requirementType = document.getElementById('edit-badge-req-type').value;
    
    if(!badge.name || !badge.emoji) return alert('Completa nombre y emoji');
    
    // Limpiar requisitos antiguos
    delete badge.totalPoints;
    delete badge.categoryRequirement;
    delete badge.multipleRequirements;
    delete badge.missionRequirement;
    delete badge.missionsRequirement;
    delete badge.missionTimesRequirement;
    delete badge.badgesRequirement;
    
    if(badge.requirementType === 'total') {
        badge.totalPoints = parseInt(document.getElementById('edit-badge-total-points').value);
    } else if(badge.requirementType === 'category') {
        badge.categoryRequirement = {
            category: document.getElementById('edit-badge-category').value,
            points: parseInt(document.getElementById('edit-badge-category-points').value)
        };
    } else if(badge.requirementType === 'multiple') {
        const requirements = {};
        document.querySelectorAll('.edit-badge-multi-score').forEach(input => {
            const val = parseInt(input.value) || 0;
            if(val > 0) requirements[input.dataset.cat] = val;
        });
        badge.multipleRequirements = requirements;
    } else if(badge.requirementType === 'mission') {
        const missionTitle = document.getElementById('edit-badge-mission-title').value.trim();
        const times = parseInt(document.getElementById('edit-badge-mission-times').value) || 1;
        if(!missionTitle) return alert('Especifica el título de la misión');
        badge.missionRequirement = { missionTitle, times };
    } else if(badge.requirementType === 'missions') {
        const missionTitles = document.getElementById('edit-badge-missions-titles').value
            .split('\n')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        if(missionTitles.length === 0) return alert('Especifica al menos una misión');
        badge.missionsRequirement = missionTitles;
    } else if(badge.requirementType === 'mission-times') {
        const missionTitle = document.getElementById('edit-badge-mission-times-title').value.trim();
        const times = parseInt(document.getElementById('edit-badge-mission-times-count').value);
        if(!missionTitle) return alert('Especifica el título de la misión');
        if(!times || times < 1) return alert('Especifica cuántas veces');
        badge.missionTimesRequirement = { missionTitle, times };
    } else if(badge.requirementType === 'badges') {
        const requiredBadges = Array.from(document.querySelectorAll('.edit-req-badge:checked'))
            .map(cb => parseInt(cb.value));
        if(requiredBadges.length === 0) return alert('Selecciona al menos un logro');
        badge.badgesRequirement = requiredBadges;
    }
    
    save();
    closeEditBadgeModal();
    renderBadgesList();
}

function deleteBadge(badgeId) {
    if(!confirm('¿Eliminar este logro?')) return;
    db.badges = db.badges.filter(b => b.id !== badgeId);
    save();
    renderBadgesList();
}

// Función para verificar si un usuario ha desbloqueado un logro
function checkBadgeUnlocked(badge, user) {
    if(!user) return false;
    
    // Inicializar log si no existe
    if(!user.completedMissionsLog) user.completedMissionsLog = [];
    if(!user.unlockedBadges) user.unlockedBadges = [];
    
    if(badge.requirementType === 'mission') {
        // Contar cuántas veces ha completado la misión
        const count = user.completedMissionsLog.filter(log => 
            log.title && log.title.includes(badge.missionRequirement.missionTitle)
        ).length;
        return count >= (badge.missionRequirement.times || 1);
    } else if(badge.requirementType === 'missions') {
        // Verificar que haya completado todas las misiones requeridas
        return badge.missionsRequirement.every(reqTitle => 
            user.completedMissionsLog.some(log => log.title && log.title.includes(reqTitle))
        );
    } else if(badge.requirementType === 'mission-times') {
        // Contar cuántas veces ha completado la misión específica
        const count = user.completedMissionsLog.filter(log => 
            log.title && log.title.includes(badge.missionTimesRequirement.missionTitle)
        ).length;
        return count >= badge.missionTimesRequirement.times;
    } else if(badge.requirementType === 'badges') {
        // Verificar que tenga todos los logros requeridos
        return badge.badgesRequirement.every(reqBadgeId => 
            user.unlockedBadges.includes(reqBadgeId)
        );
    } else if(badge.requirementType === 'total') {
        // Calcular total de puntos (lógica existente)
        let totalPoints = 0;
        let userScores = {};
        db.superpowers.forEach(sp => {
            userScores[sp.name] = {};
            sp.powers.forEach(p => {
                userScores[sp.name][p] = 0;
            });
        });
        
        if(user.missions) {
            user.missions.forEach(mission => {
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
        
        if(user.powerScores) {
            for(let sp in user.powerScores) {
                for(let power in user.powerScores[sp]) {
                    if(!userScores[sp]) userScores[sp] = {};
                    if(!userScores[sp][power]) userScores[sp][power] = 0;
                    userScores[sp][power] += user.powerScores[sp][power];
                }
            }
        }
        
        for(let sp in userScores) {
            for(let power in userScores[sp]) {
                totalPoints += userScores[sp][power];
            }
        }
        
        return totalPoints >= badge.totalPoints;
    } else if(badge.requirementType === 'category') {
        // Lógica de categoría existente
        let categoryPoints = 0;
        let userScores = {};
        db.superpowers.forEach(sp => {
            userScores[sp.name] = {};
            sp.powers.forEach(p => {
                userScores[sp.name][p] = 0;
            });
        });
        
        if(user.missions) {
            user.missions.forEach(mission => {
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
        
        if(user.powerScores) {
            for(let sp in user.powerScores) {
                for(let power in user.powerScores[sp]) {
                    if(!userScores[sp]) userScores[sp] = {};
                    if(!userScores[sp][power]) userScores[sp][power] = 0;
                    userScores[sp][power] += user.powerScores[sp][power];
                }
            }
        }
        
        if(userScores[badge.categoryRequirement.category]) {
            for(let power in userScores[badge.categoryRequirement.category]) {
                categoryPoints += userScores[badge.categoryRequirement.category][power];
            }
        }
        
        return categoryPoints >= badge.categoryRequirement.points;
    } else if(badge.requirementType === 'multiple') {
        // Lógica de múltiples categorías existente
        let userScores = {};
        db.superpowers.forEach(sp => {
            userScores[sp.name] = {};
            sp.powers.forEach(p => {
                userScores[sp.name][p] = 0;
            });
        });
        
        if(user.missions) {
            user.missions.forEach(mission => {
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
        
        if(user.powerScores) {
            for(let sp in user.powerScores) {
                for(let power in user.powerScores[sp]) {
                    if(!userScores[sp]) userScores[sp] = {};
                    if(!userScores[sp][power]) userScores[sp][power] = 0;
                    userScores[sp][power] += user.powerScores[sp][power];
                }
            }
        }
        
        return Object.entries(badge.multipleRequirements).every(([cat, req]) => {
            let catPoints = 0;
            if(userScores[cat]) {
                for(let power in userScores[cat]) {
                    catPoints += userScores[cat][power];
                }
            }
            return catPoints >= req;
        });
    }
    
    return false;
}
// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Si la pestaña de logros está visible al cargar, renderizarla
    setTimeout(() => {
        const badgesTab = document.getElementById('tab-badges');
        if (badgesTab && badgesTab.style.display !== 'none') {
            renderBadgesTab();
        }
    }, 100);
});