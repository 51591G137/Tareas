// badges.js - Gestión de insignias

function toggleBadgeRequirements() {
    const type = document.getElementById('badge-req-type').value;
    document.getElementById('badge-total-req').style.display = type === 'total' ? 'block' : 'none';
    document.getElementById('badge-category-req').style.display = type === 'category' ? 'block' : 'none';
    document.getElementById('badge-multiple-req').style.display = type === 'multiple' ? 'block' : 'none';
}

function toggleEditBadgeRequirements() {
    const type = document.getElementById('edit-badge-req-type').value;
    document.getElementById('edit-badge-total-req').style.display = type === 'total' ? 'block' : 'none';
    document.getElementById('edit-badge-category-req').style.display = type === 'category' ? 'block' : 'none';
    document.getElementById('edit-badge-multiple-req').style.display = type === 'multiple' ? 'block' : 'none';
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
    }
    
    db.badges.push(badge);
    save();
    
    document.getElementById('badge-name').value = '';
    document.getElementById('badge-emoji').value = '';
    document.getElementById('badge-total-points').value = '';
    document.getElementById('badge-category-points').value = '';
    document.querySelectorAll('.badge-multi-score').forEach(i => i.value = 0);
    
    renderBadgesList();
}

function renderBadgesList() {
    const container = document.getElementById('badges-list');
    container.innerHTML = '';
    
    if(db.badges.length === 0) {
        container.innerHTML = '<p style="color:#999; font-size:12px;">No hay insignias creadas</p>';
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
    const badgeCatSelect = document.getElementById('badge-category');
    badgeCatSelect.innerHTML = '';
    db.categories.forEach(cat => {
        badgeCatSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    const multiScores = document.getElementById('badge-multiple-scores');
    multiScores.innerHTML = '';
    db.categories.forEach(cat => {
        multiScores.innerHTML += `<label>${cat} <input type="number" class="badge-multi-score" data-cat="${cat}" value="0" min="0"></label>`;
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
    db.categories.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
    
    const multiScores = document.getElementById('edit-badge-multiple-scores');
    multiScores.innerHTML = '';
    db.categories.forEach(cat => {
        const val = badge.multipleRequirements ? (badge.multipleRequirements[cat] || 0) : 0;
        multiScores.innerHTML += `<label>${cat} <input type="number" class="edit-badge-multi-score" data-cat="${cat}" value="${val}" min="0"></label>`;
    });
    
    if(badge.requirementType === 'total') {
        document.getElementById('edit-badge-total-points').value = badge.totalPoints || 0;
    } else if(badge.requirementType === 'category') {
        document.getElementById('edit-badge-category').value = badge.categoryRequirement.category;
        document.getElementById('edit-badge-category-points').value = badge.categoryRequirement.points;
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
    
    if(badge.requirementType === 'total') {
        badge.totalPoints = parseInt(document.getElementById('edit-badge-total-points').value);
        delete badge.categoryRequirement;
        delete badge.multipleRequirements;
    } else if(badge.requirementType === 'category') {
        badge.categoryRequirement = {
            category: document.getElementById('edit-badge-category').value,
            points: parseInt(document.getElementById('edit-badge-category-points').value)
        };
        delete badge.totalPoints;
        delete badge.multipleRequirements;
    } else if(badge.requirementType === 'multiple') {
        const requirements = {};
        document.querySelectorAll('.edit-badge-multi-score').forEach(input => {
            const val = parseInt(input.value) || 0;
            if(val > 0) requirements[input.dataset.cat] = val;
        });
        badge.multipleRequirements = requirements;
        delete badge.totalPoints;
        delete badge.categoryRequirement;
    }
    
    save();
    closeEditBadgeModal();
    renderBadgesList();
}

function deleteBadge(badgeId) {
    if(!confirm('¿Eliminar esta insignia?')) return;
    db.badges = db.badges.filter(b => b.id !== badgeId);
    save();
    renderBadgesList();
}