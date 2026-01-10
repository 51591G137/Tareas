// superpowers.js - Gestión de superpoderes y poderes

// Funciones de movimiento para reordenar
function moveSuperpowerUp(index) {
    if (index <= 0) return;
    
    // Intercambiar posiciones
    const temp = db.superpowers[index - 1];
    db.superpowers[index - 1] = db.superpowers[index];
    db.superpowers[index] = temp;
    
    save();
    renderSuperpowersTab();
}

function moveSuperpowerDown(index) {
    if (index >= db.superpowers.length - 1) return;
    
    // Intercambiar posiciones
    const temp = db.superpowers[index + 1];
    db.superpowers[index + 1] = db.superpowers[index];
    db.superpowers[index] = temp;
    
    save();
    renderSuperpowersTab();
}

function movePowerUp(spIndex, powerIndex) {
    if (powerIndex <= 0) return;
    
    // Intercambiar posiciones
    const powers = db.superpowers[spIndex].powers;
    const temp = powers[powerIndex - 1];
    powers[powerIndex - 1] = powers[powerIndex];
    powers[powerIndex] = temp;
    
    save();
    renderSuperpowersTab();
}

function movePowerDown(spIndex, powerIndex) {
    if (powerIndex >= db.superpowers[spIndex].powers.length - 1) return;
    
    // Intercambiar posiciones
    const powers = db.superpowers[spIndex].powers;
    const temp = powers[powerIndex + 1];
    powers[powerIndex + 1] = powers[powerIndex];
    powers[powerIndex] = temp;
    
    save();
    renderSuperpowersTab();
}

// Funciones principales de gestión
function addSuperpower() {
    const input = document.getElementById('new-superpower');
    const newSp = input.value.trim();
    
    if(!newSp) return alert('Escribe el nombre del superpoder');
    if(db.superpowers.some(sp => sp.name === newSp)) return alert('Este superpoder ya existe');
    
    db.superpowers.push({
        name: newSp,
        powers: ['Nivel 1', 'Nivel 2', 'Nivel 3']
    });
    
    // Actualizar usuarios
    db.users.forEach(user => {
        if(!user.powerScores) user.powerScores = {};
        user.powerScores[newSp] = {};
        ['Nivel 1', 'Nivel 2', 'Nivel 3'].forEach(p => {
            user.powerScores[newSp][p] = 0;
        });
    });
    
    save();
    input.value = '';
    renderSuperpowersTab();
}

function editSuperpowerName(index, newName) {
    newName = newName.trim();
    if(!newName) return alert('El nombre no puede estar vacío');
    if(db.superpowers.some((sp, i) => sp.name === newName && i !== index)) {
        return alert('Ya existe un superpoder con ese nombre');
    }
    
    const oldName = db.superpowers[index].name;
    db.superpowers[index].name = newName;
    
    // Actualizar en misiones
    db.users.forEach(user => {
        if(user.missions) {
            user.missions.forEach(mission => {
                if(mission.scores && mission.scores[oldName]) {
                    mission.scores[newName] = mission.scores[oldName];
                    delete mission.scores[oldName];
                }
            });
        }
        if(user.powerScores && user.powerScores[oldName]) {
            user.powerScores[newName] = user.powerScores[oldName];
            delete user.powerScores[oldName];
        }
    });
    
    db.globalMissions.forEach(mission => {
        if(mission.scores && mission.scores[oldName]) {
            mission.scores[newName] = mission.scores[oldName];
            delete mission.scores[oldName];
        }
    });
    
    save();
    renderSuperpowersTab();
}

function deleteSuperpower(index) {
    if(!confirm('¿Eliminar este superpoder? Se eliminará de todas las misiones.')) return;
    
    const spName = db.superpowers[index].name;
    db.superpowers.splice(index, 1);
    
    // Limpiar de misiones y usuarios
    db.users.forEach(user => {
        if(user.missions) {
            user.missions.forEach(mission => {
                if(mission.scores) delete mission.scores[spName];
            });
        }
        if(user.powerScores) delete user.powerScores[spName];
    });
    
    db.globalMissions.forEach(mission => {
        if(mission.scores) delete mission.scores[spName];
    });
    
    save();
    renderSuperpowersTab();
}

function addPowerToSuperpower(spIndex) {
    const input = document.getElementById(`new-power-${spIndex}`);
    const newPower = input.value.trim();
    
    if(!newPower) return alert('Escribe el nombre del poder');
    if(db.superpowers[spIndex].powers.includes(newPower)) return alert('Este poder ya existe');
    
    db.superpowers[spIndex].powers.push(newPower);
    
    // Actualizar usuarios
    const spName = db.superpowers[spIndex].name;
    db.users.forEach(user => {
        if(!user.powerScores) user.powerScores = {};
        if(!user.powerScores[spName]) user.powerScores[spName] = {};
        user.powerScores[spName][newPower] = 0;
    });
    
    save();
    input.value = '';
    renderSuperpowersTab();
}

