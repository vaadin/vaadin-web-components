import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { InputMixin } from '../src/input-mixin.js';

customElements.define(
  'input-mixin-element',
  class extends InputMixin(PolymerElement) {
    static get template() {
      return html`<slot name="input"></slot>`;
    }
  }
);

customElements.define(
  'input-mixin-number-element',
  class extends InputMixin(PolymerElement) {
    static get template() {
      return html`<slot name="input"></slot>`;
    }

    ready() {
      super.ready();

      // Set readOnly property
      this._setType('number');
    }
  }
);

describe('input-mixin', () => {
  let element, input;

  describe('default', () => {
    beforeEach(() => {
      element = fixtureSync(`<input-mixin-element></input-mixin-element>`);
      input = element.querySelector('[slot=input]');
    });

    it('should create an input element', () => {
      expect(input instanceof HTMLInputElement).to.be.true;
    });

    it('should store a reference to the input', () => {
      expect(element._inputNode).to.equal(input);
    });

    it('should have a read-only type property', () => {
      expect(element.type).to.be.not.ok;
      element.type = 'number';
      expect(element.type).to.be.not.ok;
    });

    it('should have an empty name by default', () => {
      expect(input.name).to.be.not.ok;
    });

    it('should have an empty value by default', () => {
      expect(input.value).to.be.not.ok;
    });
  });

  describe('name', () => {
    beforeEach(() => {
      element = fixtureSync(`<input-mixin-element name="foo"></input-mixin-element>`);
      input = element.querySelector('[slot=input]');
    });

    it('should forward name attribute to the input', () => {
      expect(input.name).to.equal('foo');
    });
  });

  describe('value', () => {
    beforeEach(() => {
      element = fixtureSync(`<input-mixin-element value="foo"></input-mixin-element>`);
      input = element.querySelector('[slot=input]');
    });

    it('should forward value attribute to the input', () => {
      expect(input.value).to.equal('foo');
    });
  });

  describe('type', () => {
    beforeEach(() => {
      element = fixtureSync(`<input-mixin-number-element value="foo"></input-mixin-number-element>`);
      input = element.querySelector('[slot=input]');
    });

    it('should set input type based on the property', () => {
      expect(input.type).to.equal('number');
    });
  });
});
