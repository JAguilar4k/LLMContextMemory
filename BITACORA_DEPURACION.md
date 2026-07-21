# Bitacora de depuracion

Proyecto: Prompt Engineer Workspace  
Fecha de elaboracion: 21 de julio de 2026

## Objetivo

Documentar los cambios solicitados durante la conversacion, los problemas
detectados, las soluciones aplicadas y las verificaciones realizadas para dejar
la aplicacion funcionando segun los requerimientos.

## 1. Modularizacion inicial

Solicitud: crear cuatro modulos independientes en JavaScript nativo:

- `cookieManager.js`
- `storageManager.js`
- `apiService.js`
- `appController.js`

Problema detectado:

- El archivo original mezclaba UI, almacenamiento, cookies y logica de red en
  un solo script.
- La conversacion se guardaba en `localStorage`, aunque debia vivir en
  `sessionStorage`.
- Los favoritos se guardaban en `sessionStorage`, aunque debian vivir en
  `localStorage`.
- El flujo de token y errores 401 no estaba separado de la UI.

Cambios aplicados:

- Se creo una capa para cookies.
- Se creo una capa para persistencia de conversacion y favoritos.
- Se creo una capa de red simulada para `POST /api/llm`.
- Se creo una capa de orquestacion para coordinar almacenamiento, API y eventos
  de UI.

Verificacion:

- Se ejecutaron revisiones de sintaxis con `node --check`.
- Se validaron JSON parse/stringify con valores por defecto seguros.

## 2. Limpieza de aplicacion y UI con Tailwind CSS

Solicitud: dejar unicamente la aplicacion necesaria, revisar seguridad y agregar
animaciones con Tailwind CSS.

Problema detectado:

- Existia un HTML viejo con el borrador defectuoso de la practica.
- Habia texto con apariencia de codificacion rota en la salida de terminal.
- La UI necesitaba integrarse con los modulos nuevos.

Cambios aplicados:

- Se dejo `index.html` como entrada principal.
- Se creo una UI mas pulida con Tailwind CSS.
- Se agregaron animaciones de entrada, modal y badge de token.
- Se separo `uiManager.js` como capa de presentacion.
- Se elimino el HTML viejo `practica2_prompt-workspace.html`.

Seguridad aplicada:

- Los prompts se renderizan con `textContent`, no con `innerHTML`.
- Se agrego una politica CSP en `index.html`.
- No se usa `eval`, `document.write`, `insertAdjacentHTML`,
  `localStorage.clear` ni `sessionStorage.clear`.

Verificacion:

- Se probaron payloads XSS como `<script>alert(1)</script>` y
  `<img src=x onerror=alert(1)>`.
- Los payloads se mostraron como texto literal y no crearon nodos HTML.

## 3. Arquitectura Hexagonal, DDD y SOLID

Solicitud: aplicar arquitectura Hexagonal, DDD y SOLID en todo el proyecto.

Problema detectado:

- Aunque ya existia separacion por modulos, la aplicacion aun tenia dependencias
  directas entre orquestacion, infraestructura y UI.
- Faltaban entidades, objetos de valor, casos de uso y puertos explicitos.

Cambios aplicados:

- Se creo la carpeta `src/` con capas:
  - `domain`
  - `application`
  - `infrastructure`
  - `presentation`
  - `composition`
- Se agregaron entidades y objetos de valor:
  - `Conversation`
  - `ChatMessage`
  - `PromptText`
  - `FavoritePrompt`
- Se agregaron casos de uso:
  - `SendPromptUseCase`
  - `SaveFavoritePromptUseCase`
  - `RenewTokenUseCase`
  - `GetTokenStateUseCase`
  - `GetWorkspaceStateUseCase`
- Se agregaron puertos para aplicar inversion de dependencias:
  - repositorio de conversacion
  - repositorio de favoritos
  - repositorio de token
  - generador de token
  - gateway LLM
- Se movio la infraestructura concreta a adaptadores:
  - `CookieTokenRepository`
  - `SessionConversationRepository`
  - `LocalFavoritePromptRepository`
  - `MockLlmGateway`
  - `SecureTokenGenerator`
- Se creo `createWorkspaceApp.js` como composition root.

Principios SOLID aplicados:

- SRP: cada modulo tiene una responsabilidad concreta.
- OCP: se pueden cambiar adaptadores sin modificar casos de uso.
- LSP: los adaptadores respetan los contratos esperados por la aplicacion.
- ISP: los puertos son pequenos y especificos.
- DIP: los casos de uso dependen de abstracciones, no de `localStorage`,
  `sessionStorage`, cookies o DOM.

Verificacion:

