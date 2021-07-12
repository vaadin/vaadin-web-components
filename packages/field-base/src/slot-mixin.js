/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

const SlotMixinImplementation = (superclass) =>
  class SlotMixinClass extends superclass {
    /**
     * List of named slots to initialize.
     */
    get slots() {
      return {};
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();
      this._connectSlotMixin();
    }

    /** @private */
    _connectSlotMixin() {
      if (!this.__isConnectedSlotMixin) {
        Object.keys(this.slots).forEach((slotName) => {
          // Ignore labels of nested components, if any
          const hasContent = Array.from(this.children).some((child) => child.matches(`[slot=${slotName}]`));

          if (!hasContent) {
            const slotFactory = this.slots[slotName];
            const slotContent = slotFactory();
            if (slotContent instanceof Element) {
              slotContent.setAttribute('slot', slotName);
              this.appendChild(slotContent);
            }
          }
        });
        this.__isConnectedSlotMixin = true;
      }
    }

    /** @protected */
    _getDirectSlotChild(slotName) {
      return Array.from(this.children).find((el) => el.slot === slotName);
    }
  };

/**
 * A mixin to provide content for named slots defined by component.
 */
export const SlotMixin = dedupingMixin(SlotMixinImplementation);
