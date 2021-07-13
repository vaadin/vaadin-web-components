import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync, focusin, focusout } from '@vaadin/testing-helpers';
import '@polymer/polymer/lib/elements/dom-bind.js';
import '../vaadin-checkbox-group.js';

describe('vaadin-checkbox-group', () => {
  let group, checkboxes;

  beforeEach(() => {
    group = fixtureSync(`
      <vaadin-checkbox-group>
        <vaadin-checkbox value="1">Checkbox <b>1</b></vaadin-checkbox>
        <vaadin-checkbox value="2">Checkbox <b>2</b></vaadin-checkbox>
        <vaadin-checkbox value="3">Checkbox <b>3</b></vaadin-checkbox>
      </vaadin-checkbox-group>
    `);
    checkboxes = group.querySelectorAll('vaadin-checkbox');
    group._observer.flush();
  });

  it('does not set a role', () => {
    expect(group.getAttribute('role')).to.eq(null);
  });

  it('changes aria-disabled on disabled change', () => {
    group.disabled = true;
    expect(group.getAttribute('aria-disabled')).to.eq('true');
  });

  it('can be disabled imperatively', () => {
    group.disabled = true;
    expect(group.hasAttribute('disabled')).to.be.true;
    expect(checkboxes[0].hasAttribute('disabled')).to.be.true;
  });

  it('should set disabled property to dynamically added checkboxes', () => {
    group.disabled = true;
    const checkbox = document.createElement('vaadin-checkbox');
    checkbox.value = '4';
    group.appendChild(checkbox);
    group._observer.flush();
    expect(checkbox.disabled).to.be.true;
  });

  it('should add dynamically added checked checkbox value to checkbox group value', () => {
    const checkbox = document.createElement('vaadin-checkbox');
    checkbox.value = 'new';
    checkbox.checked = true;
    group.appendChild(checkbox);
    group._observer.flush();
    expect(group.value).to.include('new');
  });

  it('should not add duplicate values when added checked checkbox already included in value', () => {
    const checkbox = document.createElement('vaadin-checkbox');
    checkbox.value = 'new';
    checkbox.checked = true;
    group.value = ['new'];
    group.appendChild(checkbox);
    group._observer.flush();
    expect(group.value).to.eql(['new']);
  });

  it('should check dynamically added checkbox if included in value', () => {
    const checkbox = document.createElement('vaadin-checkbox');
    checkbox.value = 'new';
    group.value = ['new'];
    group.appendChild(checkbox);
    group._observer.flush();
    expect(group.value).to.eql(['new']);
    expect(checkbox.checked).to.be.true;
  });

  it('should remove checked checkbox value from checkbox group value, when checkbox is dynamically removed', () => {
    const checkbox = checkboxes[0];
    checkbox.checked = true;
    group.removeChild(checkbox);
    group._observer.flush();
    expect(group.value).to.not.include('1');
  });

  it('should create new array instance for checkbox group value when checkbox dynamically added', () => {
    const value = group.value;
    const checkbox = document.createElement('vaadin-checkbox');
    checkbox.value = 'new';
    checkbox.checked = true;
    group.appendChild(checkbox);
    group._observer.flush();
    expect(group.value).to.not.equal(value);
  });

  it('should create new array instance for checkbox group value when checkbox dynamically removed', () => {
    const value = group.value;
    const checkbox = checkboxes[0];
    checkbox.checked = true;
    group.removeChild(checkbox);
    group._observer.flush();
    expect(group.value).to.not.equal(value);
  });

  it('should not change checkbox group value if a removed checkbox is checked', () => {
    const checkbox = checkboxes[0];
    group.removeChild(checkbox);
    group._observer.flush();
    checkbox.checked = true;
    expect(group.value).to.not.include('1');
  });

  it('should set proper value to checkbox-group when a checkbox is checked', () => {
    checkboxes[0].checked = true;
    expect(group.value).to.deep.equal(['1']);
    checkboxes[1].checked = true;
    expect(group.value).to.deep.equal(['1', '2']);
  });

  it('should set proper value to checkbox-group when a checkbox is unchecked', () => {
    checkboxes[0].checked = true;
    checkboxes[1].checked = true;
    expect(group.value).to.deep.equal(['1', '2']);
    checkboxes[1].checked = false;
    expect(group.value).to.deep.equal(['1']);
  });

  it('should check proper checkbox when value is set', () => {
    group.value = ['2'];
    expect(checkboxes[1].checked).to.be.true;
    group.value = ['1', '3'];
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[2].checked).to.be.true;
  });

  it('should uncheck proper checkbox when value is removed', () => {
    group.value = ['1', '3'];
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[2].checked).to.be.true;
    group.value = ['1'];
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[2].checked).to.be.false;
  });

  it('should set focused attribute on focusin event dispatched', () => {
    focusin(checkboxes[0]);
    expect(group.hasAttribute('focused')).to.be.true;
  });

  it('should not set focused attribute on focusin event dispatched when disabled', () => {
    group.disabled = true;
    focusin(checkboxes[0]);
    expect(group.hasAttribute('focused')).to.be.false;
  });

  it('should remove focused attribute on checkbox focusout', () => {
    focusin(checkboxes[0]);
    focusout(checkboxes[0]);
    expect(group.hasAttribute('focused')).to.be.false;
  });

  it('should remove focused attribute on checkbox-group focusout', () => {
    focusin(checkboxes[0]);
    focusout(group);
    expect(group.hasAttribute('focused')).to.be.false;
  });

  it('should NOT steal focus from currently focused element', () => {
    const focusInput = document.createElement('input');
    document.body.appendChild(focusInput);
    focusInput.focus();
    group.value = '2';
    expect(document.activeElement).to.be.equal(focusInput);
    document.body.removeChild(focusInput);
  });

  it('should update has-label attribute when setting label', () => {
    expect(group.hasAttribute('has-label')).to.be.false;
    group.label = 'foo';
    expect(group.hasAttribute('has-label')).to.be.true;
  });

  it('should not have has-value attribute by default', () => {
    expect(group.hasAttribute('has-value')).to.be.false;
  });

  it('should toggle has-value attribute on value change', () => {
    group.value = ['2'];
    expect(group.hasAttribute('has-value')).to.be.true;
    group.value = [];
    expect(group.hasAttribute('has-value')).to.be.false;
  });

  it('should add label to checkbox group when a label is dynamically set', () => {
    group.label = 'foo';
    expect(group.shadowRoot.querySelector('label').innerText).to.be.equal('foo');
  });

  it('should be possible to uncheck the checkbox on reattaching of the group', () => {
    const container = group.parentElement;
    container.removeChild(group);
    container.appendChild(group);
    group._observer.flush();
    checkboxes[0].checked = true;
    checkboxes[0].checked = false;
    expect(checkboxes[0].checked).to.be.false;
  });

  it('should not fire change event on programmatic value change', () => {
    const spy = sinon.spy();
    group.addEventListener('change', spy);
    group.value = ['2'];
    expect(spy.called).to.be.false;
  });

  describe('warnings', () => {
    beforeEach(() => {
      sinon.stub(console, 'warn');
    });

    afterEach(() => {
      console.warn.restore();
    });

    it('should warn when adding checkbox without value', () => {
      const checkbox = document.createElement('vaadin-checkbox');
      group.appendChild(checkbox);
      group._observer.flush();
      expect(console.warn.callCount).to.equal(1);
    });

    it('should not warn when adding checkbox with value attribute', () => {
      const checkbox = document.createElement('vaadin-checkbox');
      checkbox.setAttribute('value', 'something');
      group.appendChild(checkbox);
      group._observer.flush();
      expect(console.warn.callCount).to.equal(0);
    });

    it('should not warn when adding checkbox with value property', () => {
      const checkbox = document.createElement('vaadin-checkbox');
      checkbox.value = 'something';
      group.appendChild(checkbox);
      group._observer.flush();
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('error message', () => {
    it('setting errorMessage updates has-error-message attribute', function () {
      group.errorMessage = 'foo';
      expect(group.hasAttribute('has-error-message')).to.be.true;
    });

    it('setting errorMessage to empty string does not update has-error-message attribute', function () {
      group.errorMessage = '';
      expect(group.hasAttribute('has-error-message')).to.be.false;
    });

    it('setting errorMessage to null does not update has-error-message attribute', function () {
      group.errorMessage = null;
      expect(group.hasAttribute('has-error-message')).to.be.false;
    });
  });

  describe('helper text', () => {
    it('setting helper updates has-helper attribute', function () {
      group.helperText = 'foo';
      expect(group.hasAttribute('has-helper')).to.be.true;
    });

    it('setting helper to empty string does not update has-helper attribute', function () {
      group.helperText = '';
      expect(group.hasAttribute('has-helper')).to.be.false;
    });

    it('setting helper to null does not update has-helper attribute', function () {
      group.helperText = null;
      expect(group.hasAttribute('has-helper')).to.be.false;
    });

    it('setting helper with slot updates has-helper attribute', function () {
      const helper = document.createElement('div');
      helper.setAttribute('slot', 'helper');
      helper.textContent = 'foo';
      group.appendChild(helper);
      group._observer.flush();

      expect(group.hasAttribute('has-helper')).to.be.true;
    });
  });
});

describe('validation', () => {
  let group, checkboxes;

  beforeEach(() => {
    group = fixtureSync(`
      <vaadin-checkbox-group>
        <vaadin-checkbox name="language" value="en">English</vaadin-checkbox>
        <vaadin-checkbox name="language" value="fr">Français</vaadin-checkbox>
        <vaadin-checkbox name="language" value="de">Deutsch</vaadin-checkbox>
      </vaadin-checkbox-group>
    `);
    checkboxes = group.querySelectorAll('vaadin-checkbox');
    group._observer.flush();
  });

  it('should not have invalid attribute initially', () => {
    expect(group.hasAttribute('invalid')).to.be.false;
  });

  it('should not add invalid attribute if required attribute is not present', () => {
    checkboxes[0].checked = true;
    checkboxes[0].checked = false;
    expect(group.hasAttribute('invalid')).to.be.false;
  });

  it('should add invalid attribute if required attribute is present and checkbox group value is empty', () => {
    group.required = true;
    checkboxes[0].checked = true;
    checkboxes[0].checked = false;
    expect(group.hasAttribute('invalid')).to.be.true;
  });

  it('should remove invalid attribute if checkbox group value is not empty', () => {
    group.required = true;
    checkboxes[0].checked = true;
    checkboxes[0].checked = false;
    expect(group.hasAttribute('invalid')).to.be.true;

    checkboxes[0].checked = true;
    expect(group.hasAttribute('invalid')).to.be.false;
  });

  it('should pass validation and set invalid when field is required and user blurs out of the group', () => {
    group.required = true;
    focusout(group, document.body);
    expect(group.invalid).to.be.true;
  });

  it('should not run validation while user is tabbing between checkboxes inside of the group', () => {
    group.required = true;
    const spy = sinon.spy(group, 'validate');
    focusout(group, checkboxes[1]);
    expect(spy.called).to.be.false;
  });

  it('should not run validation while user is tabbing between checkboxes and focus moves to native checkbox', () => {
    group.required = true;
    const spy = sinon.spy(group, 'validate');
    focusout(group, checkboxes[1].focusElement);
    expect(spy.called).to.be.false;
  });

  it('should not show the error message initially', () => {
    group.errorMessage = 'Error message';
    expect(group.shadowRoot.querySelector('[part="error-message"]').getAttribute('aria-hidden')).to.be.equal('true');
  });

  it('should show the error message if validation status is invalid', () => {
    group.errorMessage = 'Error message';
    group.invalid = true;
    expect(group.shadowRoot.querySelector('[part="error-message"]').getAttribute('aria-hidden')).to.be.equal('false');
  });
});

describe('array mutation methods', () => {
  let bind, group, checkboxes;

  beforeEach(() => {
    group = fixtureSync(`
      <dom-bind>
        <template>
          <vaadin-checkbox-group id="group" value="{{value}}">
            <vaadin-checkbox value="a">Checkbox <b>a</b></vaadin-checkbox>
            <vaadin-checkbox value="b">Checkbox <b>b</b></vaadin-checkbox>
            <vaadin-checkbox value="c">Checkbox <b>c</b></vaadin-checkbox>
          </vaadin-checkbox-group>
        </template>
      </template>
    </dom-bind>
    `);
    bind = document.querySelector('dom-bind');
    checkboxes = group.querySelectorAll('vaadin-checkbox');
    group._observer.flush();
  });

  it('should notify the value changes from inside', () => {
    expect(bind.value).to.be.instanceOf(Array);
    expect(bind.value.length).to.equal(0);
    checkboxes[0].checked = true;
    expect(bind.value.length).to.equal(1);
    expect(bind.value[0]).to.equal('a');
  });

  it('should update checkboxes when a checkbox value is updated using push', () => {
    bind.push('value', 'a');
    expect(checkboxes[0].checked).to.be.true;
  });

  it('should update checkboxes when a checkbox value is updated using pop', () => {
    bind.value = ['a', 'b'];
    bind.pop('value');
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[1].checked).to.be.false;
  });

  it('should update checkboxes when a checkbox value is updated using push', () => {
    bind.value = ['b'];
    bind.unshift('value', 'a');
    expect(checkboxes[1].checked).to.be.true;
    expect(checkboxes[0].checked).to.be.true;
  });

  it('should update checkboxes when a checkbox value is updated using unshift', () => {
    bind.value = ['a', 'b'];
    bind.shift('value');
    expect(checkboxes[0].checked).to.be.false;
    expect(checkboxes[1].checked).to.be.true;
  });

  it('should update checkboxes when a checkbox value is updated using splice', () => {
    bind.value = ['a', 'b'];
    bind.splice('value', 1, 1, 'c');
    expect(checkboxes[0].checked).to.be.true;
    expect(checkboxes[1].checked).to.be.false;
    expect(checkboxes[2].checked).to.be.true;
  });
});

describe('wrapping', () => {
  let group;

  beforeEach(() => {
    group = fixtureSync(`
      <vaadin-checkbox-group>
        <vaadin-checkbox value="c_1">Checkbox 1</vaadin-checkbox>
        <vaadin-checkbox value="c_2">Checkbox 2</vaadin-checkbox>
        <vaadin-checkbox value="c_3">Checkbox 3</vaadin-checkbox>
        <vaadin-checkbox value="c_4">Checkbox 4</vaadin-checkbox>
        <vaadin-checkbox value="c_5">Checkbox 5</vaadin-checkbox>
        <vaadin-checkbox value="c_6">Checkbox 6</vaadin-checkbox>
        <vaadin-checkbox value="c_7">Checkbox 7</vaadin-checkbox>
        <vaadin-checkbox value="c_8">Checkbox 8</vaadin-checkbox>
        <vaadin-checkbox value="c_9">Checkbox 9</vaadin-checkbox>
        <vaadin-checkbox value="c_10">Checkbox 10</vaadin-checkbox>
        <vaadin-checkbox value="c_11">Checkbox 11</vaadin-checkbox>
        <vaadin-checkbox value="c_12">Checkbox 12</vaadin-checkbox>
      </vaadin-checkbox-group>
    `);
    group._observer.flush();
  });

  it('should not overflow horizontally', () => {
    const parentWidth = group.parentElement.offsetWidth;

    expect(group.offsetWidth).to.be.lte(parentWidth);
    expect(group.shadowRoot.querySelector('[part~="group-field"]').offsetWidth).to.be.lte(parentWidth);
  });

  it('should wrap checkboxes', () => {
    const checkboxes = Array.from(group.children);
    const { top: firstTop, left: firstLeft } = checkboxes[0].getBoundingClientRect();

    const wrapped = Array.from(checkboxes)
      .slice(1)
      .filter((checkbox) => checkbox.getBoundingClientRect().top > firstTop);

    expect(wrapped).to.not.be.empty;
    expect(wrapped[0].getBoundingClientRect().left).to.equal(firstLeft);
  });
});

describe('helper slot', () => {
  let group;

  beforeEach(() => {
    group = fixtureSync(`
      <vaadin-checkbox-group>
        <div slot="helper">foo</div>
      </vaadin-checkbox-group>
    `);
    group._observer.flush();
  });

  it('should set has-helper attribute when slotted helper is provided', function () {
    expect(group.hasAttribute('has-helper')).to.be.true;
  });

  it('should remove has-helper attribute when slotted helper is removed', function () {
    const helper = group.querySelector('[slot="helper"]');
    group.removeChild(helper);
    group._observer.flush();
    expect(group.hasAttribute('has-helper')).to.be.false;
  });
});

describe('slot focus', () => {
  let group, helper;

  beforeEach(() => {
    group = fixtureSync(`
      <vaadin-checkbox-group>
        <vaadin-checkbox value="1">Checkbox <b>1</b></vaadin-checkbox>
        <vaadin-checkbox value="2">Checkbox <b>2</b></vaadin-checkbox>
        <vaadin-checkbox value="3">Checkbox <b>3</b></vaadin-checkbox>
        <div slot="helper">
          <input type="text" />
        </div>
      </vaadin-checkbox-group>
    `);
    group._observer.flush();
    group.focus();
    helper = group.querySelector('[slot="helper"]');
  });

  it('should not get focus after click', () => {
    helper.click();

    expect(group.hasAttribute('focused')).to.be.false;
  });
});
