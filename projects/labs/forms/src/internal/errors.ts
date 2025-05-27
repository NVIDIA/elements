export class FormControlError extends Error {
  constructor(formControlName: string, message: string) {
    super(`(${formControlName}): ${message}`);
    this.name = 'FormControlError';
  }
}
