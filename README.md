# EcoPuebla — prototipo sin Cloud Functions

App Expo SDK 57 con Firebase Authentication por correo/contraseña y Cloud Firestore. La asignación al reciclador más cercano se ejecuta en la aplicación; no requiere Functions, Blaze ni otro servidor contratado. Firestore debe usarse dentro de las cuotas gratuitas de tu proyecto. No se incluyen servicios nuevos de pago.

## Preparación y prueba con tus dos cuentas

1. Descomprime el ZIP y entra en la carpeta `ecopuebla`. Se requiere Node.js 22.13 o posterior.
2. En Firebase abre **Firestore → base `default` → Seguridad/Reglas**. Reemplaza el contenido por el archivo completo `firestore.rules` incluido y pulsa **Publicar**. Es un cambio de permisos, no un despliegue de Functions. El archivo cubre `usuarios`, `materiales`, `recicladores` y `posts`; si tu proyecto tiene otras colecciones o apps, integra sus permisos antes de reemplazarlo. Las reglas abiertas anteriores dejan todos los datos expuestos.
3. Ejecuta:

```bash
npm ci
npx expo start --clear
```

4. Abre la app en Expo Go. Puedes usar ambas cuentas en el mismo teléfono cerrando sesión para cambiar de cuenta.
5. Entra como **Reciclador**, abre **Perfil** y pulsa **Actualizar mi ubicación**, aceptando el permiso. Hazlo una vez aunque tu ubicación ya estuviera registrada en la versión anterior. Esto crea automáticamente `recicladores/{UID}` y actualiza `usuarios/{UID}`. No tienes que crear manualmente esta colección.
6. Entra como **Empresa**. En Inicio pulsa **Buscar reciclador de nuevo** en la publicación antigua que quedó en `buscando`, o crea una nueva desde Publicar. Debe pasar a `ofrecido` y contener el UID del reciclador en `ofrecidoA` y `participantes`.
7. Vuelve a la cuenta Reciclador y abre **Ofertas**. Pulsa **Apartarlo** para reservar. La empresa verá el cambio en **Avisos**.
8. Para probar rechazo, publica otro material. Si el único reciclador lo rechaza, la publicación pasa a `sin_candidatos`. Ese reciclador queda excluido de esa publicación; para probar otra oferta con él, crea otra publicación. Con más recicladores, se ofrece al siguiente candidato disponible.

Las reglas no se publicaron desde este entorno y no se hicieron escrituras en tu proyecto real. Si no publicas las nuevas reglas y conservas las anteriores restricciones, puedes obtener `permission-denied`. Con tus reglas abiertas anteriores el flujo puede funcionar, pero los perfiles y ubicaciones no están protegidos.

## Cómo se asigna

`src/services/assignment.ts` consulta el directorio mínimo `recicladores`, vuelve a leer sus documentos dentro de una transacción y utiliza `src/services/nearest.ts` para elegir al más cercano. El directorio incluye únicamente `ubicacion`, `disponible` y `updatedAt`; su ID es el UID del reciclador. No se consulta la lista de perfiles privados de `usuarios`, ni se comparte su correo o nombre en el directorio.

El botón de ubicación guarda perfil y directorio juntos mediante un lote atómico. Las reglas permiten leer el directorio a cuentas Empresa y Reciclador que hayan iniciado sesión. Cada reciclador puede escribir únicamente su documento y debe mantenerlo coherente con su perfil. La interfaz informa de este uso de la ubicación antes de guardarla.

El cálculo usa la distancia de Haversine en línea recta entre el punto de recolección y la última ubicación registrada del reciclador. Excluye a quien publica, personas no disponibles, coordenadas inválidas y recicladores que ya rechazaron esa publicación. Si dos distancias coinciden, el UID desempata de forma estable. No calcula rutas, tráfico ni un radio máximo y no filtra por tipos de material aceptados.

La creación guarda de una vez `ofrecido` con el destinatario o `sin_candidatos` sin destinatario. El rechazo añade al usuario a `descartados` y calcula el siguiente destinatario dentro de la misma transacción. Aceptar verifica que la oferta sigue dirigida a la cuenta antes de reservar. Esto evita apartados dobles y actualizaciones parciales ante errores de permisos o conexión. Las transacciones requieren conexión; si fallan, aparece un mensaje y se puede reintentar.

