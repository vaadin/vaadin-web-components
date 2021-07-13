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
 * `<vaadin-text-area>` is a Web Component for text area control in forms.
 *
 * ```html
 * <vaadin-text-area label="Add description">
 * </vaadin-text-area>
 * ```
 *
 * ### Prefixes and suffixes
 *
 * These are child elements of a `<vaadin-text-area>` that are displayed
 * inline with the input, before or after.
 * In order for an element to be considered as a prefix, it must have the slot
 * attribute set to `prefix` (and similarly for `suffix`).
 *
 * ```html
 * <vaadin-text-area label="Add description">
 *   <div slot="prefix">Details:</div>
 *   <div slot="suffix">The end!</div>
 * </vaadin-text-area>
 * ```
 *
 * ### Styling
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
 * `has-helper` | Set when the element has helper text | :host
 * `has-error-message` | Set when the element has an error message | :host
 * `invalid` | Set when the element is invalid | :host
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
 * @mixes ElementMixin
 * @mixes ThemableMixin
 */
class TextAreaElement extends ElementMixin(TextFieldMixin(ControlStateMixin(ThemableMixin(PolymerElement)))) {
  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles">
        .vaadin-text-area-container {
          flex: auto;
        }

        /* The label, helper text and the error message should neither grow nor shrink. */
        [part='label'],
        [part='helper-text'],
        [part='error-message'] {
          flex: none;
        }

        [part='input-field'] {
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }

        .textarea-wrapper {
          display: grid;
          flex-grow: 1;
          align-self: stretch;
        }

        .textarea-wrapper::after {
          content: attr(data-replicated-value) ' ';
          white-space: pre-wrap;
          visibility: hidden;
        }

        [part='value'],
        [part='input-field'] ::slotted(textarea) {
          resize: none;
          overflow: hidden;
        }

        [part='value'],
        [part='input-field'] ::slotted(textarea),
        .textarea-wrapper::after {
          grid-area: 1 / 1 / 2 / 2;
          box-sizing: border-box;
          padding: 0 0.25em;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }

        [part='value'],
        [part='input-field'] ::slotted(*) {
          align-self: flex-start;
        }

        @keyframes vaadin-text-area-appear {
          to {
            opacity: 1;
          }
        }

        :host {
          animation: 1ms vaadin-text-area-appear;
        }
      </style>

      <div class="vaadin-text-area-container">
        <label part="label" on-click="focus" id="[[_labelId]]">[[label]]</label>

        <div part="input-field" id="[[_inputId]]">
          <slot name="prefix"></slot>

          <div class="textarea-wrapper">
            <slot name="textarea">
              <textarea part="value"></textarea>
            </slot>
          </div>

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
    return 'vaadin-text-area';
  }

  static get version() {
    return '21.0.0-alpha13';
  }

  /** @protected */
  ready() {
    super.ready();
    this._updateHeight();
    this.addEventListener('animationend', this._onAnimationEnd);
    this.__safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  /** @private */
  _onAnimationEnd(e) {
    if (e.animationName.indexOf('vaadin-text-area-appear') === 0) {
      this._updateHeight();
    }
  }

  /**
   * @return {string}
   * @protected
   */
  get _slottedTagName() {
    return 'textarea';
  }

  /**
   * @param {unknown} newVal
   * @param {unknown} oldVal
   * @protected
   */
  _valueChanged(newVal, oldVal) {
    super._valueChanged(newVal, oldVal);

    this._updateHeight();
  }

  /** @private */
  _updateHeight() {
    /* https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/ */
    this._textAreaWrapper = this._textAreaWrapper || this.shadowRoot.querySelector('.textarea-wrapper');
    this._textAreaWrapper.dataset.replicatedValue = this.inputElement.value;
    // getComputedStyle is expensive, maybe we can use ResizeObserver in the future
    this._dispatchIronResizeEventIfNeeded('InputHeight', getComputedStyle(this._textAreaWrapper).height);
  }

  /**
   * Fired when the text-area height changes.
   *
   * @event iron-resize
   */
}

customElements.define(TextAreaElement.is, TextAreaElement);

export { TextAreaElement };
