import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { InputPropsMixin } from '../src/input-props-mixin.js';

customElements.define(
  'input-props-mixin-element',
  class extends InputPropsMixin(PolymerElement) {
    static get template() {
      return html`<slot name="input"></slot>`;
    }
  }
);

describe('input-props-mixin', () => {
  let element, input;

  describe('name', () => {
    beforeEach(() => {
      element = fixtureSync('<input-props-mixin-element name="foo"></input-props-mixin-element>');
      input = element.querySelector('[slot=input]');
    });

    it('should propagate name attribute to the input', () => {
      expect(input.name).to.equal('foo');
    });

    it('should propagate name property to the input', () => {
      element.name = 'bar';
      expect(input.name).to.equal('bar');
    });
  });

  describe('placeholder', () => {
    beforeEach(() => {
      element = fixtureSync('<input-props-mixin-element placeholder="foo"></input-props-mixin-element>');
      input = element.querySelector('[slot=input]');
    });

    it('should propagate placeholder attribute to the input', () => {
      expect(input.placeholder).to.equal('foo');
    });

    it('should propagate placeholder property to the input', () => {
      element.placeholder = 'bar';
      expect(input.placeholder).to.equal('bar');
    });
  });

  describe('readonly', () => {
    beforeEach(() => {
      element = fixtureSync('<input-props-mixin-element readonly></input-props-mixin-element>');
      input = element.querySelector('[slot=input]');
    });

    it('should propagate readonly attribute to the input', () => {
      expect(input.readOnly).to.be.true;
    });

    it('should propagate readonly property to the input', () => {
      element.readonly = false;
      expect(input.readOnly).to.be.false;
    });
  });

  describe('required', () => {
    beforeEach(() => {
      element = fixtureSync('<input-props-mixin-element required></input-props-mixin-element>');
      input = element.querySelector('[slot=input]');
    });

    it('should propagate required attribute to the input', () => {
      expect(input.required).to.be.true;
    });

    it('should propagate required property to the input', () => {
      element.required = false;
      expect(input.required).to.be.false;
    });
  });

  describe('invalid', () => {
    beforeEach(() => {
      element = fixtureSync('<input-props-mixin-element invalid></input-props-mixin-element>');
      input = element.querySelector('[slot=input]');
    });

    it('should set aria-invalid attribute on the input', () => {
      expect(input.getAttribute('aria-invalid')).to.equal('true');
    });

    it('should remove aria-invalid attribute when valid', () => {
      element.invalid = false;
      expect(input.hasAttribute('aria-invalid')).to.be.false;
    });
  });
});
