/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { LabelMixin } from './label-mixin.js';
import { InputMixin } from './input-mixin.js';

const InputAriaMixinImplementation = (superclass) =>
  class InputAriaMixinClass extends InputMixin(LabelMixin(superclass)) {
    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (InputAriaMixinClass._uniqueId = 1 + InputAriaMixinClass._uniqueId || 0);
      this._inputId = `${this.localName}-${uniqueId}`;

      this.__preventDuplicateLabelClick = this.__preventDuplicateLabelClick.bind(this);
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      this._enhanceLightDomA11y();

      if (this._labelNode) {
        this._labelNode.addEventListener('click', this.__preventDuplicateLabelClick);
      }
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._labelNode) {
        this._labelNode.removeEventListener('click', this.__preventDuplicateLabelClick);
      }
    }

    /** @protected */
    _enhanceLightDomA11y() {
      if (this._inputNode) {
        this._inputNode.id = this._inputId;
        this._inputNode.setAttribute('aria-labelledby', this._labelId);
      }

      if (this._labelNode) {
        this._labelNode.setAttribute('for', this._inputId);
      }
    }

    /**
     * The native platform fires an event for both the click on the label, and also
     * the subsequent click on the native input element caused by label click.
     * This results in two click events arriving at the host, but we only want one.
     * This method prevents the duplicate click and ensures the correct isTrusted event
     * with the correct event.target arrives at the host.
     * @private
     */
    __preventDuplicateLabelClick() {
      const inputClickHandler = (e) => {
        e.stopImmediatePropagation();
        this._inputNode.removeEventListener('click', inputClickHandler);
      };
      this._inputNode.addEventListener('click', inputClickHandler);
    }
  };

/**
 * A mixin to link slotted `<input>` and `<label>` elements.
 */
export const InputAriaMixin = dedupingMixin(InputAriaMixinImplementation);
