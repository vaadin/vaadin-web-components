import { expect } from '@esm-bundle/chai';
import { fixtureSync, focusin, focusout, keyDownOn } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { FocusMixin } from '../src/focus-mixin.js';

customElements.define(
  'focus-mixin-element',
  class extends FocusMixin(PolymerElement) {
    static get template() {
      return html`<slot></slot>`;
    }

    ready() {
      super.ready();
      const input = document.createElement('input');
      this.appendChild(input);
    }
  }
);

describe('focus-mixin', () => {
  let element, input;

  beforeEach(() => {
    element = fixtureSync(`<focus-mixin-element></focus-mixin-element>`);
    input = element.querySelector('input');
  });

  it('should set focused attribute on focusin event', () => {
    focusin(input);
    expect(element.hasAttribute('focused')).to.be.true;
  });

  it('should remove focused attribute on focusout event', () => {
    focusin(input);
    focusout(input);
    expect(element.hasAttribute('focused')).to.be.false;
  });

  it('should set the focus-ring attribute on focusin after keydown', () => {
    keyDownOn(document.body, 9);
    focusin(input);
    expect(element.hasAttribute('focus-ring')).to.be.true;

    focusout(input);
    expect(element.hasAttribute('focus-ring')).to.be.false;
  });

  it('should remove focused attribute when disconnected from the DOM', () => {
    focusin(input);
    element.parentNode.removeChild(element);
    expect(element.hasAttribute('focused')).to.be.false;
  });
});