**Buscar reciclador de nuevo** funciona para estados `buscando` y `sin_candidatos`, incluidas las publicaciones antiguas con coordenadas válidas. Conserva los rechazos anteriores. No cambia publicaciones ya ofrecidas o apartadas. Una publicación antigua sin coordenadas necesita corregir su punto de recolección o volver a publicarse.

La lista de candidatos parte de los documentos existentes al iniciar cada operación; un reciclador que se registre simultáneamente puede entrar en la siguiente búsqueda. La asignación se ejecuta al publicar, rechazar o pulsar Buscar de nuevo. Si después aparece un nuevo reciclador, no hay un proceso de servidor que reasigne solo las publicaciones pendientes. La empresa debe reintentar. Si la aplicación se cierra antes de completar una operación, verifica su resultado en Inicio antes de repetirla.

Las reglas validan quién puede publicar, responder y participar, y que el destinatario esté disponible. No pueden comprobar que un cliente manipulado haya calculado realmente al más cercano ni que no hubiera candidatos al declarar `sin_candidatos`. Esta arquitectura es para el prototipo académico con cálculo en cliente.

## Apartar desde Inicio y Explorar

En una cuenta Reciclador, tocar una tarjeta en **Inicio** o **Explorar** abre el detalle de la publicación. Si está `ofrecido` y `ofrecidoA` coincide con el UID conectado, permite **Apartar material** o **No lo quiero**. Se reutiliza la misma transacción de Ofertas; no hay una reserva distinta por pantalla. Cerrar el detalle conserva la oferta pendiente. Si se aparta, el detalle confirma el resultado y la publicación se actualiza en todas las pantallas. Si se rechaza, se ejecuta la reasignación existente.

Los botones no aparecen para otras cuentas, ofertas ya apartadas ni publicaciones que dejaron de estar dirigidas al usuario. Durante la operación se bloquean los botones y el cierre. Un fallo se muestra en la ventana y permite volver a intentar; la transacción vuelve a comprobar la oferta en Firestore antes de apartar. Los detalles usan la consulta de publicaciones de la pantalla y no crean una escucha adicional por tarjeta.

En el mapa nativo, las burbujas muestran el símbolo del material/categoría en lugar del nombre. Tocar la burbuja muestra el nombre, cantidad y dirección; tocar ese recuadro abre el mismo detalle de la publicación. Se respetan los símbolos indicados por el usuario, incluidos ♳ a ♹ para plásticos. Papel mixto y periódico y papel blanco de oficina tienen símbolos específicos por encima de Papel y cartón general. Los símbolos se resuelven por ID, nombre o `categoriaId`, normalizando acentos y mayúsculas. Si no hay coincidencia se usa ♻️. La apariencia exacta de emoji depende del sistema y su fuente. La web sigue usando la lista sin mapa interactivo; las tarjetas de Inicio y Explorar sí permiten apartar en Netlify.

## Pantallas y avisos

**Empresa:** Inicio con sus propias publicaciones, Publicar, Avisos con estados de sus publicaciones y Perfil. **Reciclador:** Inicio con mapa/lista de sus ofertas, Explorar, Ofertas y Perfil. Universidad conserva la navegación anterior.

Los avisos son cambios en Firestore que la app recibe en tiempo real al estar abierta. No se envían notificaciones push con la app cerrada. Cuando vuelves a entrar, se cargan las ofertas actuales. No se administra pago ni entrega física.

En iOS/Android el mapa usa `react-native-maps` y las coordenadas del material; Apple Maps o Google Maps según plataforma. La web mantiene una lista, sin mapa interactivo. Solo se muestran publicaciones donde tu cuenta está en `participantes`. La ubicación no se pide al abrir el mapa, sino al pulsar el botón correspondiente. Una app independiente de Android puede requerir configurar la clave del proveedor de mapas; el recorrido de prueba de este proyecto utiliza Expo Go.

## Catálogo de materiales

La colección `materiales` se lee completa en tiempo real. No hay IDs fijos: `Carton-corrugado`, `pet-transparente` y los documentos futuros conservan sus IDs exactos. Para seleccionar un material se requiere `activo: true`, `publicable: true` y un nombre visible: se usa `nombre`, o `categoriaId` cuando el documento solo describe la categoría (por ejemplo `manejoEspecial` en la captura). Se conserva su ID exacto.

