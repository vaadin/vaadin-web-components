/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const HelperTextMixinImplementation = (superclass) =>
  class HelperTextMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        /**
         * String used for the helper text.
         * @attr {string} helper-text
         */
        helperText: {
          type: String,
          observer: '_helperTextChanged'
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        helper: () => {
          const helper = document.createElement('div');
          helper.textContent = this.helperText;
          return helper;
        }
      };
    }

    /** @protected */
    get _helperNode() {
      return this._getDirectSlotChild('helper');
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (HelperTextMixinClass._uniqueId = 1 + HelperTextMixinClass._uniqueId || 0);
      this._helperId = `helper-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._helperNode) {
        this._helperNode.id = this._helperId;

        this._applyCustomHelper();
      }
    }

    /** @protected */
    _applyCustomHelper() {
      const helper = this._helperNode.textContent;
      if (helper !== this.helperText) {
        this.helperText = helper;
      }
    }

    /** @protected */
    _helperTextChanged(helper) {
      if (this._helperNode) {
        this._helperNode.textContent = helper;
      }

      this.toggleAttribute('has-helper', Boolean(helper));
    }
  };

/**
 * A mixin to provide helper text via corresponding property or named slot.
 */
export const HelperTextMixin = dedupingMixin(HelperTextMixinImplementation);
