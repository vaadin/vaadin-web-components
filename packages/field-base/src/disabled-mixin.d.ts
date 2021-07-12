/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to provide disabled property for field components.
 */
declare function DisabledMixin<T extends new (...args: any[]) => {}>(base: T): T & DisabledMixinConstructor;

interface DisabledMixinConstructor {
  new (...args: any[]): DisabledMixin;
}

interface DisabledMixin {
  /**
   * If true, the user cannot interact with this element.
   */
  disabled: boolean;
}

export { DisabledMixinConstructor, DisabledMixin };
