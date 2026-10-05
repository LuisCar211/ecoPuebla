# Pruebas locales de flujo y reglas

Esta carpeta es opcional; no se necesita para ejecutar Expo. Requiere Node.js 22.13+ y Java 17+. La CLI se fija a una versión compatible con Java 17 para este emulador. Usa exclusivamente el proyecto ficticio `demo-ecopuebla-test` y nunca requiere facturación ni despliegues en Firebase real.

Desde esta carpeta:

```bash
npm ci
npx firebase emulators:exec --config ../firebase.emulator.json --project demo-ecopuebla-test --only firestore "node --experimental-strip-types --test firestore-flow.test.mjs"
```

El emulador necesita descargar su archivo de ejecución la primera vez. Debe estar libre el puerto 8080. Se prueban las reglas en la base del emulador `(default)`; los permisos son los mismos para la base `default` que utiliza la app real.

La prueba transpila e invoca el servicio real `src/services/assignment.ts`, sustituyendo únicamente la sesión y la conexión por cuentas autenticadas del emulador. Verifica publicación, visibilidad por participantes, rechazo y reasignación, apartado con intentos concurrentes, falta de candidatos, recuperación de publicaciones antiguas y denegación de operaciones no autorizadas.

## Interacción de Inicio y Explorar

Después de `npm ci`, ejecuta:

```bash
node --test ui-reservation.test.mjs
```

Estas pruebas renderizan los componentes reales de Inicio, Explorar, tarjetas y detalle, con adaptadores de elementos nativos y un servicio simulado. Comprueban abrir una publicación, apartar y rechazar, cerrar sin rechazar, bloquear la respuesta durante una operación, mostrar errores y ocultar acciones para ofertas no elegibles. No sustituyen la prueba visual del mapa en un teléfono. Las transacciones y reglas se comprueban por separado con el emulador descrito arriba.

Las pruebas de interfaz también verifican las 10 categorías, la agrupación de los documentos actuales y nuevos, los materiales mostrados al elegir una categoría y la limpieza de selección al cambiarla.

## Recolección

El emulador prueba el servicio real de confirmación: solo la empresa propietaria puede pasar un material apartado a recolectado, se guarda fecha de servidor, se conservan los participantes, se bloquean alteraciones del material y la confirmación repetida no cambia la fecha. Las pruebas de interfaz cubren confirmación y cancelación desde Mis publicaciones y Avisos, errores con reintento y eliminación del marcador al recibir el nuevo estado. Los adaptadores del mapa prueban sus marcadores; no sustituyen la revisión visual en un teléfono.
