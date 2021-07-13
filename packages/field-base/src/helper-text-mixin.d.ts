/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to provide helper text via corresponding property or named slot.
 */
declare function HelperTextMixin<T extends new (...args: any[]) => {}>(base: T): T & HelperTextMixinConstructor;

interface HelperTextMixinConstructor {
  new (...args: any[]): HelperTextMixin;
}

interface HelperTextMixin {
  /**
   * String used for the helper text.
   */
  helperText: string;
}

export { HelperTextMixinConstructor, HelperTextMixin };
