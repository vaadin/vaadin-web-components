/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to link slotted `<input>` and `<label>` elements.
 */
declare function InputAriaMixin<T extends new (...args: any[]) => {}>(base: T): T & InputAriaMixinConstructor;

interface InputAriaMixinConstructor {
  new (...args: any[]): InputAriaMixin;
}

interface InputAriaMixin {}

export { InputAriaMixin, InputAriaMixinConstructor };
