export interface ValidityState {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/badInput) */
  readonly badInput: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/customError) */
  readonly customError: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/patternMismatch) */
  readonly patternMismatch: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/rangeOverflow) */
  readonly rangeOverflow: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/rangeUnderflow) */
  readonly rangeUnderflow: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/stepMismatch) */
  readonly stepMismatch: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/tooLong) */
  readonly tooLong: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/tooShort) */
  readonly tooShort: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/typeMismatch) */
  readonly typeMismatch: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/valid) */
  readonly valid: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/ValidityState/valueMissing) */
  readonly valueMissing: boolean;
}

// explicit definition for CEM JSON schema
export type ValidityStateError =
  | 'badInput'
  | 'customError'
  | 'patternMismatch'
  | 'rangeOverflow'
  | 'rangeUnderflow'
  | 'stepMismatch'
  | 'tooLong'
  | 'tooShort'
  | 'typeMismatch'
  | 'valid'
  | 'valueMissing';
