/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ControlStateMixin } from '@vaadin/vaadin-control-state-mixin/vaadin-control-state-mixin.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { processTemplates } from '@vaadin/vaadin-element-mixin/templates.js';
import './vaadin-select-overlay.js';
import './vaadin-select-text-field.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `
  <style>
    @font-face {
      font-family: "vaadin-select-icons";
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAASEAAsAAAAABDgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIGKmNtYXAAAAFoAAAAVAAAAFQXVtKHZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAAHwAAAB8CohkJ2hlYWQAAAJAAAAANgAAADYOavgEaGhlYQAAAngAAAAkAAAAJAarA8ZobXR4AAACnAAAABQAAAAUCAABP2xvY2EAAAKwAAAADAAAAAwAKABSbWF4cAAAArwAAAAgAAAAIAAHABduYW1lAAAC3AAAAYYAAAGGmUoJ+3Bvc3QAAARkAAAAIAAAACAAAwAAAAMEAAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6QADwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkA//3//wAAAAAAIOkA//3//wAB/+MXBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQE/AUAC6QIVABQAAAEwFx4BFxYxMDc+ATc2MTAjKgEjIgE/ISJPIiEhIk8iIUNCoEJDAhUhIk8iISEiTyIhAAEAAAABAABvL5bdXw889QALBAAAAAAA1jHaeQAAAADWMdp5AAAAAALpAhUAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAAukAAQAAAAAAAAAAAAAAAAAAAAUEAAAAAAAAAAAAAAAAAAAABAABPwAAAAAACgAUAB4APgABAAAABQAVAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEABwAAAAEAAAAAAAIABwBgAAEAAAAAAAMABwA2AAEAAAAAAAQABwB1AAEAAAAAAAUACwAVAAEAAAAAAAYABwBLAAEAAAAAAAoAGgCKAAMAAQQJAAEADgAHAAMAAQQJAAIADgBnAAMAAQQJAAMADgA9AAMAAQQJAAQADgB8AAMAAQQJAAUAFgAgAAMAAQQJAAYADgBSAAMAAQQJAAoANACkaWNvbW9vbgBpAGMAbwBtAG8AbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwaWNvbW9vbgBpAGMAbwBtAG8AbwBuaWNvbW9vbgBpAGMAbwBtAG8AbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByaWNvbW9vbgBpAGMAbwBtAG8AbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
`;

document.head.appendChild($_documentContainer.content);

/**
 * `<vaadin-select>` is a Web Component for selecting values from a list of items.
 *
 * ### Rendering
 *
 * The content of the select can be populated by using the renderer callback function.
 *
 * The renderer function provides `root`, `select` arguments.
 * Generate DOM content, append it to the `root` element and control the state
 * of the host element by accessing `select`.
 *
 * ```html
 * <vaadin-select id="select"></vaadin-select>
 * ```
 * ```js
 * const select = document.querySelector('#select');
 * select.renderer = function(root, select) {
 *   const listBox = document.createElement('vaadin-list-box');
 *   // append 3 <vaadin-item> elements
 *   ['Jose', 'Manolo', 'Pedro'].forEach(function(name) {
 *     const item = document.createElement('vaadin-item');
 *     item.textContent = name;
 *     item.setAttribute('label', name)
 *     listBox.appendChild(item);
 *   });
 *
 *   // update the content
 *   root.appendChild(listBox);
 * };
 * ```
 *
 * Renderer is called on initialization of new select and on its opening.
 * DOM generated during the renderer call can be reused
 * in the next renderer call and will be provided with the `root` argument.
 * On first call it will be empty.
 *
 * * Hint: By setting the `label` property of inner vaadin-items you will
 * be able to change the visual representation of the selected value in the input part.
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `toggle-button` | The toggle button
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `opened` | Set when the select is open | :host
 * `invalid` | Set when the element is invalid | :host
 * `focused` | Set when the element is focused | :host
 * `focus-ring` | Set when the element is keyboard focused | :host
 * `readonly` | Set when the select is read only | :host
 *
 * `<vaadin-select>` element sets these custom CSS properties:
 *
 * Property name | Description | Theme for element
 * --- | --- | ---
 * `--vaadin-select-text-field-width` | Width of the select text field | `vaadin-select-overlay`
 *
 * See [Styling Components](https://vaadin.com/docs/latest/ds/customization/styling-components) documentation.
 *
 * ### Internal components
 *
 * In addition to `<vaadin-select>` itself, the following internal
 * components are themable:
 *
 * - `<vaadin-select-text-field>` - has the same API as [`<vaadin-text-field>`](#/elements/vaadin-text-field).
 * - `<vaadin-select-overlay>` - has the same API as [`<vaadin-overlay>`](#/elements/vaadin-overlay).
 *
 * Note: the `theme` attribute value set on `<vaadin-select>` is
 * propagated to the internal components listed above.
 *
 * @fires {Event} change - Fired when the user commits a value change.
 * @fires {CustomEvent} invalid-changed - Fired when the `invalid` property changes.
 * @fires {CustomEvent} opened-changed - Fired when the `opened` property changes.
 * @fires {CustomEvent} value-changed - Fired when the `value` property changes.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ControlStateMixin
 * @mixes ThemableMixin
 */
class SelectElement extends ElementMixin(
  ControlStateMixin(ThemableMixin(mixinBehaviors(IronResizableBehavior, PolymerElement)))
) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        vaadin-select-text-field {
          width: 100%;
          min-width: 0;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='toggle-button'] {
          font-family: 'vaadin-select-icons';
        }

        [part='toggle-button']::before {
          content: '\\e900';
        }
      </style>

      <vaadin-select-text-field
        placeholder="[[placeholder]]"
        label="[[label]]"
        required="[[required]]"
        invalid="[[invalid]]"
        error-message="[[errorMessage]]"
        readonly$="[[readonly]]"
        helper-text="[[helperText]]"
        theme$="[[theme]]"
      >
        <slot name="prefix" slot="prefix"></slot>
        <slot name="helper" on-click="_onClick" slot="helper">[[helperText]]</slot>
        <div part="value"></div>
        <div part="toggle-button" slot="suffix" role="button" aria-haspopup="listbox" aria-label="Toggle"></div>
      </vaadin-select-text-field>
      <vaadin-select-overlay
        opened="{{opened}}"
        with-backdrop="[[_phone]]"
        phone$="[[_phone]]"
        theme$="[[theme]]"
      ></vaadin-select-overlay>

      <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"></iron-media-query>
    `;
  }

  static get is() {
    return 'vaadin-select';
  }

  static get version() {
    return '21.0.0-alpha13';
  }

  static get properties() {
    return {
      /**
       * Set when the select is open
       * @type {boolean}
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '_openedChanged'
      },

      /**
       * Custom function for rendering the content of the `<vaadin-select>`.
       * Receives two arguments:
       *
       * - `root` The `<vaadin-select-overlay>` internal container
       *   DOM element. Append your content to it.
       * - `select` The reference to the `<vaadin-select>` element.
       * @type {!SelectRenderer | undefined}
       */
      renderer: Function,

      /**
       * The error message to display when the select value is invalid
       * @attr {string} error-message
       * @type {string}
       */
      errorMessage: {
        type: String,
        value: ''
      },

      /**
       * String used for the label element.
       */
      label: {
        type: String
      },

      /**
       * It stores the the `value` property of the selected item, providing the
       * value for iron-form.
       * When there’s an item selected, it's the value of that item, otherwise
       * it's an empty string.
       * On change or initialization, the component finds the item which matches the
       * value and displays it.
       * If no value is provided to the component, it selects the first item without
       * value or empty value.
       * Hint: If you do not want to select any item by default, you can either set all
       * the values of inner vaadin-items, or set the vaadin-select value to
       * an inexistent value in the items list.
       * @type {string}
       */
      value: {
        type: String,
        value: '',
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * The current required state of the select. True if required.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_requiredChanged'
      },

      /**
       * Set to true if the value is invalid.
       * @type {boolean}
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false
      },

      /**
       * The name of this element.
       */
      name: {
        type: String,
        reflectToAttribute: true
      },

      /**
       * A hint to the user of what can be entered in the control.
       * The placeholder will be displayed in the case that there
       * is no item selected, or the selected item has an empty
       * string label, or the selected item has no label and it's
       * DOM content is empty.
       */
      placeholder: {
        type: String
      },

      /**
       * String used for the helper text.
       * @attr {string} helper-text
       */
      helperText: {
        type: String,
        value: ''
      },

      /**
       * When present, it specifies that the element is read-only.
       * @type {boolean}
       */
      readonly: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /** @private */
      _phone: Boolean,

      /** @private */
      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      },

      /** @private */
      _overlayElement: Object,

      /** @private */
      _inputElement: Object,

      /** @private */
      _toggleElement: Object,

      /** @private */
      _items: Object
    };
  }

  static get observers() {
    return [
      '_updateSelectedItem(value, _items)',
      '_updateAriaExpanded(opened, _toggleElement, _inputElement)',
      '_rendererChanged(renderer, _overlayElement)'
    ];
  }

  constructor() {
    super();
    this._boundSetPosition = this._setPosition.bind(this);
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._boundSetPosition);
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._boundSetPosition);
    // Making sure the select is closed and removed from DOM after detaching the select.
    this.opened = false;
  }

  /** @protected */
  ready() {
    super.ready();

    this._overlayElement = this.shadowRoot.querySelector('vaadin-select-overlay');
    this._valueElement = this.shadowRoot.querySelector('[part="value"]');
    this._toggleElement = this.shadowRoot.querySelector('[part="toggle-button"]');
    this._nativeInput = this.focusElement.shadowRoot.querySelector('input');
    this._nativeInput.setAttribute('aria-hidden', true);
    this._nativeInput.setAttribute('tabindex', -1);
    this._nativeInput.style.pointerEvents = 'none';

    this.focusElement.addEventListener('click', (e) => (this.opened = !this.readonly && !e.defaultPrevented));
    this.focusElement.addEventListener('keydown', (e) => this._onKeyDown(e));

    processTemplates(this);
  }

  /**
   * Requests an update for the content of the select.
   * While performing the update, it invokes the renderer passed in the `renderer` property.
   *
   * It is not guaranteed that the update happens immediately (synchronously) after it is requested.
   */
  requestContentUpdate() {
    this._overlayElement.requestContentUpdate();

    if (this._menuElement && this._menuElement.items) {
      this._updateSelectedItem(this.value, this._menuElement.items);
    }
  }

  /**
   * Manually invoke existing renderer.
   *
   * @deprecated Since Vaadin 21, `render()` is deprecated. Please use `requestContentUpdate()` instead.
   */
  render() {
    console.warn('WARNING: Since Vaadin 21, render() is deprecated. Please use requestContentUpdate() instead.');

    this.requestContentUpdate();
  }

  /** @private */
  _rendererChanged(renderer, overlay) {
    if (!overlay) {
      return;
    }

    overlay.setProperties({ owner: this, renderer });

    this.requestContentUpdate();

    if (renderer) {
      this._assignMenuElement();
    }
  }

  /** @private */
  _assignMenuElement() {
    this._menuElement = Array.from(this._overlayElement.content.children).find(
      (element) => element.localName !== 'style'
    );

    if (this._menuElement) {
      this._menuElement.addEventListener('items-changed', () => {
        this._items = this._menuElement.items;
        this._items.forEach((item) => item.setAttribute('role', 'option'));
      });
      this._menuElement.addEventListener('selected-changed', () => this._updateValueSlot());
      this._menuElement.addEventListener('keydown', (e) => this._onKeyDownInside(e));
      this._menuElement.addEventListener(
        'click',
        () => {
          this.__userInteraction = true;
          this.opened = false;
        },
        true
      );

      this._menuElement.setAttribute('role', 'listbox');
    }
  }

  /**
   * @return {!HTMLElement}
   * @protected
   */
  get focusElement() {
    return this._inputElement || (this._inputElement = this.shadowRoot.querySelector('vaadin-select-text-field'));
  }

  /** @private */
  _requiredChanged(required) {
    this.setAttribute('aria-required', required);
  }

  /** @private */
  _valueChanged(value, oldValue) {
    if (value === '') {
      this.focusElement.removeAttribute('has-value');
    } else {
      this.focusElement.setAttribute('has-value', '');
    }

    // Skip validation for the initial empty string value
    if (value === '' && oldValue === undefined) {
      return;
    }
    this.validate();
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDown(e) {
    if (!this.readonly && !this.opened) {
      if (/^(Enter|SpaceBar|\s|ArrowDown|Down|ArrowUp|Up)$/.test(e.key)) {
        e.preventDefault();
        this.opened = true;
      } else if (/[a-zA-Z0-9]/.test(e.key) && e.key.length === 1) {
        const selected = this._menuElement.selected;
        const currentIdx = selected !== undefined ? selected : -1;
        const newIdx = this._menuElement._searchKey(currentIdx, e.key);
        if (newIdx >= 0) {
          this.__userInteraction = true;
          this._updateSelectedItem(this._items[newIdx].value, this._items);
        }
      }
    }
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDownInside(e) {
    if (/^(Tab)$/.test(e.key)) {
      this.opened = false;
    }
  }

  /** @private */
  _openedChanged(opened, wasOpened) {
    if (opened) {
      if (
        !this._overlayElement ||
        !this._menuElement ||
        !this._toggleElement ||
        !this.focusElement ||
        this.disabled ||
        this.readonly
      ) {
        this.opened = false;
        return;
      }

      this._openedWithFocusRing = this.hasAttribute('focus-ring') || this.focusElement.hasAttribute('focus-ring');
      this._menuElement.focus();
      this._setPosition();
      window.addEventListener('scroll', this._boundSetPosition, true);
    } else if (wasOpened) {
      if (this._phone) {
        this._setFocused(false);
      } else {
        this.focusElement.focus();
        if (this._openedWithFocusRing) {
          this.focusElement.setAttribute('focus-ring', '');
        }
      }
      this.validate();
      window.removeEventListener('scroll', this._boundSetPosition, true);
    }
  }

  /** @private */
  _hasContent(selected) {
    if (!selected) {
      return false;
    }
    return Boolean(
      selected.hasAttribute('label')
        ? selected.getAttribute('label')
        : selected.textContent.trim() || selected.children.length
    );
  }

  /** @private */
  _attachSelectedItem(selected) {
    if (!selected) {
      return;
    }
    let labelItem;
    if (selected.hasAttribute('label')) {
      labelItem = document.createElement('vaadin-item');
      labelItem.textContent = selected.getAttribute('label');
    } else {
      labelItem = selected.cloneNode(true);
    }

    // store reference to the original item
    labelItem._sourceItem = selected;

    labelItem.removeAttribute('tabindex');
    labelItem.removeAttribute('role');

    this._valueElement.appendChild(labelItem);

    labelItem.selected = true;
  }

  /** @private */
  _updateAriaExpanded(opened, toggleElement, inputElement) {
    toggleElement && toggleElement.setAttribute('aria-expanded', opened);
    if (inputElement && inputElement.focusElement) {
      inputElement.focusElement.setAttribute('aria-expanded', opened);
    }
  }

  /** @private */
  _updateValueSlot() {
    this.opened = false;
    this._valueElement.innerHTML = '';

    const selected = this._items[this._menuElement.selected];

    const hasContent = this._hasContent(selected);

    // Toggle visibility of _valueElement vs fallback input with placeholder
    this._valueElement.slot = hasContent ? 'input' : '';

    this._attachSelectedItem(selected);

    if (!this._valueChanging && selected) {
      this._selectedChanging = true;
      this.value = selected.value || '';
      if (this.__userInteraction) {
        this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        this.__userInteraction = false;
      }
      delete this._selectedChanging;
    }
  }

  /** @private */
  _updateSelectedItem(value, items) {
    if (items) {
      this._menuElement.selected = items.reduce((prev, item, idx) => {
        return prev === undefined && item.value === value ? idx : prev;
      }, undefined);
      if (!this._selectedChanging) {
        this._valueChanging = true;
        this._updateValueSlot();
        delete this._valueChanging;
      }
    }
  }

  /**
   * @param {boolean} focused
   * @protected
   */
  _setFocused(focused) {
    // Keep `focused` state when opening the overlay for styling purpose.
    super._setFocused(this.opened || focused);
    this.focusElement._setFocused(this.hasAttribute('focused'));
    !this.hasAttribute('focused') && this.validate();
  }

  /** @private */
  _setPosition() {
    const inputRect = this._inputElement.shadowRoot.querySelector('[part~="input-field"]').getBoundingClientRect();
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const bottomAlign = inputRect.top > (viewportHeight - inputRect.height) / 2;

    const isRtl = this.getAttribute('dir') === 'rtl';
    if (isRtl) {
      this._overlayElement.style.right = document.documentElement.clientWidth - inputRect.right + 'px';
    } else {
      this._overlayElement.style.left = inputRect.left + 'px';
    }

    if (bottomAlign) {
      this._overlayElement.setAttribute('bottom-aligned', '');
      this._overlayElement.style.removeProperty('top');
      this._overlayElement.style.bottom = viewportHeight - inputRect.bottom + 'px';
    } else {
      this._overlayElement.removeAttribute('bottom-aligned');
      this._overlayElement.style.removeProperty('bottom');
      this._overlayElement.style.top = inputRect.top + 'px';
    }

    this._overlayElement.updateStyles({ '--vaadin-select-text-field-width': inputRect.width + 'px' });
  }

  /** @private */
  _onClick(e) {
    e.preventDefault();
  }

  /**
   * Returns true if `value` is valid, and sets the `invalid` flag appropriately.
   *
   * @return {boolean} True if the value is valid and sets the `invalid` flag appropriately
   */
  validate() {
    return !(this.invalid = !(this.disabled || !this.required || this.value));
  }

  /**
   * Fired when the user commits a value change.
   *
   * @event change
   */
}

customElements.define(SelectElement.is, SelectElement);

export { SelectElement };
