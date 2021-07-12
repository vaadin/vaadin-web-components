import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { HelperTextMixin } from '../src/helper-text-mixin.js';

customElements.define(
  'helper-text-mixin-element',
  class extends HelperTextMixin(PolymerElement) {
    static get template() {
      return html`<slot name="helper"></slot>`;
    }
  }
);

describe('helper-text-mixin', () => {
  let element, helper;

  describe('default', () => {
    beforeEach(() => {
      element = fixtureSync(`<helper-text-mixin-element></helper-text-mixin-element>`);
      helper = element.querySelector('[slot=helper]');
    });

    it('should create a helper element', () => {
      expect(helper instanceof HTMLDivElement).to.be.true;
    });

    it('should set slot on the helper', () => {
      expect(helper.getAttribute('slot')).to.equal('helper');
    });

    it('should set id on the helper element', () => {
      const idRegex = /^helper-helper-text-mixin-element-\d+$/;
      expect(idRegex.test(helper.getAttribute('id'))).to.be.true;
    });

    it('should update helper content on attribute change', () => {
      element.setAttribute('helper-text', '3 digits');
      expect(helper.textContent).to.equal('3 digits');
    });

    it('should update helper content on property change', () => {
      element.helperText = '3 digits';
      expect(helper.textContent).to.equal('3 digits');
    });

    it('should not set has-helper attribute with no helper', () => {
      expect(element.hasAttribute('has-helper')).to.be.false;
    });

    it('should set has-helper attribute when attribute is set', () => {
      element.setAttribute('helper-text', '3 digits');
      expect(element.hasAttribute('has-helper')).to.be.true;
    });

    it('should set has-helper attribute when property is set', () => {
      element.helperText = '3 digits';
      expect(element.hasAttribute('has-helper')).to.be.true;
    });
  });

  describe('attribute', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <helper-text-mixin-element
          helper-text="3 digits"
        ></helper-text-mixin-element>
      `);
      helper = element.querySelector('[slot=helper]');
    });

    it('should set helper text content from attribute', () => {
      expect(helper.textContent).to.equal('3 digits');
    });
  });

  describe('slotted', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <helper-text-mixin-element>
          <div slot="helper">Custom</div>
        </helper-text-mixin-element>
      `);
      helper = element.querySelector('[slot=helper]');
    });

    it('should return slotted helper content as a helperText', () => {
      expect(element.helperText).to.equal('Custom');
    });

    it('should set id on the slotted helper element', () => {
      const idRegex = /^helper-helper-text-mixin-element-\d+$/;
      expect(idRegex.test(helper.getAttribute('id'))).to.be.true;
    });

    it('should set has-helper attribute with slotted helper', () => {
      expect(element.hasAttribute('has-helper')).to.be.true;
    });

    it('should update slotted helper content on property change', () => {
      element.helperText = '3 digits';
      expect(helper.textContent).to.equal('3 digits');
    });
  });
});
