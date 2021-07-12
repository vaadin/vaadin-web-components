/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * A mixin to handle `focused` and `focus-ring` attributes based on focus.
 */
declare function FocusMixin<T extends new (...args: any[]) => {}>(base: T): T & FocusMixinConstructor;

interface FocusMixinConstructor {
  new (...args: any[]): FocusMixin;
}

interface FocusMixin {
  /**
   * Override to change how focused and focus-ring attributes are set.
   */
  _setFocused(focused: boolean): void;

  /**
   * Override to define if the field receives focus based on the event.
   */
  _shouldSetFocus(event: FocusEvent): boolean;

  /**
   * Override to define if the field loses focus based on the event.
   */
  _shouldRemoveFocus(event: FocusEvent): boolean;
}

export { FocusMixinConstructor, FocusMixin };
