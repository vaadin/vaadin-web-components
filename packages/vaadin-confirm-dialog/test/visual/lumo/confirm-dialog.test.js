import { fixtureSync } from '@vaadin/testing-helpers/dist/fixture.js';
import { visualDiff } from '@web/test-runner-visual-regression';
import '../../../theme/lumo/vaadin-confirm-dialog.js';

describe('confirm-dialog', () => {
  let div, element;

  beforeEach(() => {
    div = document.createElement('div');
    div.style.height = '100%';

    element = fixtureSync(
      `
        <vaadin-confirm-dialog header="Action required" opened>
          Please press a button to confirm.
        </vaadin-confirm-dialog>
      `,
      div
    );
  });

  it('basic', async () => {
    await visualDiff(div, 'confirm-dialog:basic');
  });

  it('cancel', async () => {
    element.cancel = true;
    await visualDiff(div, 'confirm-dialog:cancel');
  });

  it('reject', async () => {
    element.reject = true;
    await visualDiff(div, 'confirm-dialog:reject');
  });

  it('cancel reject', async () => {
    element.cancel = true;
    element.reject = true;
    await visualDiff(div, 'confirm-dialog:cancel-reject');
  });
});
