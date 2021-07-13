import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ClearButtonMixin } from '../src/clear-button-mixin.js';

customElements.define(
  'clear-button-mixin-element',
  class extends ClearButtonMixin(PolymerElement) {
    static get template() {
      return html`
        <slot name="input"></slot>
        <button id="clearButton">Clear</button>
      `;
    }
  }
);

describe('clear-button-mixin', () => {
  let element, input, button;

  beforeEach(() => {
    element = fixtureSync('<clear-button-mixin-element value="foo"></clear-button-mixin-element>');
    input = element.querySelector('[slot=input]');
    button = element.$.clearButton;
  });

  it('should clear the field value on clear method call', () => {
    element.clear();
    expect(element.value).to.equal('');
  });

  it('should clear the input value on clear method call', () => {
    element.clear();
    expect(input.value).to.equal('');
  });

  it('should clear the field value on clear button click', () => {
    button.click();
    expect(element.value).to.equal('');
  });

  it('should clear the input value on clear button click', () => {
    button.click();
    expect(input.value).to.equal('');
  });

  it('should focus the input on clear button click', () => {
    const spy = sinon.spy(input, 'focus');
    button.click();
    expect(spy.calledOnce).to.be.true;
  });

  it('should dispatch input event on clear button click', () => {
    const spy = sinon.spy();
    input.addEventListener('input', spy);
    button.click();
    expect(spy.calledOnce).to.be.true;
  });

  it('should dispatch change event on clear button click', () => {
    const spy = sinon.spy();
    input.addEventListener('change', spy);
    button.click();
    expect(spy.calledOnce).to.be.true;
  });

  it('should call preventDefault on the button click event', () => {
    const event = new CustomEvent('click', { cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).to.be.true;
  });
});