- Se ejecutaron revisiones de sintaxis sobre todos los modulos.
- Se probo el flujo completo con mocks de browser APIs.

## 4. Compatibilidad con los modulos originales

Solicitud implicita: mantener los requerimientos originales de archivos
`cookieManager.js`, `storageManager.js`, `apiService.js` y `appController.js`.

Problema detectado:

- Al migrar a `src/`, podia fallar una revision automatica que buscara los
  archivos originales en la raiz.

Cambios aplicados:

- Se restauraron los cuatro archivos raiz como fachadas.
- Las fachadas delegan a la arquitectura Hexagonal dentro de `src/`.
- No se duplico logica de negocio.

Verificacion:

- Se probaron los modulos raiz directamente.
- Se verifico que sigan exponiendo las funciones solicitadas.

## 5. Flujo del token

Solicitud: explicar y revisar porque parecia que el token no funcionaba.

Funcionamiento final:

- Al abrir la app no hay token.
- Si se envia un prompt sin token, se lanza `401 Token expirado`.
- Al presionar `Renovar token`, se crean las cookies:
  - `access_token`
  - `access_token_expires_at`
- El token dura 2 minutos por defecto.
- El contador visual usa `access_token_expires_at`.
- La API simulada valida la existencia de `access_token` antes de responder.

Problema comun detectado:

- Si se abre `index.html` con doble click usando `file://`, las cookies y
  modulos ES pueden fallar.

Decision:

- No se modifico `index.html` para funcionar con `file://`, porque eso romperia
  el sentido del enunciado.
- Se mantuvo el uso correcto con servidor local.

Verificacion:

- Sin token: respuesta 401.
- Con token renovado: envio exitoso y conversacion con roles `user` y
  `assistant`.

## 6. README e instrucciones de ejecucion

Solicitud: crear un archivo README con instrucciones para ejecutar la app.

Cambios aplicados:

- Se creo `README.md`.
- Se documentaron requisitos, comandos, URL local, flujo de uso, persistencia y
  troubleshooting.

Comando documentado:

```powershell
python -m http.server 8010 --bind 127.0.0.1
```

URL:

```text
http://127.0.0.1:8010/index.html
```

## 7. Lanzador de doble click

Solicitud: permitir una experiencia de doble click si no rompe el enunciado.

Decision:

- No se cambio `index.html` para ejecutarse con `file://`.
- Se creo `start-app.bat` como alternativa segura.

Cambios aplicados:

- `start-app.bat` levanta el servidor local con Python.
- Abre automaticamente la URL de la app.

Resultado:

- El usuario puede hacer doble click en `start-app.bat`.
- La app sigue corriendo por HTTP local, por lo que cookies y modulos ES se
  mantienen compatibles con el enunciado.

## 8. Verificaciones finales realizadas

Se verifico:

- Sintaxis de los modulos JavaScript.
- Flujo sin token.
- Flujo con token.
- Persistencia en `sessionStorage`.
- Persistencia en `localStorage`.
- Conservacion de favoritos despues de 401.
- Limpieza exclusiva de conversacion despues de 401.
- Render seguro contra XSS.
- Carga desde servidor local.

Resultado esperado:

- `Renovar token` activa el token por 2 minutos.
- `Enviar` funciona solo si hay token vigente.
- Los favoritos sobreviven a recargas y al error 401.
- La conversacion actual se limpia al expirar la sesion.
- La app debe ejecutarse desde servidor local o desde `start-app.bat`.

## 9. Respuestas contextuales del asistente

Solicitud: evitar que todas las respuestas fueran exactamente
`Esta es una respuesta simulada basada en tu prompt`.

Problema detectado:

- `MockLlmGateway` devolvia una constante para cualquier prompt.
- La conversacion visualmente guardaba el historial, pero la respuesta no lo
  usaba para generar contenido.

Cambios aplicados:

- Se reemplazo la constante por un generador contextual local dentro de
  `MockLlmGateway`.
- El generador analiza:
  - prompt actual
  - mensajes previos del usuario
  - preguntas como `Que tengo?`
  - solicitudes de resumen
  - menciones de cansancio, sueno, codigo o consejos
- Se mantuvo la simulacion asincrona con `setTimeout`.
- No se agregaron librerias externas ni llamadas a APIs reales.

Verificacion:

Conversacion probada:

```text
Usuario: Tengo sueno
Asistente: Suena a cansancio o sueno acumulado...

Usuario: Que tengo?
Asistente: Por lo que dijiste antes, parece que tienes sueno o cansancio...
```

Resultado:

- La respuesta ya no es fija.
- El segundo mensaje usa contexto del primer mensaje.
- No hubo errores de consola en navegador.