| Campo | Tipo | Uso |
| --- | --- | --- |
| `nombre` | string | Nombre visible |
| `categoriaId` | string | Se utiliza exactamente este nombre de campo |
| `codigoResina` | string o null | El código solo se muestra si tiene texto |
| `precioMinKg`, `precioMaxKg` | double o integer | Rango orientativo en MXN/kg |
| `condicionPrecio` | string | Condiciones del precio de referencia |
| `tipoManejo`, `separacionPlanta` | string | Información de manejo y separación |
| `activo`, `publicable` | boolean | Disponibilidad para nuevas publicaciones |

No conviertas los precios a strings ni `null` a texto. Se admiten como alternativas `precioMinMxnKg` y `precioMaxMxnKg`, con prioridad para los nombres actuales. Precios ausentes/inválidos o rangos invertidos se omiten, sin transformarse en cero. El rango es orientativo, no un precio de venta pactado.

Al publicar se revalida el material y se guarda `materialId`, nombre, categoría, código, precios y condición como copia histórica. Las modificaciones posteriores del catálogo actualizan el formulario sin alterar las publicaciones anteriores. Explorar genera filtros desde el catálogo y las publicaciones visibles, incluidas las antiguas que solo tenían nombre.

## Firebase y cuentas existentes

La configuración sigue apuntando a `ecopuebla-bc93e` y la base `default` (sin paréntesis), igual que la versión que ya guarda tus publicaciones. No hace falta crear otro proyecto o base. Si tienes `.env`, confirma `EXPO_PUBLIC_FIRESTORE_DATABASE_ID=default`. La configuración contiene solo datos del cliente, sin cuentas de servicio ni claves privadas.

Los documentos nuevos de `usuarios` tienen ID igual al UID de Authentication. Si una cuenta se creó sin perfil por un fallo anterior, inicia sesión con ella y completa el perfil desde Perfil. No registres nuevamente ese correo. Las publicaciones anteriores sin `participantes` no se consultan desde la app y necesitarían migración. La versión anterior de Functions se retiró del ZIP y de `firebase.json`; si tú llegaste a desplegarla por tu cuenta, desactívala antes de usar este flujo para evitar dos procesos de asignación.

## Verificación

```bash
npx tsc --noEmit
npm run test:catalog
npm run test:assignment
npm run test:symbols
```

Las pruebas de asignación cubren cercanía, rechazo, agotamiento de candidatos, disponibilidad, ubicaciones inválidas, empates y cuentas en la misma ubicación. Las pruebas de integración y permisos están en `verification/`; usan un proyecto `demo-ecopuebla-test` en un emulador local y nunca tus datos de producción. Consulta `verification/README.md` para ejecutarlas. La carpeta de verificación no se necesita para abrir la app.

### Categoría y material al publicar

El campo Tipo de material ofrece 10 categorías principales con sus símbolos. Al seleccionar una se muestran únicamente sus materiales activos y publicables de Firestore; cambiar de categoría borra el material elegido. Se conserva el ID original y `categoriaId` al publicar. Los documentos nuevos aparecen automáticamente dentro de su categoría, sin cambiar las reglas ni crear colecciones adicionales.

### Coordenadas manuales

Se aceptan decimales (`19.0413`, `-98.2062`), coma decimal en campos separados y grados/minutos/segundos (`19° 2′ 28.68″ N`, `98° 12′ 22.32″ O`). El campo Pegar coordenadas permite pegar el par latitud/longitud; usa punto decimal con coma separadora (`19.0413, -98.2062`) o coma decimal con punto y coma (`19,0413; -98,2062`). No acepta enlaces de mapas. El par pegado se usa al publicar o al presionar Usar coordenadas pegadas. No se invierten coordenadas automáticamente.

Pruebas: `npm run test:coordinates`.

### Confirmar recolección

La empresa puede usar **Confirmar recolección** en Inicio (Mis publicaciones) o Avisos para un material apartado. Después de confirmar que el reciclador lo recogió, Firestore guarda `estado: "recolectado"`, `recolectadoEn` y `recolectadoPor`. Se conserva la publicación y sus participantes para el historial, pero se excluye del mapa. La actualización llega en tiempo real a ambas cuentas conectadas; requiere conexión para completar la transacción.

**Importante:** actualiza las reglas de la base `default` en Firebase Console → Firestore → Seguridad/Reglas, copiando el archivo `firestore.rules` de esta versión y pulsando Publicar. Las reglas anteriores del proyecto no permiten esta transición. Solo la empresa propietaria puede confirmar la recolección de un material apartado; el reciclador no puede cambiar ese estado. No requiere Cloud Functions.
