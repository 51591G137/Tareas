'use strict';

/**
 * tasks.js
 * Gestión de tareas globales
 */

/** Guarda una tarea global */
function saveGlobalTask(taskData) {
  console.debug('[tasks] saveGlobalTask', taskData);
  // TODO: Persistir tarea global
}
window.saveGlobalTask = saveGlobalTask;

/** Crea tareas repetidas a partir de una configuración */
function createRepeatedTasks(taskTemplate) {
  console.debug('[tasks] createRepeatedTasks', taskTemplate);
  // TODO: Generar tareas repetidas según reglas
}
window.createRepeatedTasks = createRepeatedTasks;

/** Abre modal para editar una tarea */
function openEditTaskModal(taskId) {
  console.debug('[tasks] openEditTaskModal', taskId);
  // TODO: Poblar modal y mostrar
}
window.openEditTaskModal = openEditTaskModal;

/** Guarda los cambios de una tarea editada */
function saveEditedTask(taskId, updates) {
  console.debug('[tasks] saveEditedTask', taskId, updates);
  // TODO: Persistir cambios y re-render
}
window.saveEditedTask = saveEditedTask;

/** Renderiza la pestaña de tareas */
function renderTasksTab() {
  console.debug('[tasks] renderTasksTab');
  // TODO: Mostrar vista de tareas
}
window.renderTasksTab = renderTasksTab;

/** Renderiza las tareas globales */
function renderGlobalTasks() {
  console.debug('[tasks] renderGlobalTasks');
  // TODO: Listar tareas globales
}
window.renderGlobalTasks = renderGlobalTasks;

/** Alterna la opción de repetición para una tarea */
function toggleRepeat(taskId) {
  console.debug('[tasks] toggleRepeat', taskId);
  // TODO: Alternar flag de repetición
}
window.toggleRepeat = toggleRepeat;

/** Alterna la edición de repetición (modo avanzado) */
function toggleEditRepeat(taskId) {
  console.debug('[tasks] toggleEditRepeat', taskId);
  // TODO: Mostrar/ocultar opciones de repetición al editar
}
window.toggleEditRepeat = toggleEditRepeat;
