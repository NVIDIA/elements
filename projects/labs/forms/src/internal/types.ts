export type FormControlValue = string | number | File | File[] | null | {};

interface SchemaBase {
  type: string;
  description?: string;
  format?: string;
}

export interface StringSchema extends SchemaBase {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberSchema extends SchemaBase {
  type: 'number';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}

export interface BooleanSchema extends SchemaBase {
  type: 'boolean';
}

export interface ArraySchema extends SchemaBase {
  type: 'array';
  items: Schema;
  minItems?: number;
  maxItems?: number;
}

export interface ObjectSchema extends SchemaBase {
  type: 'object';
  properties: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
}

export interface EnumSchema extends SchemaBase {
  type: 'enum';
  enum: Array<string | number>;
}

export type Schema = StringSchema | NumberSchema | BooleanSchema | ArraySchema | ObjectSchema | EnumSchema;

export interface FormControlMetadata {
  tag: string;
  valueSchema: Schema;
  version?: string;
  validators?: Validator[];
  strict?: boolean;
}

interface FormControlInstance extends HTMLElement {
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  form: HTMLFormElement | null;
  readonly: boolean;
  name: string;
  noValidate: boolean;
  willValidate: boolean;
  validity: ValidityState;
  validationMessage: string;
  required?: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}

/**
 * @event InputEvent<'input'>
 * @event Event<'change'>
 */
export interface FormControl {
  new (...args: any[]): FormControlInstance; // eslint-disable-line @typescript-eslint/no-explicit-any
  formAssociated: boolean;
  metadata: FormControlMetadata;
  localName?: string;
}

export type ChangeEvent = Event & { type: 'change' };

export interface ValidatorResult {
  validity: Partial<ValidityState>;
  message?: string;
}

export type Validator = (value: unknown, element: FormControl) => ValidatorResult;
