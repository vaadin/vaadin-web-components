/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const LabelMixinImplementation = (superclass) =>
  class LabelMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        /**
         * The label text for the input node.
         * When no light dom defined via [slot=label], this value will be used.
         */
        label: {
          type: String,
          observer: '_labelChanged'
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        label: () => {
          const label = document.createElement('label');
          label.textContent = this.label;
          return label;
        }
      };
    }

    /** @protected */
    get _labelNode() {
      return this._getDirectSlotChild('label');
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (LabelMixinClass._uniqueId = 1 + LabelMixinClass._uniqueId || 0);
      this._labelId = `label-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._labelNode) {
        this._labelNode.id = this._labelId;

        this._applyCustomLabel();
      }
    }

    /** @protected */
    _applyCustomLabel() {
      const label = this._labelNode.textContent;
      if (label !== this.label) {
        this.label = label;
      }
    }

    /** @protected */
    _labelChanged(label) {
      if (this._labelNode) {
        this._labelNode.textContent = label;
      }

      this.toggleAttribute('has-label', Boolean(label));
    }
  };

/**
 * A mixin to provide label via corresponding property or named slot.
 */
export const LabelMixin = dedupingMixin(LabelMixinImplementation);
