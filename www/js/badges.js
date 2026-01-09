'use strict';

/**
 * badges.js
 * Gestión de insignias
 */

/** Añade una insignia nueva */
function addBadge(badgeData) {
  console.debug('[badges] addBadge', badgeData);
  // TODO: Persistir insignia
}
window.addBadge = addBadge;

/** Renderiza la lista de insignias */
function renderBadgesList() {
  console.debug('[badges] renderBadgesList');
  // TODO: Mostrar insignias en UI
}
window.renderBadgesList = renderBadgesList;

/** Abre modal para editar una insignia */
function openEditBadgeModal(badgeId) {
  console.debug('[badges] openEditBadgeModal', badgeId);
  // TODO: Poblar modal
}
window.openEditBadgeModal = openEditBadgeModal;

/** Guarda cambios de una insignia editada */
function saveEditedBadge(badgeId, updates) {
  console.debug('[badges] saveEditedBadge', badgeId, updates);
  // TODO: Persistir cambios
}
window.saveEditedBadge = saveEditedBadge;

/** Elimina una insignia */
function deleteBadge(badgeId) {
  console.debug('[badges] deleteBadge', badgeId);
  // TODO: Eliminar insignia y limpiar referencias
}
window.deleteBadge = deleteBadge;

/** Alterna requisitos de una insignia */
function toggleBadgeRequirements(badgeId) {
  console.debug('[badges] toggleBadgeRequirements', badgeId);
  // TODO: Activar/desactivar requisitos
}
window.toggleBadgeRequirements = toggleBadgeRequirements;

/** Alterna edición de requisitos en modal */
function toggleEditBadgeRequirements(badgeId) {
  console.debug('[badges] toggleEditBadgeRequirements', badgeId);
  // TODO: Mostrar/ocultar UI de requisitos
}
window.toggleEditBadgeRequirements = toggleEditBadgeRequirements;

/** Renderiza la pestaña de insignias */
function renderBadgesTab() {
  console.debug('[badges] renderBadgesTab');
  // TODO: Renderizar la vista de insignias
}
window.renderBadgesTab = renderBadgesTab;
