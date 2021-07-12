/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

const DisabledMixinImplementation = (superclass) =>
  class DisabledMixinClass extends superclass {
    static get properties() {
      return {
        /**
         * If true, the user cannot interact with this element.
         */
        disabled: {
          type: Boolean,
          value: false,
          observer: '_disabledChanged',
          reflectToAttribute: true
        }
      };
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _disabledChanged(disabled) {
      this._setAriaDisabled(disabled);
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _setAriaDisabled(disabled) {
      if (disabled) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
  };

/**
 * A mixin to provide disabled property for field components.
 */
export const DisabledMixin = dedupingMixin(DisabledMixinImplementation);
