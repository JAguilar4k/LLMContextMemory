# Guia de estudio: Prompt Engineer Workspace

Esta guia explica la app con palabras simples y analogias. La idea no es
memorizar nombres de archivos, sino entender que papel cumple cada parte.

## 1. Idea general de la app

La app es como una mesa de trabajo para conversar con un asistente.

El usuario puede:

- Escribir prompts.
- Guardar prompts favoritos.
- Mantener una conversacion temporal.
- Renovar un token para simular una sesion activa.
- Recibir respuestas que usan el contexto reciente.

Analogía:

Imagina una recepcion de oficina:

- El usuario llega y hace preguntas.
- La recepcion revisa si tiene pase de entrada, o sea token.
- Si tiene pase, lo atienden.
- Si no tiene pase, le dicen que la sesion expiro.
- Algunas notas se guardan solo durante la visita.
- Otras notas favoritas se guardan para futuras visitas.

## 2. Que pasa cuando abres la app

El archivo principal es:

```text
index.html
```

Este archivo es como la puerta de entrada del edificio. Tiene la estructura
visual de la pagina y carga el JavaScript principal:

```text
src/main.js
```

`main.js` es como prender las luces: crea la aplicacion y conecta la interfaz
con la logica interna.

## 3. Mapa simple de carpetas

```text
src/
  application/
    ports/
    use-cases/
  composition/
  domain/
  infrastructure/
  presentation/
```

Piensa en la app como una ciudad:

- `domain` es la ley de la ciudad.
- `application` son los tramites que se pueden hacer.
- `ports` son enchufes o contratos.
- `infrastructure` son los servicios externos: bodegas, correo, llaves.
- `presentation` es la ventanilla donde habla el usuario.
- `composition` es quien conecta todos los cables.

## 4. Carpeta `domain`

Funcion general:

Guarda las reglas mas importantes de la app.

Analogía:

Es como el reglamento de un juego de mesa. No importa donde juegues, las reglas
son las mismas.

Ejemplos:

- Que es una conversacion.
- Que es un mensaje.
- Que roles existen: usuario y asistente.
- Que un prompt no puede estar vacio.
- Que un favorito debe ser texto valido.

Archivos importantes:

```text
src/domain/conversation/Conversation.js
src/domain/conversation/ChatMessage.js
src/domain/conversation/MessageRole.js
src/domain/prompt/PromptText.js
src/domain/favorites/FavoritePrompt.js
```

Idea clave:

El dominio no deberia saber nada de botones, cookies, navegador ni HTML.

## 5. Carpeta `application`

Funcion general:

Contiene las acciones que la app sabe hacer.

Analogía:

Es como una lista de servicios en una oficina:

- Enviar mensaje.
- Guardar favorito.
- Renovar token.
- Consultar estado inicial.
- Consultar estado del token.

Dentro hay dos partes:

```text
ports/
use-cases/
```

## 6. Carpeta `application/use-cases`

Funcion general:

Cada archivo representa una accion concreta.

Analogía:

Un caso de uso es como una receta de cocina. No dice de donde viene la harina
ni quien lava los platos; solo dice los pasos para preparar algo.

Ejemplo principal:

```text
SendPromptUseCase.js
```

Flujo que sigue:

1. Recibe el prompt.
2. Valida que no este vacio.
3. Busca la conversacion actual.
4. Agrega el mensaje del usuario.
5. Guarda la conversacion.
6. Pide respuesta al asistente simulado.
7. Agrega la respuesta del asistente.
8. Guarda la conversacion final.

Si ocurre un error 401:

- Borra solo la conversacion temporal.
- No borra los favoritos.

## 7. Carpeta `application/ports`

Funcion general:

Define que necesita la aplicacion, sin decir como se hace.

Analogía:

Es como un enchufe. El enchufe dice: "necesito electricidad", pero no le importa
si viene de una planta, panel solar o bateria.

Ejemplos:

- Necesito guardar conversaciones.
- Necesito guardar favoritos.
- Necesito leer o crear tokens.
- Necesito enviar mensajes al asistente.

Los puertos ayudan a que la app sea flexible. Puedes cambiar la forma de
guardar datos sin reescribir los casos de uso.

## 8. Carpeta `infrastructure`

Funcion general:

Aqui viven las herramientas concretas del navegador.

Analogía:

Si `application` dice "necesito guardar una caja", `infrastructure` decide si
la caja va a una gaveta, un armario o una bodega.

Archivos principales:

```text
CookieTokenRepository.js
SessionConversationRepository.js
LocalFavoritePromptRepository.js
MockLlmGateway.js
SecureTokenGenerator.js
```

Que hace cada uno:

- `CookieTokenRepository`: guarda y lee el token en cookies.
- `SessionConversationRepository`: guarda la conversacion en `sessionStorage`.
- `LocalFavoritePromptRepository`: guarda favoritos en `localStorage`.
- `MockLlmGateway`: simula la respuesta del asistente.
- `SecureTokenGenerator`: crea un token aleatorio.

## 9. Carpeta `presentation`

Funcion general:

Controla lo que el usuario ve y toca.

Analogía:

Es el mostrador de una cafeteria. Tu no ves la cocina completa; solo ves el
menu, los botones y el pedido que entregas.

Archivo principal:

```text
src/presentation/uiManager.js
```

Este archivo:

- Escucha clicks.
- Lee el texto del textarea.
- Muestra mensajes en pantalla.
- Muestra favoritos.
- Abre el modal de sesion expirada.
- Actualiza el contador del token.

Importante:

La UI no guarda datos directamente. Le pide a la aplicacion que haga el trabajo.

## 10. Carpeta `composition`

Funcion general:

Une todas las piezas.

Analogía:

