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
