import { createWorkspaceApp } from "./composition/createWorkspaceApp.js?v=20260721-contextual-v2";
import { WorkspaceUi } from "./presentation/uiManager.js?v=20260721-contextual-v2";

function bootstrap() {
  const workspaceApp = createWorkspaceApp();
  const ui = new WorkspaceUi({ workspaceApp });
  ui.mount();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
