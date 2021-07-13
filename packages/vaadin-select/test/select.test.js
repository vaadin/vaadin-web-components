import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import {
  arrowDown,
  arrowUp,
  enterKeyDown,
  enterKeyUp,
  escKeyDown,
  fixtureSync,
  nextFrame,
  tab,
  keyboardEventFor,
  keyDownChar,
  spaceKeyDown
} from '@vaadin/testing-helpers';
import { html, render } from 'lit';
import '@vaadin/vaadin-list-box/vaadin-list-box.js';
import '@vaadin/vaadin-item/vaadin-item.js';
import '../vaadin-select.js';

describe('vaadin-select', () => {
  let select, input;

  describe('empty', () => {
    let select;

    beforeEach(() => {
      select = fixtureSync(`<vaadin-select></vaadin-select>`);
    });

    it('should not throw an exception if renderer is not set', () => {
      select.opened = true;
      select.value = 'foo';
      select.opened = false;
    });

    it('should not throw an exception if renderer does not create list-box', () => {
      select.renderer = (root) => {
        root.appendChild(document.createElement('div'));
      };
      select.opened = true;
      select.value = 'foo';
      select.opened = false;
    });

    it('should assign menu element if renderer was set after DOM is ready', () => {
      const renderer = (root) => {
        if (root.firstElementChild) {
          return;
        }
        const menu = document.createElement('vaadin-list-box');
        const item = document.createElement('vaadin-item');
        menu.appendChild(item);
        root.appendChild(menu);
      };
      select.renderer = renderer;
      expect(select._menuElement).to.not.be.undefined;
    });
  });

  describe('with items', () => {
    beforeEach(async () => {
      select = fixtureSync(`<vaadin-select></vaadin-select>`);
      select.renderer = (root) => {
        if (root.firstElementChild) {
          return;
        }
        render(
          html`
            <vaadin-list-box>
              <vaadin-item>Option 1</vaadin-item>
              <vaadin-item value="v2" label="o2">Option 2</vaadin-item>
              <vaadin-item value="">Option 3</vaadin-item>
              <vaadin-item></vaadin-item>
              <vaadin-item label="">Empty</vaadin-item>
              <vaadin-item value="v4" disabled>Disabled</vaadin-item>
            </vaadin-list-box>
          `,
          root
        );
      };
      input = select._inputElement;
      await nextFrame();
    });

    describe('selection', () => {
      let menu;

      beforeEach(async () => {
        select.opened = true;
        menu = select._menuElement;
        await nextFrame();
      });

      it('should select the first item with an empty value by default', () => {
        expect(menu.selected).to.be.equal(2);
      });

      it('should close the overlay when selecting a new item', () => {
        menu.selected = 1;
        expect(select._overlayElement.opened).to.be.false;
      });

      it('should update selection slot with a clone of the selected item', () => {
        menu.selected = 2;
        const itemElement = select._items[menu.selected];
        const valueElement = select._valueElement.firstChild;
        expect(valueElement).not.to.be.equal(itemElement);
        expect(valueElement.localName).to.be.equal(itemElement.localName);
        expect(valueElement.textContent).to.be.equal(itemElement.textContent);
      });

      it('should preserve the selected attribute when selecting the disabled item', () => {
        menu.selected = 5;
        const valueElement = select._valueElement.firstChild;
        expect(valueElement.selected).to.be.true;
        expect(valueElement.disabled).to.be.true;
      });

      it('should not update value if the selected item does not have a value', () => {
        menu.selected = 2;
        expect(select.value).to.be.empty;
      });

      it('should update value with the value of the selected item', () => {
        menu.selected = 1;
        expect(select.value).to.be.equal('v2');
      });

      it('should set empty value if an item without `value` is selected', () => {
        menu.selected = 1;
        menu.selected = 3;
        expect(select.value).to.be.empty;
      });

      it('should remove tabindex when cloning the selected element', () => {
        menu.selected = 2;
        const itemElement = select._items[menu.selected];
        const valueElement = select._valueElement.firstChild;
        expect(itemElement.tabIndex).to.be.equal(0);
        expect(valueElement.hasAttribute('tabindex')).to.be.false;
      });

      it('should remove role when cloning the selected element', () => {
        menu.selected = 2;
        const itemElement = select._items[menu.selected];
        const valueElement = select._valueElement.firstChild;
        expect(itemElement.tabIndex).to.be.equal(0);
        expect(valueElement.hasAttribute('role')).to.be.false;
      });

      it('should update selection slot textContent with the selected item `label` string', () => {
        menu.selected = 1;
        expect(select._valueElement.textContent.trim()).to.be.equal('o2');
      });

      it('should wrap the selected item `label` string in selected vaadin item', () => {
        menu.selected = 1;
        const item = select._valueElement.firstElementChild;
        expect(item.localName).to.equal('vaadin-item');
        expect(item.textContent).to.equal('o2');
        expect(item.selected).to.be.true;
        expect(item.getAttribute('tabindex')).to.be.null;
      });

      it('should update selection slot when value is provided', () => {
        select.value = 'v2';
        expect(select._valueElement.textContent.trim()).to.be.equal('o2');
      });

      it('should update overlay selected item when value is provided', () => {
        select.value = 'v2';
        expect(menu.selected).to.be.equal(1);
      });

      it('should not select any item when value is not found in items', () => {
        select.value = 'v2';
        select.value = 'foo';
        expect(menu.selected).to.be.undefined;
      });
    });

    describe('keyboard selection', () => {
      it('should select items when alphanumeric keys are pressed', () => {
        select.opened = false;
        expect(select._menuElement.selected).to.be.equal(2);
        keyDownChar(input, 'o');
        keyDownChar(input, 'p');
        keyDownChar(input, 't');
        expect(select._menuElement.selected).to.be.equal(0);
        keyDownChar(input, 'i');
        keyDownChar(input, 'o');
        keyDownChar(input, 'n');
        keyDownChar(input, '2');
        expect(select._menuElement.selected).to.be.equal(1);
      });
    });

    describe('opening the overlay', () => {
      it('should keep synchronized opened properties in overlay and select', () => {
        select.opened = true;
        expect(select.opened).to.be.true;
        expect(select._overlayElement.opened).to.be.true;

        select.opened = false;
        expect(select._overlayElement.opened).to.be.false;
        expect(select.opened).to.be.false;
      });

      it('should restore attribute focus-ring if it was initially set before opening', () => {
        select.setAttribute('focus-ring', '');
        select.opened = true;
        select.opened = false;
        expect(select.focusElement.hasAttribute('focus-ring')).to.be.true;
      });

      it('should open overlay on click event on input field', () => {
        expect(select._overlayElement.opened).to.be.false;
        input.focusElement.dispatchEvent(new CustomEvent('click', { bubbles: true, cancelable: true, composed: true }));
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should open overlay on click event on toggle button', () => {
        expect(select._overlayElement.opened).to.be.false;
        select._toggleElement.click();
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should open overlay on ArrowUp', () => {
        arrowUp(input);
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should open overlay on Down', () => {
        arrowDown(input);
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should open overlay on Space', () => {
        spaceKeyDown(input);
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should open overlay on Enter', () => {
        enterKeyDown(input);
        expect(select._overlayElement.opened).to.be.true;
      });

      it('should close overlay on Escape', () => {
        select.opened = true;
        escKeyDown(input);
        expect(select._overlayElement.opened).to.be.false;
      });

      it('should align the overlay on top left corner by default on input click', async () => {
        // NOTE: avoid setting bottom-aligned because of web-test-runner window size
        select.setAttribute('style', 'position: absolute; top: 10px');
        enterKeyDown(input);
        await nextFrame();
        const overlayRect = select._overlayElement.getBoundingClientRect();
        const inputRect = input.shadowRoot.querySelector('[part~="input-field"]').getBoundingClientRect();
        expect(overlayRect.top).to.be.equal(inputRect.top);
        expect(inputRect.left).to.be.equal(inputRect.left);
      });

      it('should align the overlay on top right corner in RTL on input click', async () => {
        select.setAttribute('dir', 'rtl');
        // NOTE: avoid setting bottom-aligned because of web-test-runner window size
        select.setAttribute('style', 'position: absolute; top: 10px');
        enterKeyDown(input);
        await nextFrame();
        const overlayRect = select._overlayElement.getBoundingClientRect();
        const inputRect = input.shadowRoot.querySelector('[part~="input-field"]').getBoundingClientRect();
        expect(overlayRect.top).to.be.equal(inputRect.top);
        expect(inputRect.right).to.be.equal(inputRect.right);
      });

      it('should store the text-field width in the custom CSS property on overlay opening', () => {
        input.style.width = '200px';
        select.opened = true;
        const prop = '--vaadin-select-text-field-width';
        const value = getComputedStyle(select._overlayElement).getPropertyValue(prop);
        expect(value).to.be.equal(input.getBoundingClientRect().width + 'px');
      });
    });

    describe('overlay opened', () => {
      let menu;

      beforeEach(async () => {
        menu = select._menuElement;
        await nextFrame();
        select.focus();
        enterKeyDown(input);
      });

      it('should close the select on selecting the same value', () => {
        enterKeyDown(input);
        expect(select._overlayElement.opened).to.be.true;
        select._items[0].dispatchEvent(new CustomEvent('click', { bubbles: true }));
        expect(select._overlayElement.opened).to.be.false;
      });

      it('should focus the input on selecting value and closing the overlay', () => {
        const focusedSpy = sinon.spy();
        select.focusElement.focus = focusedSpy;

        menu.selected = 1;
        expect(select.value).to.be.equal(select._items[menu.selected].value);
        expect(select._overlayElement.opened).to.be.false;
        expect(focusedSpy.called).to.be.true;
      });

      it('should remove focused state from the input on closing the overlay if phone', () => {
        select._phone = true;
        menu.selected = 1;
        expect(select.hasAttribute('focused')).to.be.false;
        expect(input.hasAttribute('focused')).to.be.false;
      });

      it('should not focus the input on closing the overlay if phone', () => {
        const focusedSpy = sinon.spy();
        select.focusElement.focus = focusedSpy;

        select._phone = true;
        menu.selected = 1;
        expect(focusedSpy.called).to.be.false;
      });

      it('should focus the input before moving the focus to next selectable element', () => {
        const focusedSpy = sinon.spy();
        select.focusElement.focus = focusedSpy;

        tab(menu);
        expect(focusedSpy.called).to.be.true;
      });

      it('should hide native input when a item is selected, and it has content', () => {
        menu.selected = 2;
        const slotExists = select._valueElement.slot === 'input';
        expect(slotExists).to.be.true;
      });

      it('should toggle native native input visibility when the content of the selected item is empty', () => {
        menu.selected = 2;
        menu.selected = 3;
        expect(select._valueElement.slot).to.equal('');
      });

      it('should show native input when label of the selected items is an empty string', () => {
        menu.selected = 4;
        expect(select._valueElement.slot).to.equal('');
      });

      it('should close the overlay when clicking on the overlay', () => {
        select.opened = false;
        select._overlayElement.click();
        expect(select.opened).to.be.false;
      });

      // iOS Safari has incorrect viewport height when navigation bar is
      // visible in landscape orientation. This is workarounded by exposing
      // --vaadin-overlay-viewport-bottom in <vaadin-overlay>.
      it('should support --vaadin-overlay-viewport-bottom CSS property', () => {
        const overlay = select._overlayElement;
        overlay.setAttribute('phone', '');
        overlay.style.setProperty('--vaadin-overlay-viewport-bottom', '50px');
        expect(getComputedStyle(overlay).getPropertyValue('bottom')).to.equal('50px');
      });
    });

    describe('has-value attribute on text-field', () => {
      it('should not be set by default', () => {
        expect(select._inputElement.getAttribute('has-value')).to.be.null;
      });

      it('should set when value is set to not empty', () => {
        select.value = 'v2';
        expect(select._inputElement.getAttribute('has-value')).to.equal('');
      });

      it('should remove when value is set to empty', () => {
        select.value = 'v2';
        select.value = '';
        expect(select._inputElement.getAttribute('has-value')).to.be.null;
      });
    });

    describe('disabled', () => {
      it('should disable the input and disable opening if select is disabled', () => {
        select.disabled = true;
        expect(input.disabled).to.be.true;

        enterKeyDown(input);
        expect(select._overlayElement.opened).to.be.false;

        input.dispatchEvent(new CustomEvent('click', { bubbles: true }));
        expect(select._overlayElement.opened).to.be.false;
      });
    });

    describe('readonly', () => {
      it('should disable opening if select is readonly', () => {
        select.readonly = true;
        enterKeyDown(input);
        expect(select._overlayElement.opened).to.be.false;

        input.dispatchEvent(new CustomEvent('click', { bubbles: true }));
        expect(select._overlayElement.opened).to.be.false;
      });
    });

    describe('focus', () => {
      it('should be focusable', () => {
        select.focus();
        expect(select.hasAttribute('focused')).to.be.true;
        expect(input.hasAttribute('focused')).to.be.true;
      });

      it('should not focus the input by default', () => {
        expect(select.focusElement.hasAttribute('focused')).not.to.be.ok;
      });

      it('should set tabindex attribute to -1 on the native input', () => {
        expect(select._nativeInput.getAttribute('tabindex')).to.be.equal('-1');
      });

      it('should focus the next focusable element when tabbing', () => {
        select.focus();

        // Tabbing does not natively move the focus, hence we only can check that the event is not prevented
        const ev = keyboardEventFor(9, [], 'Tab');
        input.dispatchEvent(ev);
        expect(ev.defaultPrevented).to.be.false;
      });

      it('should focus the previous element when shift tabbing', () => {
        select.focus();

        // Tabbing does not natively move the focus, hence we only can check that the event is not prevented
        const ev = keyboardEventFor(9, ['shift'], 'Tab');
        input.dispatchEvent(ev);
        expect(ev.defaultPrevented).to.be.false;
      });

      it('should set pointer-events to none on the native input to fix iOS Zooming', () => {
        select.value = 'nomatch';
        const nativeInput = select._inputElement.shadowRoot.querySelector('input');
        expect(getComputedStyle(nativeInput)['pointer-events']).to.equal('none');
      });
    });

    describe('focus when overlay opened', () => {
      it('should keep focused state after opening overlay when focused', () => {
        select.focus();
        select.opened = true;
        expect(select.hasAttribute('focused')).to.be.true;
        expect(input.hasAttribute('focused')).to.be.true;
      });

      it('should not set focused state after opening overlay if not focused', () => {
        select.opened = true;
        expect(select.hasAttribute('focused')).to.be.false;
        expect(input.hasAttribute('focused')).to.be.false;
      });
    });

    describe('validation', () => {
      it('should set invalid to true when is required but there is no value', () => {
        expect(select.invalid).to.be.false;
        select.setAttribute('required', '');

        enterKeyDown(input);
        escKeyDown(input);
        expect(select.invalid).to.be.true;
      });

      it('should not set invalid to true when is required, there is no value, but is disabled', () => {
        expect(select.invalid).to.be.false;
        select.setAttribute('required', '');
        select.setAttribute('disabled', '');

        select.validate();
        expect(select.invalid).to.be.false;
      });

      it('should validate when closing the overlay', () => {
        const spy = sinon.spy();
        select.validate = spy;
        select.opened = true;

        select.opened = false;
        expect(spy.called).to.be.true;
      });

      it('should validate when blurring', () => {
        const spy = sinon.spy();
        select.validate = spy;
        select.blur();

        expect(spy.called).to.be.true;
      });

      it('should validate when setting value', () => {
        const spy = sinon.spy();
        select.validate = spy;
        select.value = 'v2';
        expect(spy.callCount).to.be.equal(1);
        select.value = '';
        expect(spy.callCount).to.be.equal(2);
      });

      it('should show error message when validated.', () => {
        expect(select.invalid).to.be.false;
        select.errorMessage = 'Please choose one option';
        select.setAttribute('required', '');
        select.validate();

        expect(select.invalid).to.be.true;
        expect(input.invalid).to.be.true;
        expect(input.errorMessage).to.be.equal(select.errorMessage);
      });
    });

    describe('initial validation', () => {
      let spy;

      beforeEach(async () => {
        select.required = true;
        spy = sinon.spy();
        select.validate = spy;
        await nextFrame();
      });

      it('should not validate the initial empty value', () => {
        expect(spy.called).to.be.false;
      });
    });

    describe('`change` event', () => {
      let menu, changeSpy;

      beforeEach(async () => {
        menu = select._menuElement;
        await nextFrame();
        changeSpy = sinon.spy();
        select.addEventListener('change', changeSpy);
      });

      it('should not fire `change` event when programmatically opened and selected changed', () => {
        select.opened = true;
        menu.selected = 1;
        select.opened = false;
        expect(changeSpy.called).to.be.false;
      });

      it('should not fire `change` event when programmatically opened and value changed', () => {
        select.opened = true;
        select.value = 'Option 1';
        expect(changeSpy.called).to.be.false;
      });

      it('should not fire `change` event when committing a value programmatically', () => {
        menu.selected = 1;
        select.value = 'Option 1';
        expect(changeSpy.called).to.be.false;
      });

      it('should stop input `change` event from bubbling', () => {
        select._inputElement.dispatchEvent(new CustomEvent('change'));
        expect(changeSpy.called).to.be.false;
      });

      it('should fire `change` event when value changes when alphanumeric keys are pressed', () => {
        keyDownChar(input, 'o');
        keyDownChar(input, 'p');
        keyDownChar(input, 't');
        expect(changeSpy.callCount).to.equal(1);
      });

      it('should fire `change` event when value changes by user clicking the item', () => {
        select.opened = true;
        menu.firstElementChild.click();
        expect(changeSpy.callCount).to.equal(1);
      });

      it('should fire `change` event when value changes by user selecting item with keyboard', () => {
        select.opened = true;
        arrowUp(menu);

        const secondOption = menu.querySelector('[value="v2"]');
        enterKeyDown(secondOption);
        enterKeyUp(secondOption);
        expect(changeSpy.callCount).to.equal(1);
      });
    });
  });

  describe('with value', () => {
    let menu;

    beforeEach(async () => {
      select = fixtureSync(`<vaadin-select value="v2"></vaadin-select>`);
      select.renderer = (root) => {
        if (root.firstElementChild) {
          return;
        }
        render(
          html`
            <vaadin-list-box>
              <vaadin-item value="v1">t1</vaadin-item>
              <vaadin-item value="v2" label="o2">t2</vaadin-item>
            </vaadin-list-box>
          `,
          root
        );
      };
      menu = select._menuElement;
      await nextFrame();
    });

    it('should be possible to set value declaratively', () => {
      expect(menu.selected).to.be.equal(1);
      expect(select._valueElement.textContent.trim()).to.be.equal('o2');
    });
  });

  describe('with theme attribute', () => {
    beforeEach(() => {
      select = fixtureSync(`<vaadin-select theme="foo"></vaadin-select>`);
    });

    it('should propagate theme attribute to field', () => {
      expect(select._inputElement.getAttribute('theme')).to.equal('foo');
    });

    it('should propagate theme attribute to overlay', () => {
      expect(select._overlayElement.getAttribute('theme')).to.equal('foo');
    });
  });

  describe('inside flexbox', () => {
    let container;

    beforeEach(() => {
      container = fixtureSync(`
        <div style="display: flex; flex-direction: column; width: 500px;">
          <vaadin-select></vaadin-select>
        </div>
      `);
    });

    it('should stretch inside a column flex container', () => {
      const select = container.querySelector('vaadin-select');
      expect(window.getComputedStyle(container).width).to.eql('500px');
      expect(parseFloat(window.getComputedStyle(select).width)).to.eql(500);
    });
  });

  describe('with helper text', () => {
    beforeEach(() => {
      select = fixtureSync(`<vaadin-select></vaadin-select>`);
    });

    it('should display the helper text when slotted helper available', async () => {
      const div = document.createElement('div');
      div.textContent = 'foo';
      div.setAttribute('slot', 'helper');
      select.appendChild(div);
      await nextFrame();
      expect(select._inputElement.querySelector('[slot="helper"]').assignedNodes()[0].textContent).to.eql('foo');
    });

    it('should display the helper text when provided', () => {
      select.helperText = 'Foo';
      expect(select._inputElement.helperText).to.equal(select.helperText);
    });
  });

  describe('with slotted helper', () => {
    beforeEach(async () => {
      select = fixtureSync(`
        <vaadin-select>
          <button slot="helper">click</button>
        </vaadin-select>
      `);

      select.renderer = (root) => {
        if (root.firstElementChild) {
          return;
        }
        render(
          html`
            <vaadin-list-box>
              <vaadin-item value="v1">t1</vaadin-item>
              <vaadin-item value="v2" label="o2">t2</vaadin-item>
            </vaadin-list-box>
          `,
          root
        );
      };
      await nextFrame();
    });

    it('should not open select when clicked on button', () => {
      let helper = select.querySelector('[slot="helper"]');

      helper.click();

      expect(select.hasAttribute('opened')).to.be.false;
    });
  });
});
