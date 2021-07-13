/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { CustomFieldMixin } from './vaadin-custom-field-mixin.js';

/**
 * `<vaadin-custom-field>` is a Web Component providing field wrapper functionality.
 *
 * ```
 * <vaadin-custom-field label="Appointment time">
 *   <vaadin-date-picker></vaadin-date-picker>
 *   <vaadin-time-picker></vaadin-time-picker>
 * </vaadin-custom-field>
 * ```
 *
 * ### Styling
 *
 * You may set the attribute `disabled` or `readonly` on this component to make the label styles behave the same
 * way as they would on a `<vaadin-text-field>` which is disabled or readonly.
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `label` | The label element
 * `error-message` | The error message element
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `has-label`  | Set when the field has a label | :host
 * `has-helper` | Set when the element has helper text or slot | :host
 * `has-error-message` | Set when the element has an error message, regardless if the field is valid or not | :host
 * `invalid`    | Set when the field is invalid | :host
 * `focused`    | Set when the field contains focus | :host
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * @fires {Event} change - Fired when the user commits a value change for any of the internal inputs.
 * @fires {Event} internal-tab - Fired on Tab keydown triggered from the internal inputs, meaning focus will not leave the inputs.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ThemableMixin
 * @mixes CustomFieldMixin
 */
class CustomFieldElement extends ElementMixin(CustomFieldMixin(ThemableMixin(PolymerElement))) {
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
          /* Size and position this element on the same vertical position as the input-field element
           to make vertical align for the host element work as expected */
        }

        :host([hidden]) {
          display: none !important;
        }

        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .inputs-wrapper {
          flex: none;
        }
      </style>

      <div class="container">
        <label part="label" on-click="focus" id="[[__labelId]]">[[label]]</label>
        <div class="inputs-wrapper" on-change="__updateValue">
          <slot id="slot"></slot>
        </div>
        <div part="helper-text" id="[[__helperTextId]]">
          <slot name="helper" id="helperSlot">[[helperText]]</slot>
        </div>
        <div
          part="error-message"
          id="[[__errorId]]"
          aria-live="assertive"
          aria-hidden$="[[__getErrorMessageAriaHidden(invalid, errorMessage, __errorId)]]"
        >
          [[errorMessage]]
        </div>
      </div>
    `;
  }

  static get is() {
    return 'vaadin-custom-field';
  }
  static get version() {
    return '21.0.0-alpha13';
  }

  static get properties() {
    return {
      /**
       * String used for the label element.
       * @type {string}
       */
      label: {
        type: String,
        value: '',
        observer: '_labelChanged'
      },

      /**
       * The name of the control, which is submitted with the form data.
       */
      name: String,

      /**
       * Specifies that the user must fill in a value.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * The value of the field. When wrapping several inputs, it will contain `\t`
       * (Tab character) as a delimiter indicating parts intended to be used as the
       * corresponding inputs values. Use the [`i18n`](#/elements/vaadin-custom-field#property-i18n)
       * property to customize this behavior.
       */
      value: {
        type: String,
        observer: '__valueChanged',
        notify: true
      },

      /**
       * This property is set to true when the control value is invalid.
       * @type {boolean}
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false,
        observer: '__invalidChanged'
      },

      /**
       * Error to show when the input value is invalid.
       * @attr {string} error-message
       * @type {string}
       */
      errorMessage: {
        type: String,
        value: '',
        observer: '__errorMessageChanged'
      },

      /**
       * String used for the helper text.
       * @attr {string} helper-text
       * @type {string | null}
       */
      helperText: {
        type: String,
        value: '',
        observer: '__helperTextChanged'
      }
    };
  }

  static get observers() {
    return [
      '__getActiveErrorId(invalid, errorMessage, __errorId, helperText, __helperTextId, __hasSlottedHelper)',
      '__getActiveLabelId(label, __labelId)',
      '__toggleHasValue(value)'
    ];
  }

  /** @private */
  __invalidChanged(invalid) {
    this.__setOrToggleAttribute('aria-invalid', invalid, this);
  }

  /** @private */
  __errorMessageChanged(errorMessage) {
    this.__setOrToggleAttribute('has-error-message', !!errorMessage, this);
  }

  /** @private */
  __helperTextChanged(helperText) {
    this.__setOrToggleAttribute('has-helper', !!helperText, this);
  }

  /** @private */
  __toggleHasValue(value) {
    if (value !== null && value.trim() !== '') {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
  }

  /** @private */
  _labelChanged(label) {
    if (label !== '' && label != null) {
      this.setAttribute('has-label', '');
    } else {
      this.removeAttribute('has-label');
    }
  }

  /**
   * Returns true if `value` is valid.
   * `<iron-form>` uses this to check the validity or all its elements.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    return !(this.invalid = !this.checkValidity());
  }

  /**
   * Returns true if the current inputs values satisfy all constraints (if any)
   * @return {boolean}
   */
  checkValidity() {
    const invalidFields = this.inputs.filter((input) => !(input.validate || input.checkValidity).call(input));

    if (invalidFields.length || (this.required && !this.value.trim())) {
      // Either 1. one of the input fields is invalid or
      // 2. the custom field itself is required but doesn't have a value
      return false;
    }
    return true;
  }

  /** @private */
  __setOrToggleAttribute(name, value, node) {
    if (!name || !node) {
      return;
    }
    if (node.hasAttribute(name) === !value) {
      if (value) {
        node.setAttribute(name, typeof value === 'boolean' ? '' : value);
      } else {
        node.removeAttribute(name);
      }
    }
  }

  /** @private */
  __getActiveErrorId(invalid, errorMessage, errorId, helperText, helperTextId, hasSlottedHelper) {
    const ids = [];
    if (helperText || hasSlottedHelper) {
      ids.push(helperTextId);
    }
    if (errorMessage && invalid) {
      ids.push(errorId);
    }
    if (ids.length > 0) {
      this.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this.removeAttribute('aria-describedby');
    }
  }

  /** @private */
  __getActiveLabelId(label, labelId) {
    this.__setOrToggleAttribute('aria-labelledby', label ? labelId : undefined, this);
  }

  /** @private */
  __getErrorMessageAriaHidden(invalid, errorMessage, errorId) {
    return (!(errorMessage && invalid ? errorId : undefined)).toString();
  }
}

customElements.define(CustomFieldElement.is, CustomFieldElement);

export { CustomFieldElement };
