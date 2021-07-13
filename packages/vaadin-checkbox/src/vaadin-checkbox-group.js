/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { DirMixin } from '@vaadin/vaadin-element-mixin/vaadin-dir-mixin.js';
import { CheckboxElement } from './vaadin-checkbox.js';

/**
 * `<vaadin-checkbox-group>` is a Polymer element for grouping vaadin-checkboxes.
 *
 * ```html
 * <vaadin-checkbox-group label="Preferred language of contact:">
 *  <vaadin-checkbox value="en">English</vaadin-checkbox>
 *  <vaadin-checkbox value="fr">Français</vaadin-checkbox>
 *  <vaadin-checkbox value="de">Deutsch</vaadin-checkbox>
 * </vaadin-checkbox-group>
 * ```
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `label` | The label element
 * `group-field` | The element that wraps checkboxes
 * `error-message` | The error message element
 *
 * The following state attributes are available for styling:
 *
 * Attribute  | Description | Part name
 * -----------|-------------|------------
 * `disabled`   | Set when the checkbox group and its children are disabled. | :host
 * `focused` | Set when the checkbox group contains focus | :host
 * `has-label` | Set when the element has a label | :host
 * `has-value` | Set when the element has a value | :host
 * `has-helper` | Set when the element has helper text or slot | :host
 * `has-error-message` | Set when the element has an error message, regardless if the field is valid or not | :host
 * `required` | Set when the element is required | :host
 * `invalid` | Set when the element is invalid | :host
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes ThemableMixin
 * @mixes DirMixin
 * @element vaadin-checkbox-group
 */
