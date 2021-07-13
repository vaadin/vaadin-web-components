/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

/**
 * @polymerMixin
 */
export const CustomFieldMixin = (superClass) =>
  class VaadinCustomFieldMixin extends superClass {
    static get properties() {
      return {
        /**
         * Array of available input nodes
         * @type {!Array<!HTMLElement> | undefined}
         */
        inputs: {
          type: Array,
          readOnly: true
        },

        /**
         * The object used to localize this component.
         * To change the default localization, replace the entire
         * _i18n_ object or just the property you want to modify.
         *
         * The object has the following JSON structure:
         *
         * ```
         * {
         *   // A function to format given `Array` as
         *   // component value. Array is list of all internal values
         *   // in the order of their presence in the DOM
         *   // This function is called each time the internal input
         *   // value is changed.
         *   formatValue: inputValues => {
         *     // returns a representation of the given array of values
         *     // in the form of string with delimiter characters
         *   },
         *
         *   // A function to parse the given value to an `Array` in the format
         *   // of the list of all internal values
         *   // in the order of their presence in the DOM
         *   // This function is called when value of the
         *   // custom field is set.
         *   parseValue: value => {
         *     // returns the array of values from parsed value string.
         *   }
         * }
         * ```
         *
         * @type {!CustomFieldI18n}
         */
        i18n: {
          type: Object,
          value: () => {
            return {
              parseValue: function (value) {
                return value.split('\t');
              },
              formatValue: function (inputValues) {
                return inputValues.join('\t');
              }
            };
          }
        },

        /** @private */
        __errorId: String,

        /** @private */
        __labelId: String,

        /** @private */
        __helperTextId: String,

        /** @private */
        __hasSlottedHelper: Boolean
      };
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();
      if (this.__observer) {
        this.__observer.connect();
      }
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();
      this.__observer && this.__observer.disconnect();
    }

    /** @protected */
    ready() {
      super.ready();

      this.__setInputsFromSlot();
      this.__observer = new FlattenedNodesObserver(this.$.slot, () => {
        this.__setInputsFromSlot();
      });

      this.$.helperSlot.addEventListener('slotchange', this.__onHelperSlotChange.bind(this));
      this.__onHelperSlotChange();

      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      this.addEventListener('keydown', (e) => {
        if (e.keyCode === 9) {
          // FIXME (yuriy): remove this workaround once this issue is fixed:
          // https://bugs.chromium.org/p/chromium/issues/detail?id=1014868&can=2&num=100&q=slot%20shift%20tab
          if (e.target.parentElement.localName === 'slot' && !e.defaultPrevented && isChrome) {
            const slot = e.target.parentElement;
            slot.setAttribute('tabindex', -1);
            setTimeout(() => slot.removeAttribute('tabindex'));
          }
          if (
            (this.inputs.indexOf(e.target) < this.inputs.length - 1 && !e.shiftKey) ||
            (this.inputs.indexOf(e.target) > 0 && e.shiftKey)
          ) {
            this.dispatchEvent(new CustomEvent('internal-tab'));
          } else {
            // FIXME (yuriy): remove this workaround when value should not be updated before focusout
            this.__setValue();
          }
        }
      });

      this.addEventListener('focusin', () => this.setAttribute('focused', ''));

      this.addEventListener('focusout', () => {
        const activeElement = this.getRootNode().activeElement;
        if (
          !this.inputs.some((el) => activeElement === el || (el.shadowRoot && el.shadowRoot.contains(activeElement)))
        ) {
          this.removeAttribute('focused');
        }
      });

      this.addEventListener('click', this._onClick.bind(this), true);

      var uniqueId = (CustomFieldMixin._uniqueId = 1 + CustomFieldMixin._uniqueId || 1);
      this.__errorId = `${this.constructor.is}-error-${uniqueId}`;
      this.__labelId = `${this.constructor.is}-label-${uniqueId}`;
      this.__helperTextId = `${this.constructor.is}-helper-${uniqueId}`;
    }

    /** @protected */
    focus() {
      this.inputs && this.inputs[0] && this.inputs[0].focus();
    }

    /** @private */
    __updateValue(e) {
      // Stop native change events
      e && e.stopPropagation();

      this.__setValue();
      this.validate();
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          cancelable: false,
          detail: {
            value: this.value
          }
        })
      );
    }

    /** @private */
    __setValue() {
      this.__settingValue = true;
      this.value = this.i18n.formatValue.apply(this, [this.inputs.map((input) => input.value)]);
      this.__settingValue = false;
    }

    /**
     * Like querySelectorAll('*') but also gets all elements through any nested slots recursively
     * @private
     */
    __queryAllAssignedElements(elem) {
      const result = [];
      let elements;
      if (elem.tagName === 'SLOT') {
        elements = elem.assignedNodes({ flatten: true }).filter((node) => node.nodeType === Node.ELEMENT_NODE);
      } else {
        result.push(elem);
        elements = Array.from(elem.children);
      }
      elements.forEach((elem) => result.push(...this.__queryAllAssignedElements(elem)));
      return result;
    }

    /** @private */
    __getInputsFromSlot() {
      const isInput = (node) => node.validate || node.checkValidity;
      return this.__queryAllAssignedElements(this.$.slot).filter(isInput);
    }

    /** @private */
    __setInputsFromSlot() {
      this._setInputs(this.__getInputsFromSlot());
      this.__setValue();
    }

    /** @private */
    __valueChanged(value, oldValue) {
      if (this.__settingValue || !this.inputs) {
        return;
      }

      const valuesArray = this.i18n.parseValue(value);
      if (!valuesArray || valuesArray.length == 0) {
        console.warn('Value parser has not provided values array');
        return;
      }

      this.inputs.forEach((input, id) => (input.value = valuesArray[id]));
      if (oldValue !== undefined) {
        this.validate();
      }
    }

    /** @private */
    __onHelperSlotChange() {
      const slottedNodes = this.$.helperSlot.assignedNodes({ flatten: true });
      // Only has slotted helper if not a text node
      // Text nodes are added by the helperText prop and not the helper slot
      // The filter is added due to shady DOM triggering this slotchange event on helperText prop change
      this.__hasSlottedHelper = slottedNodes.filter((node) => node.nodeType !== 3).length > 0;

      if (this.__hasSlottedHelper) {
        this.setAttribute('has-helper', 'slotted');
      } else if (this.helperText === '' || this.helperText === null) {
        this.removeAttribute('has-helper');
      }
    }

    _onClick(e) {
      if (e.target.getAttribute('slot') === 'helper') e.preventDefault();
    }

    /**
     * Fired on Tab keydown triggered from the internal inputs,
     * meaning focus will not leave the inputs.
     *
     * @event internal-tab
     */

    /**
     * Fired when the user commits a value change for any of the internal inputs.
     *
     * @event change
     */
  };
