import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { SlotMixin } from '../src/slot-mixin.js';

customElements.define(
  'slot-mixin-element',
  class extends SlotMixin(PolymerElement) {
    static get template() {
      return html`<slot name="foo"></slot>`;
    }

    get slots() {
      return {
        foo: () => {
          const div = document.createElement('div');
          div.textContent = 'foo';
          return div;
        }
      };
    }

    get fooChild() {
      return this._getDirectSlotChild('foo');
    }
  }
);

describe('slot-mixin', () => {
  let element, child;

  describe('default', () => {
    beforeEach(() => {
      element = fixtureSync('<slot-mixin-element></slot-mixin-element>');
      child = element.querySelector('[slot="foo"]');
    });

    it('should append an element to named slot', () => {
      expect(child).to.be.ok;
      expect(child.textContent).to.equal('foo');
    });

    it('should store a reference to the slot child', () => {
      expect(element.fooChild).to.equal(child);
    });
  });

  describe('custom', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <slot-mixin-element>
          <div slot="foo">bar</div>
        </slot-mixin-element>
      `);
      child = element.querySelector('[slot="foo"]');
    });

    it('should not override an element passed to named slot', () => {
      expect(child).to.be.ok;
      expect(child.textContent).to.equal('bar');
    });

    it('should store a reference a custom slot child', () => {
      expect(element.fooChild).to.equal(child);
    });
  });
});
