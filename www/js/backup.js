'use strict';

/**
 * backup.js
 * Sistema de backup y restauración
 */

/** Exporta backup (intenta export nativo) */
function exportBackup() {
  console.debug('[backup] exportBackup');
  // TODO: Generar JSON o formato de backup y ofrecer descarga
}
window.exportBackup = exportBackup;

/** Fallback para export si falla la primera opción */
function fallbackExport() {
  console.debug('[backup] fallbackExport');
  // TODO: Mostrar texto para copiar manualmente
}
window.fallbackExport = fallbackExport;

/** Descarga el backup generado */
function downloadBackup(filename, content) {
  console.debug('[backup] downloadBackup', filename);
  // TODO: Crear blob y forzar descarga
}
window.downloadBackup = downloadBackup;

/** Copia el texto del backup al portapapeles */
function copyBackupText(text) {
  console.debug('[backup] copyBackupText');
  // TODO: navigator.clipboard.writeText(text)
}
window.copyBackupText = copyBackupText;

/** Muestra modal para pegar backup (import) */
function showPasteBackup() {
  console.debug('[backup] showPasteBackup');
  // TODO: Abrir modal con textarea
}
window.showPasteBackup = showPasteBackup;

/** Procesa texto pegado en modal */
function processPastedBackup(pastedText) {
  console.debug('[backup] processPastedBackup');
  // TODO: Validar JSON y preparar import
}
window.processPastedBackup = processPastedBackup;

/** Importa un backup (restauración) */
function importBackup(parsedBackup) {
  console.debug('[backup] importBackup');
  // TODO: Reemplazar/merger datos con precaución
}
window.importBackup = importBackup;

/** Cierra el modal de pegar backup */
function closePasteBackupModal() {
  console.debug('[backup] closePasteBackupModal');
  // TODO: Cerrar modal y limpiar campos
}
window.closePasteBackupModal = closePasteBackupModal;
