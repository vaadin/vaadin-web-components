/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { TextFieldMixin } from './vaadin-text-field-mixin.js';
import { ControlStateMixin } from '@vaadin/vaadin-control-state-mixin/vaadin-control-state-mixin.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';

/**
 * `<vaadin-text-field>` is a Web Component for text field control in forms.
 *
 * ```html
 * <vaadin-text-field label="First Name">
 * </vaadin-text-field>
 * ```
 *
 * ### Prefixes and suffixes
 *
 * These are child elements of a `<vaadin-text-field>` that are displayed
 * inline with the input, before or after.
 * In order for an element to be considered as a prefix, it must have the slot
 * attribute set to `prefix` (and similarly for `suffix`).
 *
 * ```html
 * <vaadin-text-field label="Email address">
 *   <div slot="prefix">Sent to:</div>
 *   <div slot="suffix">@vaadin.com</div>
 * </vaadin-text-area>
 * ```
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|-------------
 * `--vaadin-text-field-default-width` | Set the default width of the input field | `12em`
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `label` | The label element
 * `input-field` | The element that wraps prefix, value and suffix
 * `value` | The text value element inside the `input-field` element
 * `error-message` | The error message element
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `disabled` | Set to a disabled text field | :host
 * `has-value` | Set when the element has a value | :host
 * `has-label` | Set when the element has a label | :host
 * `has-helper` | Set when the element has helper text or slot | :host
 * `has-error-message` | Set when the element has an error message | :host
 * `invalid` | Set when the element is invalid | :host
 * `input-prevented` | Temporarily set when invalid input is prevented | :host
 * `focused` | Set when the element is focused | :host
 * `focus-ring` | Set when the element is keyboard focused | :host
 * `readonly` | Set to a readonly text field | :host
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * @fires {Event} input - Fired when the value is changed by the user: on every typing keystroke, and the value is cleared using the clear button.
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes TextFieldMixin
 * @mixes ControlStateMixin
 * @mixes ThemableMixin
 * @mixes ElementMixin
 */
class TextFieldElement extends ElementMixin(TextFieldMixin(ControlStateMixin(ThemableMixin(PolymerElement)))) {
  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div class="vaadin-text-field-container">
        <label part="label" on-click="focus" id="[[_labelId]]">[[label]]</label>

        <div part="input-field" id="[[_inputId]]">
          <slot name="prefix"></slot>

          <slot name="input">
            <input part="value" />
          </slot>

          <div part="clear-button" id="clearButton" role="button" aria-label$="[[i18n.clear]]"></div>
          <slot name="suffix"></slot>
        </div>

        <div part="helper-text" id="[[_helperTextId]]">
          <slot name="helper">[[helperText]]</slot>
        </div>

        <div
          part="error-message"
          id="[[_errorId]]"
          aria-live="assertive"
          aria-hidden$="[[_getErrorMessageAriaHidden(invalid, errorMessage, _errorId)]]"
          >[[errorMessage]]</div
        >
      </div>
    `;
  }

  static get is() {
    return 'vaadin-text-field';
  }

  static get version() {
    return '21.0.0-alpha13';
  }

  static get properties() {
    return {
      /**
       * A regular expression that the value is checked against.
       * The pattern must match the entire value, not just some subset.
       */
      pattern: {
        type: String
      },

      /**
       * The text usually displayed in a tooltip popup when the mouse is over the field.
       * @type {string}
       */
      title: {
        type: String
      }
    };
  }
}

customElements.define(TextFieldElement.is, TextFieldElement);

export { TextFieldElement };
