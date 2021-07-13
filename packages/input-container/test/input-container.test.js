import { expect } from '@esm-bundle/chai';
import { fixtureSync } from '@vaadin/testing-helpers';
import '../vaadin-input-container.js';

describe('vaadin-input-container', () => {
  let container;

  beforeEach(() => {
    container = fixtureSync(`
      <vaadin-input-container>
        <input slot="input">
      </vaadin-input-container>
    `);
  });

  it('should reflect readonly property to attribute', () => {
    container.readonly = true;
    expect(container.hasAttribute('readonly')).to.be.true;

    container.readonly = false;
    expect(container.hasAttribute('readonly')).to.be.false;
  });

  it('should reflect disabled property to attribute', () => {
    container.disabled = true;
    expect(container.hasAttribute('disabled')).to.be.true;

    container.disabled = false;
    expect(container.hasAttribute('disabled')).to.be.false;
  });

  it('should reflect invalid property to attribute', () => {
    container.invalid = true;
    expect(container.hasAttribute('invalid')).to.be.true;

    container.invalid = false;
    expect(container.hasAttribute('invalid')).to.be.false;
  });
});
