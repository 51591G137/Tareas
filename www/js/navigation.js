'use strict';

/**
 * navigation.js
 * Funciones de navegación entre pantallas y pestañas
 */

/** Navega a una vista identificada por "view" */
function navTo(view) {
  console.debug('[navigation] navTo', view);
  // TODO: Implementar navegación entre vistas
}
window.navTo = navTo;

/** Muestra la pestaña de configuración */
function showConfigTab() {
  console.debug('[navigation] showConfigTab');
  // TODO: Mostrar la vista de configuración
}
window.showConfigTab = showConfigTab;

/** Renderiza la vista principal (home) */
function renderHome() {
  console.debug('[navigation] renderHome');
  // TODO: Renderizar contenido de inicio
}
window.renderHome = renderHome;

/** Renderiza la vista de ajustes */
function renderSettings() {
  console.debug('[navigation] renderSettings');
  // TODO: Renderizar ajustes
}
window.renderSettings = renderSettings;

/** Maneja el login */
function login(credentials) {
  console.debug('[navigation] login', credentials);
  // TODO: Validar credenciales, establecer sesión
}
window.login = login;

/** Maneja el logout */
function logout() {
  console.debug('[navigation] logout');
  // TODO: Cerrar sesión, limpiar estado
}
window.logout = logout;
