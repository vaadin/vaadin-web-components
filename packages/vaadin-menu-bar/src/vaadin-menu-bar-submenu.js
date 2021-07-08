/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { ContextMenuElement } from '@vaadin/vaadin-context-menu/src/vaadin-context-menu.js';

/**
 * An element used internally by `<vaadin-menu-bar>`. Not intended to be used separately.
 *
 * @extends ContextMenuElement
 * @protected
 */
class MenuBarSubmenuElement extends ContextMenuElement {
  static get is() {
    return 'vaadin-menu-bar-submenu';
  }

  constructor() {
    super();

    this.openOn = 'opensubmenu';
  }

  /**
   * Overriding the observer to not add global "contextmenu" listener.
   */
  _openedChanged(opened) {
    this.$.overlay.opened = opened;
  }

  /**
   * Overriding the public method to reset expanded button state.
   */
  close() {
    super.close();

    // only handle 1st level submenu
    if (this.hasAttribute('is-root')) {
      this.getRootNode().host._close();
    }
  }

  /**
   * Overriding the open method to fire an event when a sub menu is opened.
   * @private
   */
  __openSubMenu(subMenu, itemElement) {
    super.__openSubMenu(subMenu, itemElement);

    this.dispatchEvent(
        new CustomEvent('sub-menu-opened', {
          detail: {
            subMenuElement: subMenu
          }
        })
    );
  }
}

customElements.define(MenuBarSubmenuElement.is, MenuBarSubmenuElement);
