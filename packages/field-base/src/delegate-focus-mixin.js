/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { FocusMixin } from './focus-mixin.js';
import { DisabledMixin } from './disabled-mixin.js';

const DelegateFocusMixinImplementation = (superclass) =>
  class DelegateFocusMixinClass extends FocusMixin(DisabledMixin(superclass)) {
    /**
     * Any element extending this mixin is required to implement this getter.
     * It returns the actual focusable element in the component.
     * @return {Element | null | undefined}
     */
    get focusElement() {
      console.warn(`Please implement the 'focusElement' property in <${this.localName}>`);
      return null;
    }

    focus() {
      if (!this.focusElement || this.disabled) {
        return;
      }

      this.focusElement.focus();
      this._setFocused(true);
    }

    blur() {
      if (!this.focusElement) {
        return;
      }
      this.focusElement.blur();
      this._setFocused(false);
    }

    click() {
      if (this.focusElement && !this.disabled) {
        this.focusElement.click();
      }
    }

    /**
     * @param {Event} event
     * @return {boolean}
     * @protected
     */
    _shouldSetFocus(event) {
      return event.composedPath()[0] === this.focusElement;
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _disabledChanged(disabled) {
      super._disabledChanged(disabled);

      if (this.focusElement) {
        this.focusElement.disabled = disabled;
      }

      if (disabled) {
        this.blur();
      }
    }
  };

/**
 * A mixin to forward focus to an element in the light DOM.
 */
export const DelegateFocusMixin = dedupingMixin(DelegateFocusMixinImplementation);
