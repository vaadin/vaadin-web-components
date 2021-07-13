import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { aTimeout, fixtureSync, listenOnce, nextFrame } from '@vaadin/testing-helpers';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { makeFixture } from './helpers.js';
import '../vaadin-text-field.js';

// Lumo theme defines a max-height transition for the "error-message"
// part on invalid state change. It makes testing hard because the
// transition events are unreliable. So we disable it for testing.
registerStyles(
  'vaadin-text-field',
  css`
    [part='error-message'] {
      transition: none;
    }
  `
);

class FieldWrapper extends PolymerElement {
  static get template() {
    return html`
      <vaadin-text-field id="textField" helper-text="[[helperText]]">
        <slot slot="helper" name="helper"></slot>
      </vaadin-text-field>
    `;
  }

  static get properties() {
    return {
      helperText: String
    };
  }
}

customElements.define('field-wrapper', FieldWrapper);

['default', 'slotted'].forEach((condition) => {
  describe(`text-field ${condition}`, () => {
    let textField, input;

    beforeEach(() => {
      textField = fixtureSync(makeFixture('<vaadin-text-field></vaadin-text-field>', condition));
      input = textField.inputElement;
    });

    describe(`properties ${condition}`, () => {
      describe(`native ${condition}`, () => {
        function assertAttrCanBeSet(prop, value) {
          textField[prop] = value;
          const attrValue = input.getAttribute(prop);

          if (value === true) {
            expect(attrValue).not.to.be.null;
          } else if (value === false) {
            expect(attrValue).to.be.null;
          } else if (value) {
            expect(attrValue).to.be.equal(String(value));
          }
        }

        function assertPropCanBeSet(prop, value) {
          for (let i = 0; i < 3; i++) {
            // Check different values (i.e. true false true for boolean or string1 string2 string3)
            const newValue = typeof value === 'boolean' ? i % 2 === 0 : value + i;
            textField[prop] = newValue;
            expect(input[prop]).to.be.equal(newValue);
          }
        }

        ['pattern', 'placeholder', 'value', 'title'].forEach((prop) => {
          it('should set string property ' + prop, () => {
            assertPropCanBeSet(prop, 'foo');
          });
        });

        ['autofocus', 'disabled'].forEach((prop) => {
          it('should set boolean property ' + prop, () => {
            assertPropCanBeSet(prop, true);
          });
        });

        ['maxlength', 'minlength'].forEach((prop) => {
          it('should set numeric attribute ' + prop, () => {
            assertAttrCanBeSet(prop, 2);
          });
        });

        ['autocomplete'].forEach((prop) => {
          it('should set boolean attribute ' + prop, () => {
            assertAttrCanBeSet(prop, 'on');
          });
        });

        ['autocapitalize'].forEach((prop) => {
          it('should set boolean attribute ' + prop, () => {
            assertAttrCanBeSet(prop, 'none');
          });
        });

        ['autocomplete', 'autocorrect', 'readonly', 'required'].forEach((prop) => {
          it('should set boolean attribute ' + prop, () => {
            assertAttrCanBeSet(prop, true);
            assertAttrCanBeSet(prop, false);
          });
        });
      });

      describe(`clear button ${condition}`, () => {
        it('default value of clearButtonVisible should be false', () => {
          expect(textField.clearButtonVisible).to.be.false;
        });

        it('clear button should not be visible when field has no value', () => {
          textField.clearButtonVisible = true;
          expect(getComputedStyle(textField.$.clearButton).getPropertyValue('display')).to.be.equal('none');
        });

        it('should clear the value when clear button is clicked', () => {
          textField.clearButtonVisible = true;
          textField.value = 'Foo';
          textField.$.clearButton.click();
          expect(textField.value).not.to.be.ok;
        });

        it('should clear the native input value when clear button is clicked', () => {
          textField.clearButtonVisible = true;
          textField.value = 'Foo';
          textField.$.clearButton.click();
          expect(textField.inputElement.value).to.equal('');
        });

        it('should dispatch input event when clear button is clicked', () => {
          const inputSpy = sinon.spy();
          textField.addEventListener('input', inputSpy);
          textField.clearButtonVisible = true;
          textField.value = 'Foo';
          textField.$.clearButton.click();
          expect(inputSpy.calledOnce).to.be.true;
        });

        it('should dispatch change event when clear button is clicked', () => {
          const changeSpy = sinon.spy();
          textField.addEventListener('change', changeSpy);
          textField.clearButtonVisible = true;
          textField.value = 'Foo';
          textField.$.clearButton.click();
          expect(changeSpy.calledOnce).to.be.true;
        });

        it('should prevent default on clear button click', () => {
          const event = new Event('click', { cancelable: true });
          textField.$.clearButton.dispatchEvent(event);
          expect(event.defaultPrevented).to.be.true;
        });

        it('should set _valueClearing flag not to dispatch change event on mousedown and remove it on click', () => {
          // Testing internal implementation as it impossible to test native change event.
          // For case when the field is focused, value is changed, clear button is pressed.
          // Should not fire two change events.
          const changeSpy = sinon.spy();
          textField.addEventListener('change', changeSpy);

          textField.$.clearButton.dispatchEvent(new CustomEvent('mousedown'));
          expect(textField._valueClearing).to.be.true;

          // Emulates native change coming from input.
          textField.inputElement.dispatchEvent(new Event('change', { bubbles: !condition }));

          textField.$.clearButton.dispatchEvent(new CustomEvent('click'));
          expect(textField._valueClearing).to.be.false;

          expect(changeSpy.calledOnce).to.be.true;
        });

        it("should not prevent dispatching the change event if clear button wasn't clicked", () => {
          const changeSpy = sinon.spy();
          textField.addEventListener('change', changeSpy);

          // Simulate leaving the clear button after mousedown
          textField.$.clearButton.dispatchEvent(new CustomEvent('mousedown'));
          textField.$.clearButton.dispatchEvent(new CustomEvent('mouseleave'));

          // Emulates native change coming from input.
          textField.inputElement.dispatchEvent(new Event('change', { bubbles: !condition }));
          expect(changeSpy.calledOnce).to.be.true;
        });

        it('should update input value when setting value after clicking clear button', () => {
          textField.clearButtonVisible = true;
          textField.value = 'Foo';
          textField.$.clearButton.click();
          textField.value = 'Bar';
          expect(textField.inputElement.value).to.equal('Bar');
        });

        ['disabled', 'readonly'].forEach((state) => {
          it(`clear button should not be visible when field is ${state}`, () => {
            textField.clearButtonVisible = true;
            textField.setAttribute(state, true);
            expect(getComputedStyle(textField.$.clearButton).getPropertyValue('display')).to.be.equal('none');
          });
        });
      });

      describe(`binding ${condition}`, () => {
        it('default value should be empty string', () => {
          expect(textField.value).to.be.equal('');
        });

        it('setting input value updates value', () => {
          input.value = 'foo';
          input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
          expect(textField.value).to.be.equal('foo');
        });

        it('setting input value updates has-value attribute', () => {
          textField.value = 'foo';
          expect(textField.hasAttribute('has-value')).to.be.true;
        });

        it('setting value to undefined should not update has-value attribute', () => {
          textField.value = undefined;
          expect(textField.hasAttribute('has-value')).to.be.false;
        });

        it('setting value to undefined should clear the native input value', () => {
          textField.value = 'foo';
          textField.value = undefined;
          expect(textField.inputElement.value).to.equal('');
        });

        it('setting empty value does not update has-value attribute', () => {
          textField.value = '';
          expect(textField.hasAttribute('has-value')).to.be.false;
        });

        // User could accidentally set a 0 or false value
        it('setting number value updates has-value attribute', () => {
          textField.value = 0;
          expect(textField.hasAttribute('has-value')).to.be.true;
        });

        it('setting boolean value updates has-value attribute', () => {
          textField.value = false;
          expect(textField.hasAttribute('has-value')).to.be.true;
        });

        it('setting label updates has-label attribute', () => {
          textField.label = 'foo';
          expect(textField.hasAttribute('has-label')).to.be.true;
        });

        it('setting label to empty string does not update has-label attribute', () => {
          textField.label = '';
          expect(textField.hasAttribute('has-label')).to.be.false;
        });

        it('setting label to null does not update has-label attribute', () => {
          textField.label = null;
          expect(textField.hasAttribute('has-label')).to.be.false;
        });

        it('setting helper updates has-helper attribute', () => {
          textField.helperText = 'foo';
          expect(textField.hasAttribute('has-helper')).to.be.true;
        });

        it('setting helper to empty string does not update has-helper attribute', () => {
          textField.helperText = '';
          expect(textField.hasAttribute('has-helper')).to.be.false;
        });

        it('setting helper to null does not update has-helper attribute', () => {
          textField.helperText = null;
          expect(textField.hasAttribute('has-helper')).to.be.false;
        });

        it('setting helper with slot updates has-helper attribute', async () => {
          const helper = document.createElement('div');
          helper.setAttribute('slot', 'helper');
          helper.textContent = 'foo';
          textField.appendChild(helper);
          await nextFrame();
          expect(textField.hasAttribute('has-helper')).to.be.true;
        });

        it('setting errorMessage updates has-error-message attribute', () => {
          textField.errorMessage = 'foo';
          expect(textField.hasAttribute('has-error-message')).to.be.true;
        });

        it('setting errorMessage to empty string does not update has-error-message attribute', () => {
          textField.errorMessage = '';
          expect(textField.hasAttribute('has-error-message')).to.be.false;
        });

        it('setting errorMessage to null does not update has-error-message attribute', () => {
          textField.errorMessage = null;
          expect(textField.hasAttribute('has-error-message')).to.be.false;
        });
      });

      describe(`label ${condition}`, () => {
        it('should not update focused property on click if disabled', () => {
          textField.disabled = true;
          const label = textField.root.querySelector('[part="label"]');
          label.click();
          expect(textField.getAttribute('focused')).to.be.null;
        });
      });

      describe(`helper ${condition}`, () => {
        it('should not update focused property on click if disabled', () => {
          textField.disabled = true;
          const helper = textField.root.querySelector('[part="helper-text"]');
          helper.click();
          expect(textField.getAttribute('focused')).to.be.null;
        });
      });

      describe(`autoselect ${condition}`, () => {
        it('default value of autoselect should be false', () => {
          expect(textField.autoselect).to.be.false;
        });

        it('should not select content on focus when autoselect is false', async () => {
          textField.value = '123';
          textField.inputElement.dispatchEvent(new CustomEvent('focus', { bubbles: false }));
          await aTimeout(1);
          expect(textField.inputElement.selectionEnd - textField.inputElement.selectionStart).to.equal(0);
        });

        it('should select content on focus when autoselect is true', async () => {
          textField.value = '123';
          textField.autoselect = true;
          textField.inputElement.dispatchEvent(new CustomEvent('focus', { bubbles: false }));
          await aTimeout(1);
          expect(textField.inputElement.selectionEnd - textField.inputElement.selectionStart).to.equal(3);
        });
      });

      describe(`removing validation constraints ${condition}`, () => {
        it('should update "invalid" state when "required" is removed', () => {
          textField.required = true;
          textField.validate();
          expect(textField.invalid).to.be.true;

          textField.required = false;
          expect(textField.invalid).to.be.false;
        });

        it.skip('should update "invalid" state when "minlength" is removed', () => {
          textField.minlength = 5;
          textField.value = 'foo';

          // There seems to be no way to make minlength/maxlength trigger invalid
          // state in a native input programmatically. It can only become invalid
          // if the user really types into the input. Using MockInteractions,
          // triggering `input` and/or `change` events didn't seem to help.
          // Since vaadin-text-field currently relies on inputElement.checkValidity()
          // for setting the `invalid` property (thus simulating native behaviour)
          // there is currently no way to test this.

          // Let's enable this test if we find a way to make this invalid first

          textField.validate();
          expect(textField.invalid).to.be.true; // Fails here

          textField.minlength = undefined;
          expect(textField.invalid).to.be.false;
        });

        it.skip('should update "invalid" state when "maxlength" is removed', () => {
          textField.maxlength = 3;
          textField.value = 'foobar';

          // There seems to be no way to make minlength/maxlength trigger invalid
          // state in a native input programmatically. It can only become invalid
          // if the user really types into the input. Using MockInteractions,
          // triggering `input` and/or `change` events didn't seem to help.
          // Since vaadin-text-field currently relies on inputElement.checkValidity()
          // for setting the `invalid` property (thus simulating native behaviour)
          // there is currently no way to test this.

          // Let's enable this test if we find a way to make this invalid first

          textField.validate();
          expect(textField.invalid).to.be.true; // Fails here

          textField.maxlength = undefined;
          expect(textField.invalid).to.be.false;
        });

        it('should update "invalid" state when "pattern" is removed', () => {
          textField.value = '123foo';
          textField.pattern = '\\d+';
          textField.validate();
          expect(textField.invalid).to.be.true;

          textField.pattern = '';
          expect(textField.invalid).to.be.false;
        });

        it('should update "invalid" state when a constraint is removed even while other constraints are still active', () => {
          textField.required = true;
          textField.pattern = '\\d*';
          textField.validate();
          expect(textField.invalid).to.be.true;

          textField.required = false;
          expect(textField.invalid).to.be.false;
        });
      });
    });

    describe('value property', () => {
      it('should not consider updating the value as user input if the value is not changed', () => {
        const event = new Event('input', {
          bubbles: true,
          cancelable: true
        });
        input.dispatchEvent(event);

        textField.value = 'foo';
        expect(input.value).to.equal('foo');
      });
    });

    describe(`events ${condition}`, () => {
      it('should not stop native input events', () => {
        const inputSpy = sinon.spy();
        textField.addEventListener('input', inputSpy);

        const inputEvent = new Event('input', { bubbles: true, composed: true });
        input.dispatchEvent(inputEvent);

        expect(inputSpy.calledOnce).to.be.true;
        expect(inputSpy.calledWith(inputEvent)).to.be.true;
      });

      it('should dispatch change event on native input change', (done) => {
        const changeEvent = new Event('change');

        listenOnce(textField, 'change', (e) => {
          expect(e.detail.sourceEvent).to.equal(changeEvent);
          done();
        });

        input.dispatchEvent(changeEvent);
      });
    });

    describe(`methods ${condition}`, () => {
      it('should not throw an error when using focus() to a newly created element', () => {
        // No expect needed as an error is thrown when focusing undefined element
        document.createElement('vaadin-text-field').focus();
      });

      it('should clear the value when clear() is called', () => {
        textField.value = 'Foo';
        textField.clear();
        expect(textField.value).not.to.be.ok;
      });

      it('should clear the value of native input when clear() is called', () => {
        textField.value = 'Foo';
        textField.clear();
        expect(textField.inputElement.value).to.equal('');
      });

      describe(`resize notification ${condition}`, () => {
        let spy;

        function flushTextField(textField) {
          textField.__observeOffsetHeightDebouncer.flush();
        }

        beforeEach(() => {
          spy = sinon.spy();
          textField.addEventListener('iron-resize', spy);
        });

        it('should not dispatch `iron-resize` event on init', () => {
          expect(spy.called).to.be.false;
        });

        it('should dispatch `iron-resize` event on invalid height change', () => {
          textField.errorMessage = 'Error';
          flushTextField(textField);
          textField.invalid = true;
          flushTextField(textField);
          expect(spy.called).to.be.true;
        });

        it('should be a composed event', () => {
          textField.errorMessage = 'Error';
          flushTextField(textField);
          textField.invalid = true;
          flushTextField(textField);
          const event = spy.lastCall.lastArg;
          expect(event.composed).to.be.true;
        });

        it('should dispatch `iron-resize` event on error message height change', () => {
          textField.errorMessage = 'Error';
          flushTextField(textField);
          textField.invalid = true;
          flushTextField(textField);
          spy.resetHistory();

          // Long message that spans on multiple lines
          textField.errorMessage = [...new Array(42)].map(() => 'bla').join(' ');
          flushTextField(textField);

          expect(spy.calledOnce).to.be.true;
        });

        it('should dispatch `iron-resize` event on label height change', () => {
          flushTextField(textField);
          textField.label = 'Label';
          flushTextField(textField);
          expect(spy.calledOnce).to.be.true;
        });
      });
    });
  });
});

