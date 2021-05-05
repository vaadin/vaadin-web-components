import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { fixtureSync } from '@vaadin/testing-helpers';
import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { buildDataSet, flushGrid, getCellContent, infiniteDataProvider } from './helpers.js';
import '../vaadin-grid.js';

registerStyles(
  'vaadin-grid',
  css`
    :host {
      font-size: 16px;
      line-height: 1.5;
    }

    :host(.small) [part~='cell'] {
      line-height: 10px;
      padding: 0 !important;
      min-height: 0 !important;
    }

    ::slotted(vaadin-grid-cell-content) {
      padding: 0 !important;
    }
  `
);

describe('dynamic physical count', () => {
  let scroller, grid;

  beforeEach(() => {
    grid = fixtureSync(`
      <vaadin-grid style="width: 200px; height: 200px;" size="200" theme="no-border">
        <vaadin-grid-column>
          <template>[[index]]</template>
        </vaadin-grid-column>
      </vaadin-grid>
    `);
    grid.dataProvider = infiniteDataProvider;
    scroller = grid.$.scroller;
    flushGrid(grid);
  });

  it('increase pool size', () => {
    const lastItem = grid._physicalItems[grid.lastVisibleIndex];
    const expectedFinalItem = Math.ceil(grid.offsetHeight / grid._physicalAverage) - 1;

    expect(scroller.offsetHeight).to.equal(grid.offsetHeight);
    expect(getCellContent(lastItem).textContent).to.equal(String(expectedFinalItem));
  });

  it('increase pool size after resizing the scroller', () => {
    grid.classList.add('small');
    grid.style.display = 'none';

    expect(grid._physicalItems.length).to.eql(25);

    grid.style.display = '';
    grid._resizeHandler();
    flushGrid(grid);

    expect(grid._physicalItems.length).to.be.above(25);
  });

  it('pool should not increase if the scroller has no size', () => {
    grid.style.display = 'none';
    grid.style.height = '1000px';

    grid.classList.add('small');
    grid._resizeHandler();
    flushGrid(grid);

    grid._update();
    grid._increasePoolIfNeeded();

    expect(grid._physicalCount).to.equal(25);
  });

  it('should minimize physical count', () => {
    expect(grid._physicalCount).to.be.below(26);
    grid.style.height = '1000px';
    grid._resizeHandler();
    flushGrid(grid);

    expect(grid._physicalCount).to.be.above(26);
    expect(grid._physicalCount).to.be.below(60);
  });

  it('should not add unlimited amount of physical rows', () => {
    const itemCount = 50;
    grid.items = buildDataSet(itemCount);
    flushGrid(grid);

    // Repro for a really special bug:

    // 1: notifyResize will trigger _increasePoolIfNeeded
    grid.notifyResize();
    // 2: Hide grid
    grid.hidden = true;
    // 3: notifyResize will trigger updateViewportBoundaries which sets _viewPortHeight to 0 because grid is not rendered
    grid.notifyResize();
    // 4: Restore grid to render tree
    grid.hidden = false;
    // 5: Finally flush the grid, and finish the async callback started at phase 1.
    // _optPhysicalSize will be Infinity at this point so unlimited amount of rows would get added!
    // Only thing that limits it is the grid.items count.
    flushGrid(grid);

    expect(grid.$.items.childElementCount).to.be.below(itemCount);
  });
});

describe('increase pool', () => {
  let grid;

  beforeEach(() => {
    grid = fixtureSync(`
      <vaadin-grid style="width: 200px; height: 200px;" size="200" theme="no-border">
        <vaadin-grid-column>
          <template>[[index]]</template>
        </vaadin-grid-column>
      </vaadin-grid>
    `);
  });

  it('should minimize pool increase rounds', () => {
    grid.style.height = '1000px';
    const spy = sinon.spy(grid, '_createScrollerRows');
    grid.dataProvider = infiniteDataProvider;
    flushGrid(grid);
    expect(spy.callCount).to.equal(2);
  });

  it('should not try to reorder children if pool is not increased', () => {
    grid.items = ['foo', 'bar'];
    flushGrid(grid);

    const spy = sinon.spy(grid, '__reorderChildNodes');
    grid.items = ['foo'];
    flushGrid(grid);

    expect(spy.called).to.be.false;
  });
});
