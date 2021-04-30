import { fixtureSync } from '@vaadin/testing-helpers/dist/fixture.js';
import { visualDiff } from '@web/test-runner-visual-regression';
import '../../../theme/material/vaadin-app-layout.js';
import '../../../theme/material/vaadin-drawer-toggle.js';

describe('app-layout', () => {
  let div, element;

  beforeEach(() => {
    div = document.createElement('div');
    div.style.height = '100%';

    element = fixtureSync(
      `
        <vaadin-app-layout>
          <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
          <h2 slot="navbar">App Name</h2>
          <section slot="drawer">Drawer content</section>
          <main>Page content</main>
        </vaadin-app-layout>
      `,
      div
    );
  });

  ['ltr', 'rtl'].forEach((dir) => {
    describe(dir, () => {
      before(() => {
        document.documentElement.setAttribute('dir', dir);
      });

      after(() => {
        document.documentElement.removeAttribute('dir');
      });

      it('basic', async () => {
        await visualDiff(div, `${import.meta.url}_${dir}-basic`);
      });

      it('primary-drawer', async () => {
        element.primarySection = 'drawer';
        await visualDiff(div, `${import.meta.url}_${dir}-primary-drawer`);
      });

      it('overlay', async () => {
        // See https://github.com/vaadin/vaadin-app-layout/issues/183
        element.style.setProperty('--vaadin-app-layout-drawer-overlay', ' true');
        window.dispatchEvent(new Event('resize'));
        await visualDiff(div, `${import.meta.url}_${dir}-overlay`);
      });
    });
  });
});
