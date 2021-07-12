import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { DisabledMixin } from '../src/disabled-mixin.js';

customElements.define(
  'disabled-mixin-element',
  class extends DisabledMixin(PolymerElement) {
    static get template() {
      return html`<slot></slot>`;
    }
  }
);

describe('disabled-mixin', () => {
  let element;

  beforeEach(() => {
    element = fixtureSync(`<disabled-mixin-element></disabled-mixin-element>`);
  });

  it('should set disabled property to false by default', () => {
    expect(element.disabled).to.be.false;
  });

  it('should reflect disabled property to attribute', () => {
    element.disabled = true;
    expect(element.hasAttribute('disabled')).to.be.true;

    element.disabled = false;
    expect(element.hasAttribute('disabled')).to.be.false;
  });

  it('should set the aria-disabled attribute when disabled', () => {
    element.disabled = true;
    expect(element.getAttribute('aria-disabled')).to.equal('true');

    element.disabled = false;
    expect(element.hasAttribute('aria-disabled')).to.be.false;
  });
});
