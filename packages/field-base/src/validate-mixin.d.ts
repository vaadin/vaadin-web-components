/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to provide required state and validation logic.
 */
declare function ValidateMixin<T extends new (...args: any[]) => {}>(base: T): T & ValidateMixinConstructor;

interface ValidateMixinConstructor {
  new (...args: any[]): ValidateMixin;
}

interface ValidateMixin {
  /**
   * Set to true when the field is invalid.
   */
  invalid: boolean;

  /**
   * Specifies that the user must fill in a value.
   */
  required: boolean;

  /**
   * Error to show when the field is invalid.
   *
   * @attr {string} error-message
   */
  errorMessage: string;

  /**
   * Returns true if field is valid, and sets `invalid` to true otherwise.
   */
  validate(): boolean;

  /**
   * Returns true if the field value satisfies all constraints (if any).
   */
  checkValidity(): boolean;
}

export { ValidateMixinConstructor, ValidateMixin };
