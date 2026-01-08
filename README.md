# Tareas
Autocontenido


# Gestor Elite - Instrucciones de Actualización

## ✅ Actualización de versión implementada

### Cambios principales:

1. **Sistema de migración automática**: La app ahora detecta y migra datos de versiones anteriores automáticamente
2. **Backup y Restauración**: Puedes exportar e importar todos tus datos
3. **Versionado de base de datos**: Sistema interno de control de versiones

### Para actualizar la app sin perder datos:

#### Opción 1: Actualización directa (recomendado)
1. Simplemente instala la nueva APK sobre la anterior
2. Android preguntará si quieres actualizar la aplicación
3. Acepta y todos tus datos se mantendrán automáticamente

#### Opción 2: Hacer backup primero (más seguro)
1. Abre la app antigua
2. Ve a Configuración (⚙️)
3. En "Copia de Seguridad" pulsa "📥 Descargar Backup"
4. Guarda el archivo JSON en un lugar seguro
5. Desinstala la app antigua
6. Instala la nueva APK
7. Ve a Configuración
8. Pulsa "📤 Restaurar Backup" y selecciona el archivo

### Archivos actualizados:

- `index.html` - Versión 2.0 con migración de datos y sistema de backup
- `capacitor.config.json` - versionCode: 2, versionName: "2.0"

### Estructura del proyecto:

```
/ (Raíz del repositorio)
├── .github/
│   └── workflows/
│       └── build.yml      <-- GitHub Actions
├── package.json           
├── capacitor.config.json  <-- ✅ Actualizado a versión 2.0
└── www/
    └── index.html         <-- ✅ Con migración y backups
```

### Características del sistema de backup:

- **Exportación**: Descarga un archivo JSON con todos tus datos
- **Importación**: Restaura datos desde un archivo de backup
- **Validación**: Verifica que el archivo sea válido antes de importar
- **Protección**: Confirma antes de sobrescribir datos
- **Información**: Muestra cuántos usuarios y categorías se importaron

### Notas técnicas:

- El sistema usa `versionCode` para que Android sepa que es una actualización
- La base de datos tiene un número de versión interno (`DB_VERSION`)
- La migración es automática y transparente para el usuario
- Los backups son archivos JSON legibles y editables
- Se mantiene compatibilidad con datos de versiones anteriores