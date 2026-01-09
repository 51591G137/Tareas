'use strict';

/**
 * categories.js
 * Gestión de categorías (crear/editar/borrar y drag & drop)
 */

/** Añade una nueva categoría */
function addCategory(categoryData) {
  console.debug('[categories] addCategory', categoryData);
  // TODO: Añadir categoría a DB y re-render
}
window.addCategory = addCategory;

/** Edita una categoría existente */
function editCategory(categoryId, updates) {
  console.debug('[categories] editCategory', categoryId, updates);
  // TODO: Actualizar categoría
}
window.editCategory = editCategory;

/** Elimina una categoría */
function deleteCategory(categoryId) {
  console.debug('[categories] deleteCategory', categoryId);
  // TODO: Eliminar categoría y reasignar tareas si es necesario
}
window.deleteCategory = deleteCategory;

/** Inicia arrastrado de categoría */
function dragCategory(ev) {
  console.debug('[categories] dragCategory');
  ev.dataTransfer.setData('text/plain', ev.target.dataset.categoryId || '');
}
window.dragCategory = dragCategory;

/** Permite soltar en un contenedor */
function allowDrop(ev) {
  ev.preventDefault();
}
window.allowDrop = allowDrop;

/** Maneja el drop de una categoría */
function dropCategory(ev) {
  ev.preventDefault();
  const categoryId = ev.dataTransfer.getData('text/plain');
  console.debug('[categories] dropCategory', categoryId);
  // TODO: Reordenar/colocar categoría según destino
}
window.dropCategory = dropCategory;
// Hacer funciones globales
window.addCategory = addCategory;
window.renderCategoriesList = renderCategoriesList;