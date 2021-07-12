import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { LabelMixin } from '../src/label-mixin.js';

customElements.define(
  'label-mixin-element',
  class extends LabelMixin(PolymerElement) {
    static get template() {
      return html`<slot name="label"></slot>`;
    }
  }
);

describe('label-mixin', () => {
  let element, label;

  describe('default', () => {
    beforeEach(() => {
      element = fixtureSync(`<label-mixin-element></label-mixin-element>`);
      label = element.querySelector('[slot=label]');
    });

    it('should create a label element', () => {
      expect(label instanceof HTMLLabelElement).to.be.true;
    });

    it('should set slot on the label', () => {
      expect(label.getAttribute('slot')).to.equal('label');
    });

    it('should set id on the label element', () => {
      const idRegex = /^label-label-mixin-element-\d$/;
      expect(idRegex.test(label.getAttribute('id'))).to.be.true;
    });

    it('should update label content on attribute change', () => {
      element.setAttribute('label', 'Email');
      expect(label.textContent).to.equal('Email');
    });

    it('should update label content on property change', () => {
      element.label = 'Email';
      expect(label.textContent).to.equal('Email');
    });

    it('should not set has-label attribute with no label', () => {
      expect(element.hasAttribute('has-label')).to.be.false;
    });

    it('should set has-label attribute when attribute is set', () => {
      element.setAttribute('label', 'Email');
      expect(element.hasAttribute('has-label')).to.be.true;
    });

    it('should set has-label attribute when property is set', () => {
      element.label = 'Email';
      expect(element.hasAttribute('has-label')).to.be.true;
    });
  });

  describe('slotted', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <label-mixin-element>
          <label slot="label">Custom</label>
        </label-mixin-element>
      `);
      label = element.querySelector('label');
    });

    it('should return slotted label content as a label', () => {
      expect(element.label).to.equal('Custom');
    });

    it('should set id on the slotted label element', () => {
      const idRegex = /^label-label-mixin-element-\d$/;
      expect(idRegex.test(label.getAttribute('id'))).to.be.true;
    });

    it('should set has-label attribute with slotted label', () => {
      expect(element.hasAttribute('has-label')).to.be.true;
    });

    it('should update slotted label content on property change', () => {
      element.label = 'Email';
      expect(label.textContent).to.equal('Email');
    });
  });
});