## 10. Correccion de cache de modulos ES

Solicitud: revisar porque la conversacion seguia mostrando respuestas fijas.

Problema detectado:

- El archivo `MockLlmGateway.js` ya tenia respuestas contextuales en disco.
- El servidor local tambien estaba sirviendo el archivo actualizado.
- Sin embargo, la pestana del navegador seguia ejecutando el modulo ES cacheado
  con la respuesta vieja:
  `Esta es una respuesta simulada basada en tu prompt`.

Cambios aplicados:

- Se versiono la carga del modulo principal en `index.html`:

```html
<script type="module" src="./src/main.js?v=20260721-contextual-v2"></script>
```

- Se versionaron imports internos relevantes:
  - `src/main.js`
  - `src/composition/createWorkspaceApp.js`
  - `apiService.js`
- Se agregaron metadatos HTML para reducir cache durante pruebas locales:
  - `Cache-Control: no-store`
  - `Pragma: no-cache`
  - `Expires: 0`

Verificacion:

Se probo nuevamente en `http://127.0.0.1:8010/index.html`:

```text
Usuario: Tengo sueno
Asistente: Suena a cansancio o sueno acumulado...

Usuario: Que tengo?
Asistente: Por lo que dijiste antes, parece que tienes sueno o cansancio...
```

Resultado:

- La pestana ya carga `./src/main.js?v=20260721-contextual-v2`.
- La respuesta fija desaparecio.
- La conversacion usa el historial reciente.
- No hubo errores en consola.

## 11. Correccion del lanzador y limpieza de conversaciones legacy

Solicitud: al ejecutar desde `.bat`, la app seguia mostrando la respuesta fija.

Problema detectado:

- `start-app.bat` usaba siempre el puerto `8010`.
- Si ya habia un servidor viejo escuchando en ese puerto, el navegador podia
  abrir la version servida por ese proceso anterior.
- Ademas, `sessionStorage` podia conservar conversaciones viejas con respuestas
  fijas ya renderizadas.

Cambios aplicados:

- `start-app.bat` ahora busca un puerto libre entre `8010` y `8030`.
- La URL abierta incluye un parametro anti-cache.
- El navegador se abre despues de iniciar el servidor local.
- `SessionConversationRepository` detecta mensajes legacy con:
  `Esta es una respuesta simulada basada en tu prompt`.
- Si encuentra ese historial viejo, limpia solo la conversacion de
  `sessionStorage`.

Verificacion:

Se cargo una conversacion legacy en `sessionStorage` y se valido que la app la
limpiara al iniciar. Luego se probo:

```text
Usuario: Tengo hambre
Usuario: Que tengo?
Asistente: Por el contexto, parece que tienes hambre...
```

## 12. Panel DevTools Application integrado

Solicitud: agregar en la seccion derecha un panel visual tipo
`DevTools ▸ Application`, integrado con el estado real de la aplicacion.

Cambios aplicados:

- Se agrego una tercera columna responsiva en `index.html`.
- El panel muestra el contenido actual de:
  - `Session Storage`: conversacion.
  - `Local Storage`: favoritos.
  - `Cookies`: presencia de `access_token` y tiempo restante.
  - `Network`: ultimo `POST /api/llm` y su estado.
- El panel se actualiza al enviar mensajes, guardar favoritos, renovar o
  expirar el token y en cada actualizacion del contador.
- La UI consume el estado mediante `workspaceApp`; no accede directamente a
  `sessionStorage`, `localStorage`, cookies ni al gateway de red.
- El valor del token no se expone: se muestra su presencia y expiracion para
  mantener el panel educativo sin revelar una credencial.

Verificacion:

- Sin token: se muestra `access_token: ausente`.
- Con token renovado: se muestra el contador de expiracion real.
- Solicitud exitosa: `POST /api/llm` con `Status: 200`.
- Solicitud sin token: `POST /api/llm` con `Status: 401` y detalle
  `token expirado`.
- Conversacion y favoritos se muestran serializados como JSON de forma segura
  mediante `textContent`.

## Archivos principales finales

- `index.html`
- `README.md`
- `start-app.bat`
- `cookieManager.js`
- `storageManager.js`
- `apiService.js`
- `appController.js`
- `src/main.js`
- `src/composition/createWorkspaceApp.js`
- `src/domain/`
- `src/application/`
- `src/infrastructure/`
- `src/presentation/`

## Nota

El archivo `Practica_2_Memoria_de_Contexto_LLM.docx` quedo fuera del flujo de
ejecucion de la app. En una limpieza anterior Windows lo reporto bloqueado por
otro proceso, por lo que no se elimino fisicamente.
