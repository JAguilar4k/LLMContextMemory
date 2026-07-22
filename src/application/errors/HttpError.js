export class HttpError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
    Object.freeze(this.details);
    Object.freeze(this);
  }
}
