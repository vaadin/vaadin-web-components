/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { Virtualizer } from './virtualizer.js';

/**
 * `<vaadin-virtual-list>` is a Web Component for displaying a virtual/infinite list or items.
 *
 * ```html
 * <vaadin-virtual-list></vaadin-virtual-list>
 * ```
 *
 * ```js
 * const list = document.querySelector('vaadin-virtual-list');
 * list.items = items; // An array of data items
 * list.renderer = (root, list, {item, index}) => {
 *   root.textContent = `#${index}: ${item.name}`
 * }
 * ```
 *
 * See [Virtual List](https://vaadin.com/docs/latest/ds/components/virtual-list) documentation.
 *
 * @extends HTMLElement
 * @mixes ElementMixin
 * @mixes ThemableMixin
 */
class VirtualListElement extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          height: 200px;
          overflow: auto;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <div id="items">
        <slot></slot>
      </div>
    `;
  }

  static get is() {
    return 'vaadin-virtual-list';
  }

  static get version() {
    return '21.0.0-alpha2';
  }

  static get properties() {
    return {
      /**
       * An array containing items determining how many instances to render.
       * @type {Array<!VirtualListItem> | undefined}
       */
      items: { type: Array },

      /**
       * Custom function for rendering the content of every item.
       * Receives three arguments:
       *
       * - `root` The render target element representing one item at a time.
       * - `virtualList` The reference to the `<vaadin-virtual-list>` element.
       * - `model` The object with the properties related with the rendered
       *   item, contains:
       *   - `model.index` The index of the rendered item.
       *   - `model.item` The item.
       * @type {VirtualListRenderer | undefined}
       */
      renderer: Function
    };
  }

  static get observers() {
    return ['__itemsOrRendererChanged(items, renderer)'];
  }

  /** @protected */
  ready() {
    super.ready();

    this.__virtualizer = new Virtualizer({
      createElements: this.__createElements,
      updateElement: this.__updateElement.bind(this),
      elementsContainer: this,
      scrollTarget: this,
      scrollContainer: this.shadowRoot.querySelector('#items')
    });

    if (window.Vaadin && window.Vaadin.templateRendererCallback) {
      window.Vaadin.templateRendererCallback(this);
    }
  }

  /**
   * Scroll to a specific index in the virtual list.
   *
   * @param {number} index Index to scroll to
   */
  scrollToIndex(index) {
    this.__virtualizer.scrollToIndex(index);
  }

  /** @private */
  __createElements(count) {
    return [...Array(count)].map(() => document.createElement('div'));
  }

  /** @private */
  __updateElement(el, index) {
    if (this.renderer) {
      this.renderer(el, this, { item: this.items[index], index });
    }
  }

  /** @private */
  __itemsOrRendererChanged(items = [], renderer) {
    if (renderer) {
      if (items.length === this.__virtualizer.size) {
        this.__virtualizer.update();
      } else {
        this.__virtualizer.size = items.length;
      }
    }
  }
}

customElements.define(VirtualListElement.is, VirtualListElement);

export { VirtualListElement };
