'use strict';

/**
 * users.js
 * Gestión de usuarios y puntuaciones
 */

/** Crea un nuevo usuario */
function createUser(userData) {
  console.debug('[users] createUser', userData);
  // TODO: Añadir usuario a la base de datos
}
window.createUser = createUser;

/** Actualiza el nombre de un usuario */
function updateUserName(userId, newName) {
  console.debug('[users] updateUserName', userId, newName);
  // TODO: Actualizar nombre en DB y UI
}
window.updateUserName = updateUserName;

/** Elimina un usuario */
function deleteUser(userId) {
  console.debug('[users] deleteUser', userId);
  // TODO: Eliminar usuario y sus datos relacionados
}
window.deleteUser = deleteUser;

/** Renderiza la pestaña de usuarios */
function renderUsersTab() {
  console.debug('[users] renderUsersTab');
  // TODO: Mostrar la lista de usuarios en la UI
}
window.renderUsersTab = renderUsersTab;

/** Carga las puntuaciones de usuarios */
function loadUserScores(userId) {
  console.debug('[users] loadUserScores', userId);
  // TODO: Recuperar scores desde DB
}
window.loadUserScores = loadUserScores;

/** Actualiza la puntuación de un usuario */
function updateUserScore(userId, delta) {
  console.debug('[users] updateUserScore', userId, delta);
  // TODO: Incrementar/actualizar puntuación y persistir
}
window.updateUserScore = updateUserScore;
