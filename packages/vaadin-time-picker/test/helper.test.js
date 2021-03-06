import { expect } from '@esm-bundle/chai';
import { fixtureSync, isDesktopSafari, nextFrame } from '@vaadin/testing-helpers';
import '../vaadin-time-picker.js';

describe('helper text', () => {
  let timePicker, inputElement;

  beforeEach(() => {
    timePicker = fixtureSync(`<vaadin-time-picker></vaadin-time-picker>`);
    inputElement = timePicker.__inputElement;
  });

  // Skipped because of the issue with slots order occurring in https://failing-container.glitch.me.
  (isDesktopSafari ? it.skip : it)(`should propagate helperText property to text-field`, () => {
    expect(inputElement.helperText).to.be.empty;
    timePicker.helperText = 'foo';
    expect(inputElement.helperText).to.be.equal('foo');
  });

  it('should display the helper text when slotted helper available', async () => {
    const helper = document.createElement('div');
    helper.setAttribute('slot', 'helper');
    helper.textContent = 'foo';
    timePicker.appendChild(helper);
    await nextFrame();
    expect(inputElement.querySelector('[slot="helper"]').assignedNodes()[0].textContent).to.eql('foo');
  });
});
