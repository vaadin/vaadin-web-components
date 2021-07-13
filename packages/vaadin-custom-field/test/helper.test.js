import { expect } from '@esm-bundle/chai';
import { fixtureSync, nextFrame } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../vaadin-custom-field.js';

class XHelper extends PolymerElement {
  static get template() {
    return html`
      <vaadin-custom-field id="field" helper-text="[[helperText]]">
        <slot slot="helper" name="helper"></slot>
      </vaadin-custom-field>
    `;
  }

  static get properties() {
    return {
      helperText: String
    };
  }
}

customElements.define('x-helper', XHelper);

describe('helper text', () => {
  let customField;

  describe('default', () => {
    beforeEach(() => {
      customField = fixtureSync(`<vaadin-custom-field></vaadin-custom-field>`);
    });

    it('should set has-helper attribute when helper text is set', () => {
      customField.helperText = 'foo';
      expect(customField.hasAttribute('has-helper')).to.be.true;
    });

    it('should not set has-helper attribute when helper text is empty', () => {
      customField.helperText = '';
      expect(customField.hasAttribute('has-helper')).to.be.false;
    });

    it('should not set has-helper attribute when helper text is null', () => {
      customField.helperText = null;
      expect(customField.hasAttribute('has-helper')).to.be.false;
    });

    it('should set has-helper attribute when content is added', async () => {
      const helper = document.createElement('div');
      helper.setAttribute('slot', 'helper');
      helper.textContent = 'foo';
      customField.appendChild(helper);
      await nextFrame();
      expect(customField.hasAttribute('has-helper')).to.be.true;
    });
  });

  describe('with content', () => {
    beforeEach(() => {
      customField = fixtureSync(`
        <vaadin-custom-field>
          <div slot="helper">foo</div>
        </vaadin-custom-field>
      `);
    });

    it('should set has-helper attribute when helper has content', () => {
      expect(customField.hasAttribute('has-helper')).to.be.true;
    });

    it('should remove has-helper attribute when content is removed', async () => {
      const helper = customField.querySelector('[slot="helper"]');
      customField.removeChild(helper);
      await nextFrame();
      expect(customField.hasAttribute('has-helper')).to.be.false;
    });
  });

  describe('with slot', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = fixtureSync('<x-helper></x-helper>');
      customField = wrapper.$.field;
    });

    it('should not set has-helper attribute with slotted slot', () => {
      expect(customField.hasAttribute('has-helper')).to.be.false;
    });

    it('should not set has-helper attribute with slotted slot and property', () => {
      wrapper.helperText = 'helper text';
      expect(customField.hasAttribute('has-helper')).to.be.true;
    });

    it('should set "has-helper=slotted" ith slotted "slot" element which has content', async () => {
      const span = document.createElement('span');
      span.textContent = 'helper text';
      span.setAttribute('slot', 'helper');
      wrapper.appendChild(span);
      await nextFrame();
      expect(customField.hasAttribute('has-helper')).to.be.true;
      expect(customField.getAttribute('has-helper')).to.be.equal('slotted');
    });
  });

  describe('slotted component', () => {
    let field, helper;

    beforeEach(() => {
      field = fixtureSync(`
        <vaadin-custom-field>
            <input type="text" />

            <input type="text" slot="helper" />
        </vaadin-custom-field>
      `);
      helper = field.querySelector('[slot="helper"]');
      field.focus();
    });

    it('should get focus when clicked', () => {
      helper.focus();

      expect(document.activeElement).to.be.equal(helper);
    });
  });
});
