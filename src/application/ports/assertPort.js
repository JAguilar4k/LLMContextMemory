export function assertPort(portName, adapter, requiredMethods) {
  if (!adapter || typeof adapter !== "object") {
    throw new TypeError(`${portName} debe ser un objeto adaptador.`);
  }

  for (const methodName of requiredMethods) {
    if (typeof adapter[methodName] !== "function") {
      throw new TypeError(`${portName} debe implementar ${methodName}().`);
    }
  }
}
