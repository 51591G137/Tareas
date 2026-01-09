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