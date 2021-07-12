/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to add `<input>` element to the corresponding named slot.
 */
declare function InputMixin<T extends new (...args: any[]) => {}>(base: T): T & InputMixinConstructor;

interface InputMixinConstructor {
  new (...args: any[]): InputMixin;
}

interface InputMixin {
  /**
   * String used to define input type.
   */
  readonly type: string;
}

export { InputMixinConstructor, InputMixin };
