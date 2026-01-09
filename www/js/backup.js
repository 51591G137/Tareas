// backup.js - Sistema de backup y restauración

function exportBackup() {
    const dataStr = JSON.stringify(db, null, 2);
    
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0] + '_' + 
                      now.getHours().toString().padStart(2, '0') + 
                      now.getMinutes().toString().padStart(2, '0') +
                      now.getSeconds().toString().padStart(2, '0');
    const fileName = `academia_heroes_backup_${timestamp}.json`;
    
    if (navigator.share && navigator.canShare) {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        if (navigator.canShare({ files: [file] })) {
            navigator.share({
                title: 'Backup Academia de Héroes',
                text: 'Copia de seguridad',
                files: [file]
            })
            .catch(() => {
                fallbackExport(dataStr, fileName);
            });
            return;
        }
    }
    
    fallbackExport(dataStr, fileName);
}

function fallbackExport(dataStr, fileName) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
    
    modal.innerHTML = `
        <div style="background:white;padding:20px;border-radius:12px;max-width:95%;width:400px;max-height:80vh;overflow:auto;box-sizing:border-box;">
            <h3 style="margin-top:0;">Backup Generado</h3>
            <p style="font-size:14px;color:#666;">Copia este texto y guárdalo:</p>
            <textarea id="backup-text" readonly style="width:100%;height:300px;font-family:monospace;font-size:11px;padding:10px;border:1px solid #ddd;border-radius:5px;margin:10px 0;box-sizing:border-box;">${dataStr}</textarea>
            <button onclick="copyBackupText()" style="width:100%;background:#4a90e2;color:white;border:none;padding:12px;border-radius:8px;font-weight:bold;margin-bottom:10px;">📋 Copiar</button>
            <button onclick="downloadBackup('${fileName}')" style="width:100%;background:#2ecc71;color:white;border:none;padding:12px;border-radius:8px;font-weight:bold;margin-bottom:10px;">💾 Descargar</button>
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;background:#95a5a6;color:white;border:none;padding:12px;border-radius:8px;font-weight:bold;">Cerrar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadBackup(fileName) {
    const dataStr = document.getElementById('backup-text').value;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

function copyBackupText() {
    const textarea = document.getElementById('backup-text');
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        alert('✅ Backup copiado!');
    } catch (err) {
        alert('❌ No se pudo copiar.');
    }
}

function showPasteBackup() {
    document.getElementById('paste-backup-modal').classList.add('active');
    document.getElementById('paste-backup-text').value = '';
    document.getElementById('paste-backup-text').focus();
}

function closePasteBackupModal() {
    document.getElementById('paste-backup-modal').classList.remove('active');
    document.getElementById('paste-backup-text').value = '';
}

function processPastedBackup() {
    const pastedText = document.getElementById('paste-backup-text').value.trim();
    
    if(!pastedText) return alert('❌ No has pegado ningún contenido.');
    
    if(!confirm('⚠️ ¿Estás seguro?\n\nSe reemplazarán TODOS los datos actuales.')) return;
    
    try {
        const importedData = JSON.parse(pastedText);
        
        if(!importedData.users || !Array.isArray(importedData.users)) {
            throw new Error('Formato inválido');
        }
        
        // Asegurar estructuras necesarias
        if(!importedData.superpowers) {
            importedData.superpowers = [
                { name: 'Responsabilidad', powers: ['Organización', 'Puntualidad', 'Compromiso'] },
                { name: 'Empatía', powers: ['Amabilidad', 'Escucha activa', 'Comprensión'] },
                { name: 'Autocontrol', powers: ['Paciencia', 'Gestión emocional', 'Reflexión'] }
            ];
        }
        if(!importedData.missionTypes) {
            importedData.missionTypes = [
                { id: 'special', name: 'Misiones Especiales', icon: '⭐' },
                { id: 'daily', name: 'Misiones Diarias', icon: '🌅' },
                { id: 'team', name: 'Misiones de Equipo', icon: '👥' },
                { id: 'challenge', name: 'Desafíos', icon: '🎯' }
            ];
        }
        if(!importedData.globalMissions) importedData.globalMissions = [];
        if(!importedData.badges) importedData.badges = [];
        if(!importedData.version) importedData.version = DB_VERSION;
        
        db = migrateDatabase(importedData);
        save();
        
        closePasteBackupModal();
        alert('✅ Backup restaurado!\n\n- ' + db.users.length + ' héroes\n- ' + db.superpowers.length + ' superpoderes\n- ' + db.badges.length + ' logros');
        
        renderSettings();
        renderHome();
        
    } catch(error) {
        alert('❌ Error: ' + error.message);
    }
}

function importBackup(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    if(!confirm('⚠️ ¿Estás seguro?\n\nSe reemplazarán TODOS los datos.')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if(!importedData.users || !Array.isArray(importedData.users)) {
                throw new Error('Formato inválido');
            }
            
            // Asegurar estructuras necesarias
            if(!importedData.superpowers) {
                importedData.superpowers = [
                    { name: 'Responsabilidad', powers: ['Organización', 'Puntualidad', 'Compromiso'] },
                    { name: 'Empatía', powers: ['Amabilidad', 'Escucha activa', 'Comprensión'] },
                    { name: 'Autocontrol', powers: ['Paciencia', 'Gestión emocional', 'Reflexión'] }
                ];
            }
            if(!importedData.missionTypes) {
                importedData.missionTypes = [
                    { id: 'special', name: 'Misiones Especiales', icon: '⭐' },
                    { id: 'daily', name: 'Misiones Diarias', icon: '🌅' },
                    { id: 'team', name: 'Misiones de Equipo', icon: '👥' },
                    { id: 'challenge', name: 'Desafíos', icon: '🎯' }
                ];
            }
            if(!importedData.globalMissions) importedData.globalMissions = [];
            if(!importedData.badges) importedData.badges = [];
            if(!importedData.version) importedData.version = DB_VERSION;
            
            db = migrateDatabase(importedData);
            save();
            
            alert('✅ Backup restaurado!');
            renderSettings();
            renderHome();
            
        } catch(error) {
            alert('❌ Error: ' + error.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}