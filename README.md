# 🎯 Gestor Elite - Versión 3.0

## ✨ Novedades de la versión 3.0

### 🔄 Sistema de actualización automática
- ✅ **SOLUCIONADO**: Ahora puedes actualizar sin desinstalar la app anterior
- ✅ Los datos se mantienen automáticamente entre versiones
- ✅ El workflow de GitHub Actions sincroniza automáticamente la versión

### 🎖️ **NUEVO: Sistema de Insignias**
- Crea insignias personalizadas con emoji
- Las insignias aparecen en gris hasta que se desbloquean
- Se desbloquean automáticamente al alcanzar los puntos necesarios
- Nueva vista "Insignias" en el menú principal

### 📊 **NUEVO: Editor de Puntuaciones**
- Edita manualmente los puntos de cualquier usuario desde configuración
- Ajusta puntuaciones sin depender solo de tareas completadas
- Ideal para correcciones o bonificaciones especiales

### 📤 **Backup mejorado**
- Sistema de compartir integrado con Android
- Opción de copiar/pegar para máxima compatibilidad
- Soporte para archivos .json y .txt

## 📋 Características completas

- ✅ Gestión de múltiples usuarios
- ✅ Tareas individuales y compartidas
- ✅ Tareas repetitivas por días de la semana
- ✅ Sistema de puntuación por categorías
- ✅ Calendario de tareas
- ✅ Sistema de insignias gamificado
- ✅ Editor manual de puntuaciones
- ✅ Backup y restauración completa
- ✅ Migración automática entre versiones

## 🚀 Cómo actualizar la app

### ⚡ Actualización simple (Recomendado)

1. Descarga la nueva APK desde GitHub Actions
2. Instala directamente sobre la app anterior
3. ¡Listo! Tus datos se conservan automáticamente

### 📋 Con backup previo (Más seguro)

1. **Antes de actualizar:**
   - Abre la app actual
   - Ve a Configuración ⚙️
   - Pulsa "📤 Crear Backup"
   - Copia el texto y guárdalo (WhatsApp, email, Drive, etc.)

2. **Actualizar:**
   - Instala la nueva APK

3. **Si algo sale mal:**
   - Abre la nueva app
   - Ve a Configuración ⚙️
   - Pulsa "📋 Pegar Backup"
   - Pega el texto guardado
   - Pulsa "✅ Restaurar"

## 🔧 Para desarrolladores

### Estructura del proyecto

```
/
├── .github/
│   └── workflows/
│       └── build.yml         ✅ Sincroniza versión automáticamente
├── package.json
├── capacitor.config.json     ✅ Define versionCode y versionName
└── www/
    └── index.html            ✅ App completa con todas las features
```

### Cómo incrementar la versión

1. Edita `capacitor.config.json`:
   ```json
   {
     "android": {
       "versionCode": 4,      // ⬅️ Incrementar (siempre mayor que anterior)
       "versionName": "4.0"   // ⬅️ Versión legible
     }
   }
   ```

2. Haz commit y push:
   ```bash
   git add capacitor.config.json
   git commit -m "Version 4.0"
   git push
   ```

3. GitHub Actions compilará automáticamente con la nueva versión

### Cómo funciona la sincronización

El workflow extrae automáticamente `versionCode` y `versionName` del `capacitor.config.json` y los aplica al `build.gradle` de Android:

```yaml
- name: Sync version from capacitor.config.json to build.gradle
  run: |
    VERSION_CODE=$(node -p "require('./capacitor.config.json').android.versionCode")
    VERSION_NAME=$(node -p "require('./capacitor.config.json').android.versionName")
    sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/g" android/app/build.gradle
    sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION_NAME\"/g" android/app/build.gradle
```

### Sistema de migración de datos

La app incluye un sistema de migración automática:

- `DB_VERSION = 3` en el código
- Al cargar, compara versión guardada vs versión actual
- Si son diferentes, ejecuta migraciones necesarias
- Mantiene compatibilidad con versiones anteriores

Ejemplo de migración:

```javascript
if(currentVersion < 3) {
    // Migración a v3: añadir sistema de insignias
    oldData.users.forEach(user => {
        if(!user.customScores) {
            user.customScores = {};
            oldData.categories.forEach(cat => {
                user.customScores[cat] = 0;
            });
        }
    });
}
```

## 📱 Uso de la app

### Configuración inicial

1. Crea usuarios en Configuración
2. Crea categorías de puntuación (o usa las predeterminadas)
3. Crea insignias para motivar a los usuarios
4. Asigna tareas desde Configuración

### Gestión diaria

1. Cada usuario entra con su perfil
2. Ve sus tareas pendientes
3. Toca una tarea para cambiar su estado
4. Las tareas completadas suman puntos
5. Al alcanzar puntos, se desbloquean insignias

### Administración

- **Crear tareas globales**: Asigna tareas a uno o varios usuarios
- **Editar puntuaciones**: Ajusta manualmente los puntos de cualquier usuario
- **Gestionar insignias**: Crea/elimina insignias y establece requisitos
- **Backup regular**: Crea backups periódicos para seguridad

## 🎨 Sistema de Insignias

### Crear una insignia

1. Ve a Configuración → Gestionar Insignias
2. Nombre: "Maestro del Orden"
3. Emoji: 🏆
4. Categoría: Responsabilidad
5. Puntos: 100

### Cómo se desbloquean

- Las insignias aparecen en gris para todos los usuarios
- Cuando un usuario alcanza los puntos necesarios en esa categoría
- La insignia se muestra en color
- Se indica "🎉 Desbloqueada"

## 🔒 Seguridad de datos

- **LocalStorage**: Los datos se guardan en el dispositivo
- **Backups**: Puedes exportar todo a JSON
- **Sin servidor**: Funciona 100% offline
- **Privacidad**: Los datos nunca salen del dispositivo

## 📞 Soporte

Si algo no funciona:

1. Haz un backup de tus datos
2. Reporta el problema con detalles
3. Si pierdes datos, restaura desde el backup

## 🔄 Historial de versiones

### v3.0 (Actual)
- ✅ Sistema de actualización automática
- ✅ Sistema de insignias
- ✅ Editor de puntuaciones manual
- ✅ Backup mejorado con compartir

### v2.0
- ✅ Sistema de migración de datos
- ✅ Backup y restauración
- ✅ Correcciones en tareas repetitivas

### v1.0
- ✅ Gestión de usuarios
- ✅ Tareas y puntuaciones
- ✅ Calendario
- ✅ Tareas repetitivas

## 📄 Licencia

Ver archivo LICENSE en el repositorio.