Es como una regleta donde conectas todos los cables: pantalla, cargador,
internet y computadora.

Archivo principal:

```text
src/composition/createWorkspaceApp.js
```

Aqui se conectan:

- Casos de uso.
- Repositorios.
- Gateway simulado.
- Generador de token.

Sin esta carpeta, las piezas existen, pero no estan conectadas.

## 11. Los archivos de la raiz

En la raiz tambien existen:

```text
cookieManager.js
storageManager.js
apiService.js
appController.js
```

Funcion general:

Son fachadas compatibles con el enunciado original.

Analogía:

Son como puertas antiguas que siguen abiertas para que alguien que ya conocia
la casa pueda entrar por ahi. Pero por dentro, esas puertas llevan a la nueva
estructura organizada en `src/`.

## 12. Como funciona el token

El token es como un pase temporal.

Cuando presionas:

```text
Renovar token
```

La app crea una cookie:

```text
access_token
```

Tambien crea otra cookie:

```text
access_token_expires_at
```

La segunda no es el token real. Solo sirve para mostrar el contador:

```text
Token expira en 02:00
```

Si intentas enviar un prompt sin token:

- La app responde con error 401.
- Se abre el modal.
- Se borra la conversacion actual.
- Los favoritos se conservan.

Analogía:

Es como entrar a un evento. Si tu pulsera vencio, tienes que renovarla. Tus
notas personales siguen contigo, pero la conversacion de esa sesion se reinicia.

## 13. Como funciona la conversacion

La conversacion se guarda en:

```text
sessionStorage
```

Eso significa:

- Vive mientras la pestana esta abierta.
- Si cierras esa pestana, se pierde.
- No deberia mezclarse con otra sesion.

Analogía:

Es como una pizarra durante una clase. Mientras la clase sigue, la pizarra
tiene informacion. Cuando termina, se borra.

## 14. Como funcionan los favoritos

Los favoritos se guardan en:

```text
localStorage
```

Eso significa:

- Sobreviven aunque recargues la pagina.
- Sobreviven aunque cierres el navegador.
- No se borran si el token expira.

Analogía:

Son como notas pegadas en una libreta. Aunque termine la conversacion del dia,
esas notas siguen ahi.

## 15. Como responde el asistente

La app no usa una API real externa. Usa un asistente simulado:

```text
MockLlmGateway.js
```

Antes respondia siempre lo mismo:

```text
Esta es una respuesta simulada basada en tu prompt
```

Ahora revisa el prompt actual y mensajes anteriores.

Ejemplo:

```text
Usuario: Tengo hambre
Usuario: Que tengo?
Asistente: Por el contexto, parece que tienes hambre...
```

Analogía:

Es como un profesor de practica. No sabe todo como una IA real, pero si puede
leer lo que acabas de decir y contestar de forma mas relacionada.

## 16. Flujo completo al enviar un prompt

Paso a paso:

1. El usuario escribe algo.
2. La UI captura el texto.
3. La UI llama a la aplicacion.
4. La aplicacion valida el prompt.
5. La aplicacion busca la conversacion guardada.
6. Agrega el mensaje del usuario.
7. Guarda la conversacion en `sessionStorage`.
8. El gateway revisa si existe token.
9. Si no hay token, lanza 401.
10. Si hay token, genera respuesta contextual.
11. La aplicacion agrega la respuesta del asistente.
12. La UI muestra todo en pantalla.

## 17. Seguridad contra XSS

XSS es cuando alguien intenta meter codigo dentro de un texto.

Ejemplo peligroso:

```html
<img src=x onerror=alert(1)>
```

La app evita esto usando:

```js
textContent
```

En vez de:

```js
innerHTML
```

Analogía:

Es como recibir una nota escrita y leerla como texto, no como una orden. Si la
nota dice "abre la puerta", tu solo lees la frase; no obedeces automaticamente.

## 18. Como ejecutar la app

Opcion facil:

```text
start-app.bat
```

Doble click en ese archivo.

Ese archivo:

- Busca un puerto libre.
- Levanta un servidor local.
- Abre la app en el navegador.

Opcion manual:

```powershell
python -m http.server 8010 --bind 127.0.0.1
```

Luego abre:

```text
http://127.0.0.1:8010/index.html
```

No uses doble click directo sobre `index.html`, porque eso abre con `file://`
y puede romper cookies o modulos.

## 19. Que estudiar primero

Orden recomendado:

1. `index.html`
2. `src/main.js`
3. `src/composition/createWorkspaceApp.js`
4. `src/presentation/uiManager.js`
5. `src/application/use-cases/SendPromptUseCase.js`
6. `src/infrastructure/api/MockLlmGateway.js`
7. `src/infrastructure/browser/SessionConversationRepository.js`
8. `src/infrastructure/browser/LocalFavoritePromptRepository.js`
9. `src/infrastructure/browser/CookieTokenRepository.js`
10. `src/domain/conversation/Conversation.js`

## 20. Preguntas de repaso

1. Que archivo se carga primero en el navegador?
2. Por que la conversacion usa `sessionStorage`?
3. Por que los favoritos usan `localStorage`?
4. Que pasa si envio un prompt sin token?
5. Que archivo simula la respuesta del asistente?
6. Por que no se usa `innerHTML` para mostrar prompts?
7. Que papel cumple `createWorkspaceApp.js`?
8. Que diferencia hay entre `domain` e `infrastructure`?
9. Por que existen archivos raiz como `apiService.js` si ya existe `src/`?
10. Que problema evita `start-app.bat`?

## 21. Resumen en una frase

La app es una conversacion con memoria temporal, favoritos permanentes y un
token de sesion, organizada en capas para que cada parte tenga un trabajo claro
y no se mezclen responsabilidades.
