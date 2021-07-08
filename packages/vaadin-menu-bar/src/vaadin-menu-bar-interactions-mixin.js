/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */

/**
 * @polymerMixin
 */
export const InteractionsMixin = (superClass) =>
  class InteractionsMixin extends superClass {
    static get properties() {
      return {
        /**
         * If true, the submenu will open on hover (mouseover) instead of click.
         * @attr {boolean} open-on-hover
         */
        openOnHover: {
          type: Boolean
        }
      };
    }

    constructor() {
      super();
      this.__boundOnContextMenuKeydown = this.__onContextMenuKeydown.bind(this);
    }

    static get observers() {
      return ['_itemsChanged(items, items.splices)', '_themeChanged(theme)'];
    }

    /** @protected */
    ready() {
      super.ready();

      this.addEventListener('keydown', (e) => this._onKeydown(e));
      this.addEventListener('focusin', (e) => this._onFocusin(e));

      this._subMenu.addEventListener('item-selected', this.__onItemSelected.bind(this));
      this._subMenu.addEventListener('close-all-menus', this.__onEscapeClose.bind(this));

      const overlay = this._subMenu.$.overlay;
      overlay.addEventListener('keydown', this.__boundOnContextMenuKeydown);
      overlay.addEventListener('vaadin-overlay-open', this.__alignOverlayPosition.bind(this));

      const container = this._container;
      container.addEventListener('click', this.__onButtonClick.bind(this));
      container.addEventListener('mouseover', (e) => this._onMouseOver(e));

      if (this.openOnHover){
          container.addEventListener('mouseleave', () => this._requestClose());
      }
    }

    /** @private */
    get __isRTL() {
      return this.getAttribute('dir') === 'rtl';
    }

    /** @private */
    _themeChanged(theme) {
      if (theme) {
        this._buttons.forEach((button) => button.setAttribute('theme', theme));
        this._subMenu.setAttribute('theme', theme);
      } else {
        this._buttons.forEach((button) => button.removeAttribute('theme'));
        this._subMenu.removeAttribute('theme');
      }
    }

    /** @private */
    _focusButton(button) {
      button.focus();
      button.setAttribute('focus-ring', '');
      this._buttons.forEach((btn) => {
        btn.setAttribute('tabindex', btn === button ? '0' : '-1');
      });
    }

    /** @private */
    _getButtonFromEvent(e) {
      return Array.from(e.composedPath()).filter((el) => el.localName === 'vaadin-menu-bar-button')[0];
    }

    /**
     * @param {!FocusEvent} event
     * @protected
     */
    _onFocusin() {
      const target = this.shadowRoot.querySelector('[part$="button"][tabindex="0"]');
      if (target) {
        this._buttons.forEach((btn) => {
          btn.setAttribute('tabindex', btn === target ? '0' : '-1');
        });
      }
    }

    /**
     * @param {!KeyboardEvent} event
     * @protected
     */
    _onKeydown(event) {
      const button = this._getButtonFromEvent(event);
      if (button) {
        if (event.keyCode === 40) {
          // ArrowDown, prevent page scroll
          event.preventDefault();
          if (button === this._expandedButton) {
            // Menu opened previously, focus first item
            this._focusFirstItem();
          } else {
            this.__openSubMenu(button, event);
          }
        } else if (event.keyCode === 38) {
          // ArrowUp, prevent page scroll
          event.preventDefault();
          if (button === this._expandedButton) {
            // Menu opened previously, focus last item
            this._focusLastItem();
          } else {
            this.__openSubMenu(button, event, { focusLast: true });
          }
        } else if (event.keyCode === 27 && button === this._expandedButton) {
          this._close(true);
        } else {
          this._navigateByKey(event);
        }
      }
    }

    /** @private */
    _navigateByKey(event) {
      // IE names for arrows do not include the Arrow prefix
      const key = event.key.replace(/^Arrow/, '');
      const buttons = this._buttons;
      const currentBtn = this.shadowRoot.activeElement || this._expandedButton;
      const currentIdx = buttons.indexOf(currentBtn);
      let idx;
      let increment;
      const dirIncrement = this.__isRTL ? -1 : 1;

      switch (key) {
        case 'Left':
          increment = -dirIncrement;
          idx = currentIdx - dirIncrement;
          break;
        case 'Right':
          increment = dirIncrement;
          idx = currentIdx + dirIncrement;
          break;
        case 'Home':
          increment = 1;
          idx = 0;
          break;
        case 'End':
          increment = -1;
          idx = buttons.length - 1;
          break;
        default:
        // do nothing.
      }

      idx = this._getAvailableIndex(idx, increment, buttons);
      if (idx >= 0) {
        event.preventDefault();
        const btn = buttons[idx];
        const wasExpanded = currentBtn === this._expandedButton;
        if (wasExpanded) {
          this._close();
        }
        this._focusButton(btn);
        if (wasExpanded && btn.item && btn.item.children) {
          this.__openSubMenu(btn, event, { keepFocus: true });
        }
      }
    }

    /** @private */
    _getAvailableIndex(index, increment, buttons) {
      const totalItems = buttons.length;
      let idx = index;
      for (let i = 0; typeof idx === 'number' && i < totalItems; i++, idx += increment || 1) {
        if (idx < 0) {
          idx = totalItems - 1;
        } else if (idx >= totalItems) {
          idx = 0;
        }

        const btn = buttons[idx];
        if (!btn.disabled && !btn.hasAttribute('hidden')) {
          return idx;
        }
      }
      return -1;
    }

    /** @private */
    get _subMenu() {
      return this.shadowRoot.querySelector('vaadin-menu-bar-submenu');
    }

    /** @private */
    __alignOverlayPosition(e) {
      /* c8 ignore next */
      if (!this._expandedButton) {
        // When `openOnHover` is true, quickly moving cursor can close submenu,
        // so by the time when event listener gets executed button is null.
        // See https://github.com/vaadin/vaadin-menu-bar/issues/85
        return;
      }
      const overlay = e.target;
      const { width, height, left } = this._expandedButton.getBoundingClientRect();
      if (overlay.hasAttribute('bottom-aligned')) {
        overlay.style.bottom = parseInt(getComputedStyle(overlay).bottom) + height + 'px';
      }
      const endAligned = overlay.hasAttribute('end-aligned');
      if (endAligned) {
        if (this.__isRTL) {
          overlay.style.left = left + 'px';
        } else {
          overlay.style.right = parseInt(getComputedStyle(overlay).right) - width + 'px';
        }
      }
    }

    /** @private */
    _itemsChanged() {
      const subMenu = this._subMenu;
      if (subMenu && subMenu.opened) {
        subMenu.close();
      }
    }

    /**
     * @param {!MouseEvent} e
     * @protected
     */
    _onMouseOver(e) {
      if (this.openOnHover) {
        this.preventClose = true;
      }
      const button = this._getButtonFromEvent(e);
      if (button && button !== this._expandedButton) {
        const isOpened = this._subMenu.opened;
        if (button.item.children && (this.openOnHover || isOpened)) {
          this.__openSubMenu(button, e);
        } else if (isOpened) {
          this._close();
        }
      }
    }

    /** @private */
    __onContextMenuKeydown(e) {
      const item = Array.from(e.composedPath()).filter((el) => el._item)[0];
      if (item) {
        const list = item.parentNode;
        if (e.keyCode === 38 && item === list.items[0]) {
          this._close(true);
        }
        // ArrowLeft, or ArrowRight on non-parent submenu item
        if (e.keyCode === 37 || (e.keyCode === 39 && !item._item.children)) {
          // Prevent ArrowLeft from being handled in context-menu
          e.stopImmediatePropagation();
          this._navigateByKey(e);
          const button = this.shadowRoot.activeElement;
          if (button && button.item && button.item.children) {
            this.__openSubMenu(button, e, { keepFocus: true });
          }
        }
      }
    }

    /** @private */
    __fireItemSelected(value) {
      this.dispatchEvent(new CustomEvent('item-selected', { detail: { value } }));
    }

    /** @private */
    __onButtonClick(e) {
      e.stopPropagation();
      const button = this._getButtonFromEvent(e);
      if (button) {
        this.__openSubMenu(button, e);
      }
    }

    /** @private */
    _requestClose() {
      this.preventClose = false;
      // wait if something has to prevent the close event
      setTimeout(() => {
        if (!this.preventClose) {
          this._close(false);
        }
      }, 300);
    }

    /** @private */
    _addHoverListener(subMenu) {
      let menuOverlay = subMenu.$.overlay.$.overlay;

      menuOverlay.addEventListener('mouseleave', () => this._requestClose());
      // when hovering between sub menus the subMenu will close if we don't prevent it
      menuOverlay.addEventListener('mouseenter', () => this.preventClose = true);
    }

    /**
     * Recursive method, adding an event listener for opening a sub menu.
     * It adds also hover listeners to the sub menus, whenever they are opened.
     * Only used in 'openOnHover' mode.
     * @param subMenu - the menu to listen to open events
     * @private
     */
    _addSubMenuOpenListener(subMenu) {
      subMenu.addEventListener('sub-menu-opened', e => {
        let menu = e.detail.subMenuElement;
        this._addHoverListener(menu);
        this._addSubMenuOpenListener(menu);
      });
    }

    /** @private */
    __openSubMenu(button, event, options = {}) {
      const subMenu = this._subMenu;
      const item = button.item;

      if (this.openOnHover) {
        this._addHoverListener(subMenu);
        this._addSubMenuOpenListener(subMenu);
      }

      if (subMenu.opened) {
        this._close();
        if (subMenu.listenOn === button) {
          return;
        }
      }

      const items = item && item.children;
      if (!items || items.length === 0) {
        this.__fireItemSelected(item);
        return;
      }

      subMenu.items = items;
      subMenu.listenOn = button;
      this._expandedButton = button;

      const rect = button.getBoundingClientRect();

      requestAnimationFrame(() => {
        button.dispatchEvent(
          new CustomEvent('opensubmenu', {
            detail: {
              x: this.__isRTL ? rect.right : rect.left,
              y: rect.bottom,
              children: items
            }
          })
        );

        button.setAttribute('expanded', '');
        button.setAttribute('aria-expanded', 'true');
      });

      if (options.focusLast) {
        this.__onceOpened(() => this._focusLastItem());
      }

      if (options.keepFocus) {
        this.__onceOpened(() => {
          this._focusButton(this._expandedButton);
        });
      }

      // do not focus item when open not from keyboard
      if (event.type !== 'keydown') {
        this.__onceOpened(() => {
          subMenu.$.overlay.$.overlay.focus();
        });
      }
    }

    /** @private */
    _focusFirstItem() {
      const list = this._subMenu.$.overlay.firstElementChild;
      list.focus();
    }

    /** @private */
    _focusLastItem() {
      const list = this._subMenu.$.overlay.firstElementChild;
      const item = list.items[list.items.length - 1];
      item && item.focus();
    }

    /** @private */
    __onceOpened(cb) {
      this.style.pointerEvents = 'auto';
      const overlay = this._subMenu.$.overlay;
      const listener = () => {
        cb();
        overlay.removeEventListener('vaadin-overlay-open', listener);
      };
      overlay.addEventListener('vaadin-overlay-open', listener);
    }

    /** @private */
    __onItemSelected(e) {
      e.stopPropagation();
      this._close();
      this.__fireItemSelected(e.detail.value);
    }

    /** @private */
    __onEscapeClose() {
      this.__deactivateButton(true);
    }

    /** @private */
    __deactivateButton(restoreFocus) {
      const button = this._expandedButton;
      if (button && button.hasAttribute('expanded')) {
        button.removeAttribute('expanded');
        button.setAttribute('aria-expanded', 'false');
        if (restoreFocus) {
          this._focusButton(button);
        }
        this._expandedButton = null;
      }
    }

    /**
     * @param {boolean} restoreFocus
     * @protected
     */
    _close(restoreFocus) {
      this.style.pointerEvents = '';
      this.__deactivateButton(restoreFocus);
      this._subMenu.opened && this._subMenu.close();
    }
  };
