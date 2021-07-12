/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to provide content for named slots defined by component.
 */
declare function SlotMixin<T extends new (...args: any[]) => {}>(base: T): T & SlotMixinConstructor;

interface SlotMixinConstructor {
  new (...args: any[]): SlotMixin;
}

interface SlotMixin {
  /**
   * List of named slots to initialize.
   */
  readonly slots: Record<string, () => HTMLElement>;
}

export { SlotMixinConstructor, SlotMixin };
