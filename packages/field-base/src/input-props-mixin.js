/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputAriaMixin } from './input-aria-mixin.js';
import { ValidateMixin } from './validate-mixin.js';

const InputPropsMixinImplementation = (superclass) =>
  class InputPropsMixinClass extends ValidateMixin(InputAriaMixin(superclass)) {
    static get properties() {
      return {
        /**
         * The name of this field.
         */
        name: {
          type: String
        },

        /**
         * A hint to the user of what can be entered in the field.
         */
        placeholder: {
          type: String
        },

        /**
         * When present, it specifies that the field is read-only.
         */
        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        }
      };
    }

    static get hostProps() {
      return ['name', 'placeholder', 'readonly', 'required', 'invalid'];
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._inputNode) {
        // Propagate initially defined properties to the slotted input
        this._propagateHostAttributes(this.constructor.hostProps.map((attr) => this[attr]));
      }
    }

    /** @protected */
    ready() {
      super.ready();

      // create observer dynamically to allow subclasses to override hostProps
      this._createMethodObserver(`_hostPropsChanged(${this.constructor.hostProps.join(', ')})`);
    }

    /** @private */
    _hostPropsChanged(...attributesValues) {
      this._propagateHostAttributes(attributesValues);
    }

    /** @private */
    _propagateHostAttributes(attributesValues) {
      const input = this._inputNode;
      const attributeNames = this.constructor.hostProps;

      attributeNames.forEach((attr, index) => {
        if (attr === 'invalid') {
          this._setOrToggleAttribute('aria-invalid', this.invalid ? 'true' : false, input);
        } else {
          this._setOrToggleAttribute(attr, attributesValues[index], input);
        }
      });
    }

    /** @protected */
    _setOrToggleAttribute(name, value, node) {
      if (!name || !node) {
        return;
      }

      if (value) {
        node.setAttribute(name, typeof value === 'boolean' ? '' : value);
      } else {
        node.removeAttribute(name);
      }
    }
  };

export const InputPropsMixin = dedupingMixin(InputPropsMixinImplementation);
