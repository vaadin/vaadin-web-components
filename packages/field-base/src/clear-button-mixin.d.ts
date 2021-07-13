/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to add clear button support to field components.
 */
declare function ClearButtonMixin<T extends new (...args: any[]) => {}>(base: T): T & ClearButtonMixinConstructor;

interface ClearButtonMixinConstructor {
  new (...args: any[]): ClearButtonMixin;
}

interface ClearButtonMixin {
  /**
   * Set to true to display the clear icon which clears the input.
   * @attr {boolean} clear-button-visible
   */
  clearButtonVisible: boolean;

  /**
   * Clear the value of this field.
   */
  clear(): void;

  readonly _clearOnEsc: boolean;
}

export { ClearButtonMixin, ClearButtonMixinConstructor };
