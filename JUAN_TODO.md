# JUAN TODO — Backend Eyebee

Pendientes de backend para cerrar la UX móvil nueva. El frontend ya está preparado; hoy el nombre de sala está deshabilitado y el enlace sigue siendo el largo con `?p=`.

## 1. Soportar nombre de sala

**Ahora:** el nombre sólo vive en `localStorage` del móvil. El backend no lo recibe, no lo guarda y no lo devuelve. El campo “Nombre de la sala” está deshabilitado en `MobileLanding/CreateRoomSheet.js`.

**Necesario:**
- Aceptar `roomName` al crear/unirse a la sala (payload de `join` o endpoint de creación).
- Guardarlo en la sesión (`sessions` / `session_peers`) y devolverlo en `room_info`, `users` y `/api/sessions`.
- Mostrarlo en la sala y en el pre-join. El nombre no debería viajar en la URL.
- Fallback si no hay nombre: “Sala sin nombre”.

**Criterios de aceptación:**
- Crear una sala con nombre; dos participantes ven el mismo nombre.
- El nombre persiste mientras la sala existe y aparece en `/api/sessions`.
- Si no se envía nombre, la sala funciona igual con el fallback.

**Archivos:** `webrtc_sessions/index.js` (join, room_info, sessions), `session.js`, `memory-database-api.js`; frontend `MobileLanding/CreateRoomSheet.js`, `Room/Room.js`, `JoinRoomView.js`.

## 2. Enlace corto en el formato `https://eyebee/<code>`

**Ahora:** el enlace es `https://immersiveweb.es/videocall/<id>?p=<AES>`. El QR y el enlace del modal usan ese formato. El diseño pide `https://eyebee/foeo124iib`.

**Necesario:**
- Generar un código corto (por ejemplo, 9 caracteres `[a-z0-9]`) al crear la sala y mapearlo al `roomId` + parámetros.
- Resolver `GET /<code>` (o el dominio corto que se decida) y llevar al pre-join de esa sala.
- Devolver el enlace corto al frontend para el QR, el botón de copiar y el input del modal.
- Mantener el enlace largo como fallback/compatibilidad.

**Criterios de aceptación:**
- Crear sala → recibir `https://eyebee/<code>`.
- Abrir el enlace corto lleva al pre-join de esa sala.
- El QR codifica el enlace corto.
- El enlace corto no expone el `p` cifrado.

**Archivos:** backend de sesiones + nginx (ruta de códigos), `MobileLanding/CreateRoomSheet.js`.

## 3. Opciones de sala que hoy están deshabilitadas

Estas filas del panel “Opciones de la sala” y del menú de cada sala de la home móvil están greyed out y con un `TODO(Juan)` en el código:

- **Configuración de la sala**: no hay endpoint para persistir ajustes de sala.
- **Cambiar nombre a la sala**: depende del punto 1 (nombre de sala).
- **Restaurar enlace**: no hay rotación/regeneración de enlaces; depende del punto 2.

Los dos últimos aparecen en `MobileLanding/RoomListMenu.js` como “Cambiar nombre” y “Resetear enlace”, también deshabilitados.

## Notas

- El deploy de staging no reinicia el contenedor `webrtc-sessions`; cualquier cambio de backend necesita `docker compose restart webrtc-sessions` (o `--force-recreate`) para tomar efecto.
- Cuando el nombre esté soportado, el frontend sólo tiene que quitar el `disabled` del input y enviar `roomName` en el payload; el estado y el guardado local ya existen.
