export default class AppError extends Error {
  code: number; // Add a type for the `code` property
  operational: boolean; // Add a type for the `operational` property
  constructor(code: number, message: string) {
    super(message);
    this.code = code || 500;
    this.operational = true;
  }
}
