// categories.js - Gestión de categorías

let draggedCatIndex = -1;

function dragCategory(e, index) {
    draggedCatIndex = index;
    e.dataTransfer.effectAllowed = 'move';
}

function allowDrop(e) {
    e.preventDefault();
}

function dropCategory(e, targetIndex) {
    e.preventDefault();
    if(draggedCatIndex === targetIndex) return;
    
    const cat = db.categories.splice(draggedCatIndex, 1)[0];
    db.categories.splice(targetIndex, 0, cat);
    save();
    renderTasksTab();
}

function addCategory() {
    const input = document.getElementById('new-category');
    const newCat = input.value.trim();
    
    if(!newCat) return alert('Escribe el nombre de la categoría');
    if(db.categories.includes(newCat)) return alert('Esta categoría ya existe');
    
    db.categories.push(newCat);
    db.users.forEach(user => {
        if(!user.customScores) user.customScores = {};
        user.customScores[newCat] = 0;
    });
    
    save();
    input.value = '';
    renderTasksTab();
}

function editCategory(index, newName) {
    newName = newName.trim();
    if(!newName) return alert('El nombre no puede estar vacío');
    if(db.categories.includes(newName) && db.categories[index] !== newName) {
        return alert('Ya existe una categoría con ese nombre');
    }
    
    const oldName = db.categories[index];
    db.categories[index] = newName;
    
    db.users.forEach(user => {
        user.tasks.forEach(task => {
            if(task.scores && task.scores[oldName] !== undefined) {
                task.scores[newName] = task.scores[oldName];
                delete task.scores[oldName];
            }
        });
        if(user.customScores && user.customScores[oldName] !== undefined) {
            user.customScores[newName] = user.customScores[oldName];
            delete user.customScores[oldName];
        }
    });
    
    db.globalTasks.forEach(task => {
        if(task.scores && task.scores[oldName] !== undefined) {
            task.scores[newName] = task.scores[oldName];
            delete task.scores[oldName];
        }
    });
    
    save();
    renderTasksTab();
}

function deleteCategory(index) {
    if(!confirm('¿Eliminar esta categoría? Se eliminará de todas las tareas.')) return;
    
    const catName = db.categories[index];
    db.categories.splice(index, 1);
    
    db.users.forEach(user => {
        user.tasks.forEach(task => {
            if(task.scores) delete task.scores[catName];
        });
        if(user.customScores) delete user.customScores[catName];
    });
    
    db.globalTasks.forEach(task => {
        if(task.scores) delete task.scores[catName];
    });
    
    save();
    renderTasksTab();
}