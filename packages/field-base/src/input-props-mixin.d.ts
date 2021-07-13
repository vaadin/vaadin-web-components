/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to add `<input>` element to the corresponding named slot.
 */
declare function InputPropsMixin<T extends new (...args: any[]) => {}>(base: T): T & InputPropsMixinConstructor;

interface InputPropsMixinConstructor {
  new (...args: any[]): InputPropsMixin;
}

interface InputPropsMixin {
  /**
   * The name of this field.
   */
  name: string;

  /**
   * A hint to the user of what can be entered in the field.
   */
  placeholder: string;

  /**
   * When present, it specifies that the field is read-only.
   */
  readonly: boolean;
}

export { InputPropsMixinConstructor, InputPropsMixin };
