/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';

export class InputContainer extends ThemableMixin(PolymerElement) {
  static get is() {
    return 'vaadin-input-container';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: flex;
          align-items: center;
          flex: auto;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Reset the native input styles */
        ::slotted([slot='input']) {
          -webkit-appearance: none;
          -moz-appearance: none;
          outline: none;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          min-width: 0;
          font: inherit;
          font-size: 1em;
          line-height: normal;
          color: inherit;
          background-color: transparent;
          /* Disable default invalid style in Firefox */
          box-shadow: none;
        }

        ::slotted(*) {
          flex: none;
        }

        ::slotted([slot='input']) {
          flex: auto;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
      </style>
      <slot name="prefix"></slot>
      <slot name="input"></slot>
      <slot name="suffix"></slot>
    `;
  }

  static get properties() {
    return {
      /**
       * If true, the user cannot interact with this element.
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * Set to true to make this element read-only.
       */
      readonly: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * Set to true when the element is invalid.
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true
      }
    };
  }
}

customElements.define(InputContainer.is, InputContainer);