class CheckboxGroupElement extends ThemableMixin(DirMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-flex;
        }

        :host::before {
          content: '\\2003';
          width: 0;
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        .vaadin-group-field-container {
          display: flex;
          flex-direction: column;
        }

        [part='label']:empty {
          display: none;
        }
      </style>

      <div class="vaadin-group-field-container">
        <label part="label">[[label]]</label>

        <div part="group-field">
          <slot id="slot"></slot>
        </div>

        <div
          part="helper-text"
          aria-live="assertive"
          aria-hidden$="[[_getHelperTextAriaHidden(helperText, _hasSlottedHelper)]]"
        >
          <slot name="helper">[[helperText]]</slot>
        </div>

        <div
          part="error-message"
          aria-live="assertive"
          aria-hidden$="[[_getErrorMessageAriaHidden(invalid, errorMessage)]]"
          >[[errorMessage]]</div
        >
      </div>
    `;
  }

  static get is() {
    return 'vaadin-checkbox-group';
  }

  static get properties() {
    return {
      /**
       * The current disabled state of the checkbox group. True if group and all internal checkboxes are disabled.
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_disabledChanged'
      },

      /**
       * String used for the label element.
       */
      label: {
        type: String,
        value: '',
        observer: '_labelChanged'
      },

      /**
       * Value of the checkbox group.
       * Note: toggling the checkboxes modifies the value by creating new
       * array each time, to override Polymer dirty-checking for arrays.
       * You can still use Polymer array mutation methods to update the value.
       * @type {!Array<!string>}
       */
      value: {
        type: Array,
        value: () => [],
        notify: true
      },

      /**
       * Error to show when the input value is invalid.
       * @attr {string} error-message
       */
      errorMessage: {
        type: String,
        value: '',
        observer: '_errorMessageChanged'
      },

      /**
       * String used for the helper text.
       * @attr {string} helper-text
       * @type {string | null}
       */
      helperText: {
        type: String,
        value: '',
        observer: '_helperTextChanged'
      },

      /**
       * Specifies that the user must fill in a value.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * This property is set to true when the control value is invalid.
       * @type {boolean}
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false
      },

      /** @private */
      _hasSlottedHelper: Boolean
    };
  }

  static get observers() {
    return ['_updateValue(value, value.splices)'];
  }

  ready() {
    super.ready();

    this.addEventListener('focusin', () => this._setFocused(this._containsFocus()));

    this.addEventListener('focusout', (e) => {
      // validate when stepping out of the checkbox group
      if (
        !this._checkboxes.some(
          (checkbox) => e.relatedTarget === checkbox || checkbox.shadowRoot.contains(e.relatedTarget)
        )
      ) {
        this.validate();
        this._setFocused(false);
      }
    });

    const checkedChangedListener = (e) => {
      this._changeSelectedCheckbox(e.target);
    };

    this._observer = new FlattenedNodesObserver(this, (info) => {
      const addedCheckboxes = this._filterCheckboxes(info.addedNodes);

      addedCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('checked-changed', checkedChangedListener);
        if (this.disabled) {
          checkbox.disabled = true;
        }
        if (checkbox.checked) {
          this._addCheckboxToValue(checkbox.value);
        } else if (this.value.indexOf(checkbox.value) > -1) {
          checkbox.checked = true;
        }
      });

      this._filterCheckboxes(info.removedNodes).forEach((checkbox) => {
        checkbox.removeEventListener('checked-changed', checkedChangedListener);
        if (checkbox.checked) {
          this._removeCheckboxFromValue(checkbox.value);
        }
      });

      this._setOrToggleHasHelperAttribute();

      const hasValue = (checkbox) => {
        const { value } = checkbox;
        return checkbox.hasAttribute('value') || (value && value !== 'on');
      };
      if (!addedCheckboxes.every(hasValue)) {
        console.warn('Please add value attribute to all checkboxes in checkbox group');
      }
    });
  }

  /**
   * Returns true if `value` is valid.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    this.invalid = this.required && this.value.length === 0;
    return !this.invalid;
  }

  /** @private */
  get _checkboxes() {
    return this._filterCheckboxes(this.querySelectorAll('*'));
  }

  /** @private */
  _filterCheckboxes(nodes) {
    return Array.from(nodes).filter((child) => child instanceof CheckboxElement);
  }

  /** @private */
  _disabledChanged(disabled) {
    this.setAttribute('aria-disabled', disabled);

    this._checkboxes.forEach((checkbox) => (checkbox.disabled = disabled));
  }

  /**
   * @param {string} value
   * @protected
   */
  _addCheckboxToValue(value) {
    if (this.value.indexOf(value) === -1) {
      this.value = this.value.concat(value);
    }
  }

  /**
   * @param {string} value
   * @protected
   */
  _removeCheckboxFromValue(value) {
    this.value = this.value.filter((v) => v !== value);
  }

  /**
   * @param {CheckboxElement} checkbox
   * @protected
   */
  _changeSelectedCheckbox(checkbox) {
    if (this._updatingValue) {
      return;
    }

    if (checkbox.checked) {
      this._addCheckboxToValue(checkbox.value);
    } else {
      this._removeCheckboxFromValue(checkbox.value);
    }
  }

  /** @private */
  _updateValue(value) {
    // setting initial value to empty array, skip validation
    if (value.length === 0 && this._oldValue === undefined) {
      return;
    }

    if (value.length) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }

    this._oldValue = value;
    // set a flag to avoid updating loop
    this._updatingValue = true;
    // reflect the value array to checkboxes
    this._checkboxes.forEach((checkbox) => {
      checkbox.checked = value.indexOf(checkbox.value) > -1;
    });
    this._updatingValue = false;

    this.validate();
  }

  /** @private */
  _labelChanged(label) {
    this._setOrToggleAttribute('has-label', !!label);
  }

  /** @private */
  _errorMessageChanged(errorMessage) {
    this._setOrToggleAttribute('has-error-message', !!errorMessage);
  }

  /** @private */
  _helperTextChanged(helperText) {
    this._setOrToggleAttribute('has-helper', !!helperText);
  }

  /** @private */
  _setOrToggleAttribute(name, value) {
    if (!name) {
      return;
    }

    if (value) {
      this.setAttribute(name, typeof value === 'boolean' ? '' : value);
    } else {
      this.removeAttribute(name);
    }
  }

  /** @private */
  _getErrorMessageAriaHidden(invalid, errorMessage) {
    return (!errorMessage || !invalid).toString();
  }

  /**
   * @return {boolean}
   * @protected
   */
  _containsFocus() {
    const activeElement = this.getRootNode().activeElement;
    return this.contains(activeElement);
  }

  /**
   * @param {boolean} focused
   * @protected
   */
  _setFocused(focused) {
    if (focused) {
      this.setAttribute('focused', '');
    } else {
      this.removeAttribute('focused');
    }
  }

  /** @private */
  _setOrToggleHasHelperAttribute() {
    const slottedNodes = this.shadowRoot.querySelector(`[name="helper"]`).assignedNodes();
    // Only has slotted helper if not a text node
    // Text nodes are added by the helperText prop and not the helper slot
    // The filter is added due to shady DOM triggering this slotchange event on helperText prop change
    this._hasSlottedHelper = slottedNodes.filter((node) => node.nodeType !== 3).length > 0;

    this._setOrToggleAttribute('has-helper', this._hasSlottedHelper ? 'slotted' : !!this.helperText);
  }

  /** @private */
  _getHelperTextAriaHidden(helperText, hasSlottedHelper) {
    return (!(helperText || hasSlottedHelper)).toString();
  }
}

customElements.define(CheckboxGroupElement.is, CheckboxGroupElement);

export { CheckboxGroupElement };