describe('wrapped', () => {
  let wrapper, textField, inputField;

  beforeEach(() => {
    wrapper = fixtureSync(`
      <div>
        <vaadin-text-field></vaadin-text-field>
      </div>
    `);
    textField = wrapper.firstElementChild;
    inputField = textField.shadowRoot.querySelector('[part=input-field]');
  });

  it('should not grow the input field inside a flex container', () => {
    const fieldHeight = inputField.clientHeight;
    wrapper.style.display = 'flex';
    wrapper.style.height = '100px';
    expect(inputField.clientHeight).to.equal(fieldHeight);
  });
});

describe('slots', () => {
  let textField, errorSpy;

  beforeEach(() => {
    textField = fixtureSync('<vaadin-text-field></vaadin-text-field>');
    errorSpy = sinon.spy();
    window.onerror = errorSpy;
  });

  afterEach(() => {
    window.onerror = null;
  });

  it('should not break when adding unexpected content to input slot', async () => {
    const div = document.createElement('div');
    div.setAttribute('slot', 'input');
    textField.appendChild(div);
    await nextFrame();
    expect(errorSpy.called).to.be.false;
  });
});

describe('helper slot', () => {
  describe('default', () => {
    let textField;

    beforeEach(() => {
      textField = fixtureSync(`
        <vaadin-text-field>
          <div slot="helper">foo</div>
        </vaadin-text-field>
      `);
    });

    it('should have has-helper attribute when helper is provided', () => {
      expect(textField.hasAttribute('has-helper')).to.be.true;
    });

    it('should remove has-helper attribute when helper is removed', async () => {
      const helper = textField.querySelector('[slot="helper"]');
      textField.removeChild(helper);
      await nextFrame();
      expect(textField.hasAttribute('has-helper')).to.be.false;
    });
  });

  describe('wrapped', () => {
    let wrapper, textField;

    beforeEach(() => {
      wrapper = fixtureSync('<field-wrapper></field-wrapper>');
      textField = wrapper.$.textField;
    });

    it('should not set has-helper attribute with a slotted "slot" element', () => {
      expect(textField.hasAttribute('has-helper')).to.be.false;
    });

    it('should set has-helper attribute when wrapper sets a property', () => {
      wrapper.helperText = 'helper text';
      expect(textField.hasAttribute('has-helper')).to.be.true;
    });

    it('should set "has-helper=slotted" when setting content to slotted "slot"', async () => {
      const span = document.createElement('span');
      span.textContent = 'helper text';
      span.setAttribute('slot', 'helper');
      wrapper.appendChild(span);
      await nextFrame();
      expect(textField.hasAttribute('has-helper')).to.be.true;
      expect(textField.getAttribute('has-helper')).to.be.equal('slotted');
    });
  });

  describe('nested helper', () => {
    let field, helper;
    beforeEach(() => {
      field = fixtureSync(`
        <vaadin-text-field label="outer">
          <vaadin-text-field label="inner" slot="helper">
            <vaadin-text-field label="inner" slot="helper"></vaadin-text-field>
          </vaadin-text-field>
        </vaadin-text-field>
      `);
      helper = field.querySelector('[slot="helper"]');
      field.focus();
    });

    it('should get focus when clicked', () => {
      expect(field.hasAttribute('focused')).to.be.true;
    });

    it('helper should get focus when clicked', () => {
      helper.inputElement.focus();
      expect(field.hasAttribute('focused')).to.be.false;
      expect(helper.hasAttribute('focused')).to.be.true;
    });
  });

  describe('text helper', () => {
    let field, helper;
    beforeEach(() => {
      field = fixtureSync(`
      <vaadin-text-field label='text-field' helper-text='helper-text'>
      </vaadin-text-field>
    `);

      helper = field.root.querySelector('[part="helper-text"]');
    });
    it('should not get focus when helper text is only text', () => {
      helper.click();
      expect(field.hasAttribute('focused')).to.be.false;
    });
  });
});
