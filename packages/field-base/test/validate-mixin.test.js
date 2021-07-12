import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ValidateMixin } from '../src/validate-mixin.js';

customElements.define(
  'validate-mixin-element',
  class extends ValidateMixin(PolymerElement) {
    static get template() {
      return html`<slot name="error-message"></slot>`;
    }
  }
);

describe('validate-mixin', () => {
  let element, error;

  describe('default', () => {
    beforeEach(() => {
      element = fixtureSync(`<validate-mixin-element></validate-mixin-element>`);
      error = element.querySelector('[slot=error-message]');
      element.invalid = true;
    });

    it('should create an error message element', () => {
      expect(error instanceof HTMLDivElement).to.be.true;
    });

    it('should set aria-live attribute on the error message', () => {
      expect(error.getAttribute('aria-live')).to.equal('assertive');
    });

    it('should set id on the error message element', () => {
      const idRegex = /^error-validate-mixin-element-\d+$/;
      expect(idRegex.test(error.getAttribute('id'))).to.be.true;
    });

    it('should update error message content on attribute change', () => {
      element.setAttribute('error-message', 'This field is required');
      expect(error.textContent).to.equal('This field is required');
    });

    it('should update error message content on property change', () => {
      element.errorMessage = 'This field is required';
      expect(error.textContent).to.equal('This field is required');
    });

    it('should clear error message content when field is valid', () => {
      element.errorMessage = 'This field is required';
      element.invalid = false;
      expect(error.textContent).to.equal('');
    });

    it('should not set has-error-message attribute with no error', () => {
      expect(element.hasAttribute('has-error-message')).to.be.false;
    });

    it('should set has-error-message attribute when attribute is set', () => {
      element.setAttribute('error-message', 'This field is required');
      expect(element.hasAttribute('has-error-message')).to.be.true;
    });

    it('should set has-error-message attribute when property is set', () => {
      element.errorMessage = 'This field is required';
      expect(element.hasAttribute('has-error-message')).to.be.true;
    });

    it('should remove has-error-message attribute when field is valid', () => {
      element.errorMessage = 'This field is required';
      element.invalid = false;
      expect(element.hasAttribute('has-error-message')).to.be.false;
    });
  });

  describe('attribute', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <validate-mixin-element
          error-message="This field is required"
        ></validate-mixin-element>
      `);
      error = element.querySelector('[slot=error-message]');
      element.invalid = true;
    });

    it('should set error-message text content from attribute', () => {
      expect(error.textContent).to.equal('This field is required');
    });
  });

  describe('slotted', () => {
    beforeEach(() => {
      element = fixtureSync(`
        <validate-mixin-element>
          <div slot="error-message">Required field</div>
        </validate-mixin-element>
      `);
      error = element.querySelector('[slot=error-message]');
      element.invalid = true;
    });

    it('should return slotted message content as an errorMessage', () => {
      expect(element.errorMessage).to.equal('Required field');
    });

    it('should set id on the slotted error message element', () => {
      const idRegex = /^error-validate-mixin-element-\d+$/;
      expect(idRegex.test(error.getAttribute('id'))).to.be.true;
    });

    it('should set has-error-message attribute with slotted error message', () => {
      expect(element.hasAttribute('has-error-message')).to.be.true;
    });

    it('should update slotted error message content on property change', () => {
      element.errorMessage = 'This field is required';
      expect(error.textContent).to.equal('This field is required');
    });
  });

  describe('checkValidity', () => {
    beforeEach(() => {
      element = fixtureSync(`<validate-mixin-element></validate-mixin-element>`);
    });

    it('should return true when element is not required', () => {
      expect(element.checkValidity()).to.be.true;
    });

    it('should return false when element is required and value is not set', () => {
      element.required = true;
      expect(element.checkValidity()).to.be.false;
    });

    it('should return true when element is required and value is set', () => {
      element.required = true;
      element.value = 'value';
      expect(element.checkValidity()).to.be.true;
    });
  });

  describe('validate', () => {
    beforeEach(() => {
      element = fixtureSync(`<validate-mixin-element></validate-mixin-element>`);
    });

    it('should return true when element is not required', () => {
      expect(element.validate()).to.be.true;
    });

    it('should return false when element is required and value is not set', () => {
      element.required = true;
      expect(element.validate()).to.be.false;
    });

    it('should return true when element is required and value is set', () => {
      element.required = true;
      element.value = 'value';
      expect(element.validate()).to.be.true;
    });

    it('should not set invalid to true when element is not required', () => {
      element.validate();
      expect(element.invalid).to.be.false;
    });

    it('should set invalid when element is required and value is not set', () => {
      element.required = true;
      element.validate();
      expect(element.invalid).to.be.true;
    });

    it('should not set invalid to true when element is required and value is set', () => {
      element.required = true;
      element.value = 'value';
      element.validate();
      expect(element.invalid).to.be.false;
    });

    it('should set invalid back to false after value is set on the element', () => {
      element.required = true;
      element.validate();

      element.value = 'value';
      element.validate();
      expect(element.invalid).to.be.false;
    });
  });
});
