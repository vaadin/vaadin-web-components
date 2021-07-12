import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { DelegateFocusMixin } from '../src/delegate-focus-mixin.js';
import { InputMixin } from '../src/input-mixin.js';

customElements.define(
  'delegate-focus-mixin-element',
  class extends DelegateFocusMixin(InputMixin(PolymerElement)) {
    static get template() {
      return html`<slot name="input"></slot>`;
    }

    get focusElement() {
      return this._inputNode;
    }
  }
);

describe('delegate-focus-mixin', () => {
  let element, input;

  beforeEach(() => {
    element = fixtureSync(`<delegate-focus-mixin-element></delegate-focus-mixin-element>`);
    input = element.querySelector('input');
  });

  it('should focus the input on focus call', () => {
    const spy = sinon.spy(input, 'focus');
    element.focus();
    expect(spy.calledOnce).to.be.true;
  });

  it('should set focused attribute on focus call', () => {
    element.focus();
    expect(element.hasAttribute('focused')).to.be.true;
  });

  it('should blur the input on blur call', () => {
    const spy = sinon.spy(input, 'blur');
    element.focus();
    element.blur();
    expect(spy.calledOnce).to.be.true;
  });

  it('should remove focused attribute on blur call', () => {
    element.focus();
    element.blur();
    expect(element.hasAttribute('focused')).to.be.false;
  });

  it('should not focus the input on focus when disabled', () => {
    const spy = sinon.spy(input, 'focus');
    element.disabled = true;
    element.focus();
    expect(spy.calledOnce).to.be.false;
  });

  it('should not set focused attribute when disabled', () => {
    element.disabled = true;
    element.focus();
    expect(element.hasAttribute('focused')).to.be.false;
  });

  it('should propagate disabled property to the input', () => {
    element.disabled = true;
    expect(input.disabled).to.be.true;

    element.disabled = false;
    expect(input.disabled).to.be.false;
  });

  it('should call blur when disabled is set to true', () => {
    const spy = sinon.spy(element, 'blur');
    element.disabled = true;
    expect(spy.calledOnce).to.be.true;
  });

  it('should click the input on click call', () => {
    const spy = sinon.spy(input, 'click');
    element.click();
    expect(spy.calledOnce).to.be.true;
  });

  it('should not click the input on click when disabled', () => {
    const spy = sinon.spy(input, 'click');
    element.disabled = true;
    element.click();
    expect(spy.calledOnce).to.be.false;
  });
});
