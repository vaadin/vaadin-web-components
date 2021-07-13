/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputMixin } from './input-mixin.js';

const ClearButtonMixinImplementation = (superclass) =>
  class ClearButtonMixinClass extends InputMixin(superclass) {
    static get properties() {
      return {
        /**
         * Set to true to display the clear icon which clears the input.
         * @attr {boolean} clear-button-visible
         */
        clearButtonVisible: {
          type: Boolean,
          reflectToAttribute: true,
          value: false
        }
      };
    }

    /** @protected */
    get _clearOnEsc() {
      return true;
    }

    /** @protected */
    ready() {
      super.ready();

      this.addEventListener('keydown', (e) => this._handleKeyDown(e));

      this._clearElement = this.$.clearButton;
      this._clearElement.addEventListener('click', this._onClearButtonClick.bind(this));
    }

    /**
     * Clear the value of this field.
     */
    clear() {
      this.value = this._inputNode.value = '';
    }

    /** @private */
    _onClearButtonClick(e) {
      e.preventDefault();
      this._inputNode.focus();
      this.clear();
      const inputEvent = new Event('input', { bubbles: true, composed: true });
      inputEvent.__fromClearButton = true;

      const changeEvent = new Event('change', { bubbles: false });
      changeEvent.__fromClearButton = true;

      this._inputNode.dispatchEvent(inputEvent);
      this._inputNode.dispatchEvent(changeEvent);
    }

    /**
     * @param {Event} event
     * @protected
     */
    _handleKeyDown(event) {
      if (event.key === 'Escape' && this.clearButtonVisible && this._clearOnEsc) {
        const dispatchChange = !!this.value;
        this.clear();
        dispatchChange && this._inputNode.dispatchEvent(new Event('change'));
      }
    }
  };

/**
 * A mixin to add clear button support to field components.
 */
export const ClearButtonMixin = dedupingMixin(ClearButtonMixinImplementation);
