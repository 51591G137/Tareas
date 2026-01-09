// backup.js - Sistema de backup y restauración mejorado con Capacitor

let lastBackupData = null;

function exportBackup() {
    try {
        const dataStr = JSON.stringify(db, null, 2);
        lastBackupData = dataStr;
        const now = new Date();
        const timestamp = now.toISOString().split('T')[0] + '_' + 
                         now.getHours().toString().padStart(2, '0') + 
                         now.getMinutes().toString().padStart(2, '0');
        const fileName = `gestor_elite_backup_${timestamp}.json`;
        
        // Mostrar el modal directamente (Web Share API no funciona bien en Android WebView)
        showBackupModal(dataStr, fileName);
    } catch (error) {
        console.error('Error en exportBackup:', error);
        alert('❌ Error al generar el backup. Intenta nuevamente.');
    }
}

function showBackupModal(dataStr, fileName) {
    // Cerrar cualquier modal existente
    const existingModal = document.querySelector('.backup-modal-container');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'backup-modal-container';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 25px;
            border-radius: 16px;
            max-width: 95%;
            width: 500px;
            max-height: 90vh;
            overflow: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 1px solid #ddd;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--primary);">📋 Backup Generado</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: none; border: none; font-size: 24px; color: #666; cursor: pointer; width: auto; padding: 0;">
                    ×
                </button>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                Copia este texto y guárdalo en un lugar seguro:
            </p>
            
            <div style="position: relative;">
                <textarea id="backup-text" readonly 
                    style="width:100%; height:250px; font-family: 'Courier New', monospace; 
                    font-size: 12px; padding: 15px; border: 2px solid #e0e0e0; 
                    border-radius: 8px; margin: 10px 0; box-sizing:border-box;
                    background: #f8f9fa; resize: none; line-height: 1.4;">${dataStr}</textarea>
                <button onclick="copyBackupText()" 
                    style="position: absolute; top: 20px; right: 20px; background: #4a90e2; 
                    color: white; border: none; padding: 8px 12px; border-radius: 6px; 
                    font-size: 12px; font-weight: bold; cursor: pointer;">
                    📋 Copiar
                </button>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="downloadBackupViaCapacitor('${fileName}')" 
                    style="flex: 1; min-width: 120px; background: var(--success); 
                    color: white; border: none; padding: 12px; border-radius: 8px; 
                    font-weight: bold; cursor: pointer; display: flex; 
                    align-items: center; justify-content: center; gap: 8px;">
                    💾 Guardar
                </button>
                
                <button onclick="shareBackupViaCapacitor('${fileName}')" 
                    style="flex: 1; min-width: 120px; background: #9b59b6; 
                    color: white; border: none; padding: 12px; border-radius: 8px; 
                    font-weight: bold; cursor: pointer; display: flex; 
                    align-items: center; justify-content: center; gap: 8px;">
                    📤 Compartir
                </button>
                
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    style="flex: 1; min-width: 120px; background: #95a5a6; 
                    color: white; border: none; padding: 12px; border-radius: 8px; 
                    font-weight: bold; cursor: pointer;">
                    Cerrar
                </button>
            </div>
            
            <div style="margin-top: 20px; padding: 12px; background: #fff3cd; 
                border-radius: 8px; border-left: 4px solid #ffc107;">
                <small style="color: #856404;">
                    <strong>🚨 Consejo:</strong> Guarda este backup en Google Drive, 
                    correo electrónico o envíalo por WhatsApp para mayor seguridad.
                </small>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-seleccionar el texto para facilitar la copia
    setTimeout(() => {
        const textarea = modal.querySelector('#backup-text');
        if (textarea) {
            textarea.select();
        }
    }, 100);
}

async function downloadBackupViaCapacitor(fileName) {
    try {
        const textarea = document.querySelector('#backup-text');
        if (!textarea) {
            throw new Error('No se encontró el texto del backup');
        }
        
        const dataStr = textarea.value;
        
        // Verificar si Capacitor está disponible
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Filesystem) {
            try {
                // Usar Filesystem API de Capacitor
                const result = await Capacitor.Plugins.Filesystem.writeFile({
                    path: fileName,
                    data: dataStr,
                    directory: Capacitor.Plugins.FilesystemDirectory.Documents,
                    encoding: Capacitor.Plugins.FilesystemEncoding.UTF8
                });
                
                showToast('✅ Backup guardado en: ' + result.uri);
                console.log('Backup guardado en:', result.uri);
                
                // Cerrar el modal después de guardar
                const modal = document.querySelector('.backup-modal-container');
                if (modal) modal.remove();
                
            } catch (fsError) {
                console.error('Error con Filesystem API:', fsError);
                // Fallback a descarga tradicional
                downloadBackupTraditional(fileName, dataStr);
            }
        } else {
            // Fallback para navegador web
            downloadBackupTraditional(fileName, dataStr);
        }
    } catch (error) {
        console.error('Error en downloadBackupViaCapacitor:', error);
        alert('❌ Error al guardar el backup: ' + error.message);
    }
}