function editPowerName(spIndex, powerIndex, newName) {
    newName = newName.trim();
    if(!newName) return alert('El nombre no puede estar vacío');
    if(db.superpowers[spIndex].powers.includes(newName) && db.superpowers[spIndex].powers[powerIndex] !== newName) {
        return alert('Ya existe un poder con ese nombre');
    }
    
    const spName = db.superpowers[spIndex].name;
    const oldPowerName = db.superpowers[spIndex].powers[powerIndex];
    db.superpowers[spIndex].powers[powerIndex] = newName;
    
    // Actualizar en misiones y usuarios
    db.users.forEach(user => {
        if(user.missions) {
            user.missions.forEach(mission => {
                if(mission.scores && mission.scores[spName] && mission.scores[spName][oldPowerName] !== undefined) {
                    mission.scores[spName][newName] = mission.scores[spName][oldPowerName];
                    delete mission.scores[spName][oldPowerName];
                }
            });
        }
        if(user.powerScores && user.powerScores[spName] && user.powerScores[spName][oldPowerName] !== undefined) {
            user.powerScores[spName][newName] = user.powerScores[spName][oldPowerName];
            delete user.powerScores[spName][oldPowerName];
        }
    });
    
    db.globalMissions.forEach(mission => {
        if(mission.scores && mission.scores[spName] && mission.scores[spName][oldPowerName] !== undefined) {
            mission.scores[spName][newName] = mission.scores[spName][oldPowerName];
            delete mission.scores[spName][oldPowerName];
        }
    });
    
    save();
    renderSuperpowersTab();
}

function deletePower(spIndex, powerIndex) {
    if(db.superpowers[spIndex].powers.length <= 1) return alert('Debe haber al menos un poder');
    if(!confirm('¿Eliminar este poder?')) return;
    
    const spName = db.superpowers[spIndex].name;
    const powerName = db.superpowers[spIndex].powers[powerIndex];
    db.superpowers[spIndex].powers.splice(powerIndex, 1);
    
    // Limpiar de misiones y usuarios
    db.users.forEach(user => {
        if(user.missions) {
            user.missions.forEach(mission => {
                if(mission.scores && mission.scores[spName]) {
                    delete mission.scores[spName][powerName];
                }
            });
        }
        if(user.powerScores && user.powerScores[spName]) {
            delete user.powerScores[spName][powerName];
        }
    });
    
    db.globalMissions.forEach(mission => {
        if(mission.scores && mission.scores[spName]) {
            delete mission.scores[spName][powerName];
        }
    });
    
    save();
    renderSuperpowersTab();
}

function renderSuperpowersTab() {
    const container = document.getElementById('superpowers-list');
    container.innerHTML = '';
    
    db.superpowers.forEach((sp, spIndex) => {
        const spCard = document.createElement('div');
        spCard.className = 'card superpower-card';
        
        spCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div class="move-buttons">
                    <button class="move-btn" onclick="moveSuperpowerUp(${spIndex})" ${spIndex === 0 ? 'disabled' : ''}>↑</button>
                    <button class="move-btn" onclick="moveSuperpowerDown(${spIndex})" ${spIndex === db.superpowers.length - 1 ? 'disabled' : ''}>↓</button>
                </div>
                <input type="text" value="${sp.name}" onchange="editSuperpowerName(${spIndex}, this.value)" style="flex: 1; font-weight: bold;">
                <button class="danger small" onclick="deleteSuperpower(${spIndex})">Eliminar</button>
            </div>
            <div class="powers-list" style="margin-left: 40px;"></div>
            <div style="display: flex; gap: 5px; margin-top: 10px; margin-left: 40px;">
                <input type="text" id="new-power-${spIndex}" placeholder="Nuevo poder" style="flex: 1;">
                <button class="small" onclick="addPowerToSuperpower(${spIndex})" style="width: auto;">+ Añadir</button>
            </div>
        `;
        
        const powersList = spCard.querySelector('.powers-list');
        sp.powers.forEach((power, pIndex) => {
            powersList.innerHTML += `
                <div class="power-item">
                    <div class="move-buttons">
                        <button class="move-btn" onclick="movePowerUp(${spIndex}, ${pIndex})" ${pIndex === 0 ? 'disabled' : ''}>↑</button>
                        <button class="move-btn" onclick="movePowerDown(${spIndex}, ${pIndex})" ${pIndex === sp.powers.length - 1 ? 'disabled' : ''}>↓</button>
                    </div>
                    <span>⚡</span>
                    <input type="text" value="${power}" onchange="editPowerName(${spIndex}, ${pIndex}, this.value)" style="flex: 1; font-size: 14px;">
                    ${sp.powers.length > 1 ? `<button class="danger small" onclick="deletePower(${spIndex}, ${pIndex})">×</button>` : ''}
                </div>
            `;
        });
        
        container.appendChild(spCard);
    });
}