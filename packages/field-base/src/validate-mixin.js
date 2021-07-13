/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const ValidateMixinImplementation = (superclass) =>
  class ValidateMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        /**
         * Set to true when the field is invalid.
         */
        invalid: {
          type: Boolean,
          reflectToAttribute: true,
          notify: true,
          value: false
        },

        /**
         * Specifies that the user must fill in a value.
         */
        required: {
          type: Boolean,
          reflectToAttribute: true
        },

        /**
         * Error to show when the field is invalid.
         *
         * @attr {string} error-message
         */
        errorMessage: {
          type: String
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        'error-message': () => {
          const error = document.createElement('div');
          error.textContent = this.errorMessage;
          error.setAttribute('aria-live', 'assertive');
          return error;
        }
      };
    }

    static get observers() {
      return ['_updateErrorMessage(invalid, errorMessage)'];
    }

    /** @protected */
    get _errorNode() {
      return this._getDirectSlotChild('error-message');
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (ValidateMixinClass._uniqueId = 1 + ValidateMixinClass._uniqueId || 0);
      this._errorId = `error-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._errorNode) {
        this._errorNode.id = this._errorId;

        this._applyCustomError();
      }
    }

    /**
     * Returns true if field is valid, and sets `invalid` to true otherwise.
     *
     * @return {boolean} True if the value is valid.
     */
    validate() {
      return !(this.invalid = !this.checkValidity());
    }

    /**
     * Returns true if the field value satisfies all constraints (if any).
     *
     * @return {boolean}
     */
    checkValidity() {
      return !this.required || !!this.value;
    }

    /** @protected */
    _applyCustomError() {
      const error = this.__errorMessage;
      if (error && error !== this.errorMessage) {
        this.errorMessage = error;
        delete this.__errorMessage;
      }
    }

    /**
     * @param {boolean} invalid
     * @protected
     */
    _updateErrorMessage(invalid, errorMessage) {
      if (this._errorNode) {
        // save the custom error message content
        if (this._errorNode.textContent && !errorMessage) {
          this.__errorMessage = this._errorNode.textContent.trim();
        }
        const hasError = Boolean(invalid && errorMessage);
        this._errorNode.textContent = hasError ? errorMessage : '';
        this.toggleAttribute('has-error-message', hasError);
      }
    }
  };

/**
 * A mixin to provide required state and validation logic.
 */
export const ValidateMixin = dedupingMixin(ValidateMixinImplementation);
