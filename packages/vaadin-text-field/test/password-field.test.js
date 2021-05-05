import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@vaadin/testing-helpers';
import { makeFixture } from './helpers.js';
import '../vaadin-password-field.js';

['default', 'slotted'].forEach((condition) => {
  describe(`password-field ${condition}`, () => {
    var passwordField, input, revealButton;

    beforeEach(() => {
      passwordField = fixtureSync(makeFixture('<vaadin-password-field></vaadin-password-field>', condition));
      input = passwordField.inputElement;
      revealButton = passwordField.shadowRoot.querySelector('[part=reveal-button]');
    });

    describe(`password visibility ${condition}`, () => {
      it('should have [type=password]', () => {
        expect(input.type).to.equal('password');
      });

      it('should reveal the password on click on eye-icons', () => {
        revealButton.click();
        expect(input.type).to.equal('text');

        revealButton.click();
        expect(input.type).to.equal('password');
      });

      it('should hide the password on blur', () => {
        passwordField.focus();
        revealButton.click();
        expect(input.type).to.equal('text');

        passwordField.dispatchEvent(new Event('focusout'));
        expect(input.type).to.equal('password');
      });

      describe(`change events ${condition}`, () => {
        let changeSpy, inputChangeSpy, hasFocus;

        function blurField() {
          input.blur();
          passwordField.dispatchEvent(new CustomEvent('blur'));
          passwordField.dispatchEvent(new CustomEvent('focusout'));
        }

        beforeEach(() => {
          changeSpy = sinon.spy();
          inputChangeSpy = sinon.spy();

          input._firedChangeValue = '';
          input.blur = () => {
            if (input._firedChangeValue !== input.value) {
              const changeEvent = new CustomEvent('change', {
                bubbles: true
              });
              input.dispatchEvent(changeEvent);
              input._firedChangeValue = input.value;
            }
            hasFocus = false;
          };
          input.focus = () => {
            hasFocus = true;
          };

          passwordField.addEventListener('change', changeSpy);
          input.addEventListener('change', inputChangeSpy);
        });

        it('should dispatch cached change after visibility change', () => {
          input.value = 'foo';
          revealButton.click();
          expect(changeSpy.called).to.be.false;
          expect(hasFocus).to.be.true;
          expect(inputChangeSpy.callCount).to.equal(1);
          blurField();
          expect(changeSpy.callCount).to.equal(1);
          expect(inputChangeSpy.callCount).to.equal(1);
        });

        it('should dispatch new change after visibility change', () => {
          input.value = 'foo';
          revealButton.click();
          input.value = 'foo-bar';
          blurField();
          expect(changeSpy.callCount).to.equal(1);
          expect(inputChangeSpy.callCount).to.equal(2);
        });
      });
    });

    describe(`eye-icons ${condition}`, () => {
      it('should hide eye-icon when revealButtonHidden is set to true', () => {
        expect(revealButton.hidden).to.be.false;

        passwordField.revealButtonHidden = true;
        expect(revealButton.hidden).to.be.true;
      });

      it('should prevent mousedown event on reveal-button when focused', () => {
        const e = new CustomEvent('mousedown', { bubbles: true, cancelable: true });
        passwordField.focus();
        revealButton.dispatchEvent(e);
        expect(e.defaultPrevented).to.be.true;
      });

      it('should not prevent mousedown event on reveal-button when not focused', () => {
        const e = new CustomEvent('mousedown', { bubbles: true, cancelable: true });
        revealButton.dispatchEvent(e);
        expect(e.defaultPrevented).to.be.false;
      });

      it('should prevent touchend event on reveal-button', () => {
        const e = new CustomEvent('touchend', { cancelable: true });

        revealButton.dispatchEvent(e);
        expect(e.defaultPrevented).to.be.true;
        expect(input.type).to.equal('text');

        revealButton.dispatchEvent(e);
        expect(e.defaultPrevented).to.be.true;
        expect(input.type).to.equal('password');
      });
    });
  });
});
