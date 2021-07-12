/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const InputMixinImplementation = (superclass) =>
  class InputMixinClass extends SlotMixin(superclass) {
    static get properties() {
      /**
       * String used to define input type.
       */
      return {
        type: {
          type: String,
          readOnly: true
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        input: () => {
          const native = document.createElement('input');
          const value = this.getAttribute('value');
          if (value) {
            native.setAttribute('value', value);
          }
          const name = this.getAttribute('name');
          if (name) {
            native.setAttribute('name', name);
          }
          if (this.type) {
            native.setAttribute('type', this.type);
          }
          return native;
        }
      };
    }

    /** @protected */
    get _inputNode() {
      return this._getDirectSlotChild('input');
    }
  };

/**
 * A mixin to add `<input>` element to the corresponding named slot.
 */
export const InputMixin = dedupingMixin(InputMixinImplementation);
