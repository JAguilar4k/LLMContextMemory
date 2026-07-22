# Prompt Engineer Workspace

Aplicacion web de una sola pagina hecha con JavaScript nativo, modulos ES6,
arquitectura Hexagonal, DDD y separacion por capas.

## Requisitos

- Un navegador moderno.
- Python instalado para levantar un servidor local simple.
- Conexion a internet si quieres que Tailwind CSS cargue desde el CDN.

> Importante: no abras `index.html` con doble clic usando `file://`.
> Las cookies y los modulos ES funcionan correctamente desde un servidor local.

## Como ejecutar la app

Opcion recomendada en Windows: haz doble click en:

```text
start-app.bat
```

Ese archivo abre el navegador y levanta el servidor local automaticamente.
Si el puerto `8010` ya esta ocupado por un servidor anterior, el lanzador busca
otro puerto libre entre `8010` y `8030` y abre la URL correcta con un parametro
anti-cache.

Tambien puedes hacerlo manualmente:

Abre PowerShell en la carpeta del proyecto:

```powershell
cd "C:\Users\Julian\UNIVERSIDAD\IICuatrimestre\WEB\Practica 2"
```

Levanta el servidor local:

```powershell
python -m http.server 8010 --bind 127.0.0.1
```

Si tu instalacion usa el lanzador `py`, puedes usar:

```powershell
py -m http.server 8010 --bind 127.0.0.1
```

Luego abre esta URL en el navegador:

```text
http://127.0.0.1:8010/index.html
```

Para detener el servidor, vuelve a la terminal y presiona:

```text
Ctrl + C
```

## Como usarla

1. Presiona `Renovar token`.
2. Verifica que el contador cambie a algo como `Token expira en 02:00`.
3. Escribe un prompt y presiona `Enviar`.
4. Para guardar un prompt, escribelo en el textarea y presiona `Guardar prompt actual`.

Si intentas enviar un prompt sin token, la app debe mostrar el modal
`Sesion expirada (401)`, borrar solo la conversacion actual y conservar los
favoritos.

## Persistencia esperada

- `sessionStorage`: guarda la conversacion actual.
- `localStorage`: guarda los prompts favoritos.
- Cookies: guarda `access_token` y `access_token_expires_at`.

El token dura 2 minutos por defecto.

## Respuestas del asistente

La app usa un gateway LLM simulado en el navegador. No se conecta a una API
externa real, pero genera respuestas contextuales usando el prompt actual y los
mensajes anteriores de la conversacion.

Ejemplo:

```text
Usuario: Tengo sueno
Asistente: Suena a cansancio o sueno acumulado...

Usuario: Que tengo?
Asistente: Por lo que dijiste antes, parece que tienes sueno o cansancio...
```

## Estructura principal

```text
index.html
cookieManager.js
storageManager.js
apiService.js
appController.js
src/
  main.js
  composition/
  application/
    errors/
    ports/
    use-cases/
  domain/
  infrastructure/
  presentation/
```

Los archivos raiz (`cookieManager.js`, `storageManager.js`, `apiService.js`,
`appController.js`) funcionan como fachadas compatibles con los requerimientos
originales. La implementacion principal vive dentro de `src/`.

## Arquitectura aplicada

- `domain/`: reglas del negocio. Contiene objetos inmutables como
  `Conversation`, `ChatMessage`, `PromptText` y `FavoritePrompt`. No importa
  DOM, cookies, storage, red ni UI.
- `application/`: casos de uso y puertos. Orquesta acciones como enviar un
  prompt, renovar token y guardar favoritos. Depende de abstracciones, no de
  implementaciones del navegador.
- `infrastructure/`: adaptadores concretos del navegador: cookies,
  `sessionStorage`, `localStorage`, generador de token y gateway LLM simulado.
- `presentation/`: renderizado y eventos de UI. No decide reglas de negocio.
- `composition/`: punto de ensamblaje. Conecta casos de uso con adaptadores.

Los puertos se validan en tiempo de ejecucion con `assertPort`, por lo que un
adaptador nuevo debe implementar los metodos esperados antes de poder conectarse
a la aplicacion.

## Solucion de problemas

- Si el token no aparece, confirma que estas usando `http://127.0.0.1:8010`
  y no `file://`.
- Si las respuestas siguen saliendo como la frase fija anterior, recarga la
  pagina o vuelve a abrir la app desde `start-app.bat`. La app usa imports
  versionados y limpia conversaciones antiguas que tengan la respuesta fija
  heredada.
- Si el puerto `8010` esta ocupado, usa otro puerto:

```powershell
python -m http.server 8011 --bind 127.0.0.1
```

Y abre:

```text
http://127.0.0.1:8011/index.html
```

- Si Tailwind no carga estilos, revisa la conexion a internet.
- Si quieres inspeccionar datos, abre DevTools y revisa la pestana
  `Application`: `Local Storage`, `Session Storage` y `Cookies`.
