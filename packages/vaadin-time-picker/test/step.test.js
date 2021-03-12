import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing-helpers';
import '../vaadin-time-picker.js';

describe('step property', () => {
  let timePicker;

  beforeEach(async () => {
    timePicker = await fixture(html`<vaadin-time-picker></vaadin-time-picker>`);
  });

  it('step property should be undefined by default', () => {
    expect(timePicker.step).to.be.equal(undefined);
  });

  it('should have dropdown items if step is undefined', () => {
    timePicker.step = undefined;
    expect(timePicker.__dropdownItems.length).to.be.equal(24);
  });

  it('should have dropdown items if step is bigger or equal than 15min', () => {
    timePicker.step = 15 * 60;
    expect(timePicker.__dropdownItems.length).to.be.equal(96);
  });

  it('should not have dropdown items if step is lesser than 15min', () => {
    timePicker.step = 15 * 60 - 1;
    expect(timePicker.__dropdownItems.length).to.be.equal(0);
  });

  it('should allow setting valid step property value', () => {
    timePicker.step = 0.5;
    expect(timePicker.step).to.be.equal(0.5);
  });

  it('should allow setting valid step value via attribute', () => {
    timePicker.setAttribute('step', '0.5');
    expect(timePicker.step).to.be.equal(0.5);
  });

  it('should expand the resolution and value on step change to smaller value', () => {
    timePicker.value = '12:00:00';
    expect(timePicker.value).to.be.equal('12:00');
    timePicker.step = 0.5;
    expect(timePicker.value).to.be.equal('12:00:00.000');
  });

  it('should shrink the resolution and value on step change to bigger value', () => {
    timePicker.value = '12:00:00';
    expect(timePicker.value).to.be.equal('12:00');
    timePicker.step = 3600;
    expect(timePicker.value).to.be.equal('12:00');
  });

  it('should be possible to set hours, minutes, seconds and milliseconds with according step', () => {
    // Hours
    timePicker.step = 3600;
    timePicker.value = '12';
    expect(timePicker.value).to.be.equal('12:00');

    // Minutes
    timePicker.step = 60;
    timePicker.value = '12:12';
    expect(timePicker.value).to.be.equal('12:12');

    // Seconds
    timePicker.step = 1;
    timePicker.value = '12:12:12';
    expect(timePicker.value).to.be.equal('12:12:12');

    // Milliseconds
    timePicker.step = 0.5;
    timePicker.value = '12:12:12.100';
    expect(timePicker.value).to.be.equal('12:12:12.100');
  });
});