function downloadBackupTraditional(fileName, dataStr) {
    try {
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        showToast('✅ Backup descargado correctamente');
        
        // Cerrar el modal después de descargar
        const modal = document.querySelector('.backup-modal-container');
        if (modal) modal.remove();
        
    } catch (error) {
        console.error('Error en downloadBackupTraditional:', error);
        alert('❌ Error al descargar: ' + error.message);
    }
}

async function shareBackupViaCapacitor(fileName) {
    try {
        const textarea = document.querySelector('#backup-text');
        if (!textarea) {
            throw new Error('No se encontró el texto del backup');
        }
        
        const dataStr = textarea.value;
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // Primero intentar con Capacitor Share API
        if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Share) {
            try {
                // Convertir blob a base64 para Capacitor
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async function() {
                    const base64Data = reader.result.split(',')[1];
                    
                    await Capacitor.Plugins.Share.share({
                        title: 'Backup Gestor Elite',
                        text: `Backup del ${new Date().toLocaleDateString('es-ES')}`,
                        url: `data:application/json;base64,${base64Data}`,
                        dialogTitle: 'Compartir backup'
                    });
                    
                    showToast('✅ Backup compartido');
                };
            } catch (shareError) {
                console.error('Error con Share API:', shareError);
                shareViaWebAPI(fileName, dataStr);
            }
        } else {
            // Intentar con Web Share API
            shareViaWebAPI(fileName, dataStr);
        }
    } catch (error) {
        console.error('Error en shareBackupViaCapacitor:', error);
        alert('❌ Error al compartir: ' + error.message);
    }
}

function shareViaWebAPI(fileName, dataStr) {
    try {
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        if (navigator.share) {
            const file = new File([blob], fileName, { type: 'application/json' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: 'Backup Gestor Elite',
                    text: `Backup del ${new Date().toLocaleDateString('es-ES')}`,
                    files: [file]
                }).then(() => {
                    showToast('✅ Backup compartido');
                }).catch((error) => {
                    console.log('Error al compartir:', error);
                    fallbackShare(dataStr, fileName);
                });
            } else {
                fallbackShare(dataStr, fileName);
            }
        } else {
            fallbackShare(dataStr, fileName);
        }
    } catch (error) {
        console.error('Error en shareViaWebAPI:', error);
        fallbackShare(dataStr, fileName);
    }
}

function fallbackShare(dataStr, fileName) {
    // Método alternativo: mostrar el texto para copiar
    alert('📋 Para compartir el backup:\n\n1. Copia el texto del cuadro de arriba\n2. Pégalo en un mensaje de WhatsApp, email, etc.\n\nTambién puedes guardarlo localmente y compartirlo desde allí.');
}

function copyBackupText() {
    try {
        const textarea = document.querySelector('#backup-text');
        if (!textarea) {
            throw new Error('No se encontró el texto del backup');
        }
        
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        // Usar la API moderna si está disponible
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textarea.value)
                .then(() => {
                    showToast('✅ Backup copiado al portapapeles');
                })
                .catch(err => {
                    throw err;
                });
        } else {
            // Fallback para navegadores antiguos
            const successful = document.execCommand('copy');
            if (successful) {
                showToast('✅ Backup copiado al portapapeles');
            } else {
                throw new Error('No se pudo copiar');
            }
        }
    } catch (error) {
        console.error('Error en copyBackupText:', error);
        alert('❌ No se pudo copiar: ' + error.message);
    }
}

function showToast(message) {
    // Cerrar toast existente
    const existingToast = document.querySelector('.backup-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'backup-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: fadeInOut 3s ease-in-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Crear estilo para la animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 3000);
}

// Funciones de restauración (sin cambios)
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
            throw new Error('Formato inválido: No se encontraron usuarios');
        }
        
        // Establecer valores por defecto si no existen
        if(!importedData.categories) importedData.categories = ['Responsabilidad', 'Amabilidad', 'Respeto'];
        if(!importedData.globalTasks) importedData.globalTasks = [];
        if(!importedData.badges) importedData.badges = [];
        if(!importedData.version) importedData.version = DB_VERSION;
        
        db = migrateDatabase(importedData);
        save();
        
        closePasteBackupModal();
        
        showToast(`✅ Backup restaurado: ${db.users.length} usuarios, ${db.categories.length} categorías, ${db.badges.length} insignias`);
        
        renderSettings();
        renderHome();
        
    } catch(error) {
        console.error('Error en processPastedBackup:', error);
        alert('❌ Error en el backup: ' + error.message + '\n\nAsegúrate de que es un backup válido de Gestor Elite.');
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
                throw new Error('Formato inválido: No se encontraron usuarios');
            }
            
            if(!importedData.categories) importedData.categories = ['Responsabilidad', 'Amabilidad', 'Respeto'];
            if(!importedData.globalTasks) importedData.globalTasks = [];
            if(!importedData.badges) importedData.badges = [];
            if(!importedData.version) importedData.version = DB_VERSION;
            
            db = migrateDatabase(importedData);
            save();
            
            showToast('✅ Backup restaurado desde archivo');
            renderSettings();
            renderHome();
            
        } catch(error) {
            alert('❌ Error: ' + error.message + '\n\nEl archivo no es un backup válido.');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}