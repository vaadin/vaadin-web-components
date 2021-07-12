import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { InputAriaMixin } from '../src/input-aria-mixin.js';

customElements.define(
  'input-aria-mixin-element',
  class extends InputAriaMixin(PolymerElement) {
    static get template() {
      return html`<slot name="label"></slot><slot name="input"></slot>`;
    }
  }
);

describe('input-aria-mixin', () => {
  let element, input, label;

  beforeEach(() => {
    element = fixtureSync(`<input-aria-mixin-element></input-aria-mixin-element>`);
    input = element.querySelector('[slot=input]');
    label = element.querySelector('[slot=label]');
  });

  it('should set id attribute on the input', () => {
    const idRegex = /^input-aria-mixin-element-\d$/;
    expect(idRegex.test(input.getAttribute('id'))).to.be.true;
  });

  it('should set for attribute on the label', () => {
    expect(label.getAttribute('for')).to.equal(input.id);
  });

  it('should set aria-labelledby attribute on the input', () => {
    expect(input.getAttribute('aria-labelledby')).to.equal(label.id);
  });

  it('should only run click handler once on label click', () => {
    const spy = sinon.spy();
    element.addEventListener('click', spy);
    label.click();
    expect(spy.calledOnce).to.be.true;
  });
});
