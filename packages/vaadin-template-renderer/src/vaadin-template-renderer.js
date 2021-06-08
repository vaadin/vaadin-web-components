import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

import { GridElement } from '@vaadin/vaadin-grid/src/vaadin-grid.js';
import { GridColumnElement } from '@vaadin/vaadin-grid/src/vaadin-grid-column.js';
import { GridColumnGroupElement } from '@vaadin/vaadin-grid/src/vaadin-grid-column-group.js';

import './vaadin-template-renderer-templatizer.js';
import './vaadin-template-renderer-grid-templatizer.js';

import { Templatizer } from './vaadin-template-renderer-templatizer.js';
import { GridTemplatizer } from './vaadin-template-renderer-grid-templatizer.js';

function createRenderer(component, template, TemplatizerClass = Templatizer) {
  const templatizer = TemplatizerClass.create(component, template);

  const renderer = (root, _owner, model) => {
    templatizer.render(root, model);
  };

  template.__templatizer = templatizer;
  renderer.__templatizer = templatizer;

  return renderer;
}

function processGridTemplate(grid, template) {
  if (template.matches('.row-details')) {
    grid.rowDetailsRenderer = createRenderer(grid, template, GridTemplatizer);
    return;
  }
}

function processGridColumnTemplate(column, template) {
  if (template.matches('.header')) {
    column.headerRenderer = createRenderer(column, template);
    return;
  }

  if (template.matches('.footer')) {
    column.footerRenderer = createRenderer(column, template);
    return;
  }

  if (template.matches('.editor')) {
    column.editModeRenderer = createRenderer(column, template, GridTemplatizer);
    return;
  }

  column.renderer = createRenderer(column, template, GridTemplatizer);
}

function processTemplate(component, template) {
  if (component instanceof GridElement) {
    processGridTemplate(component, template);
    return;
  }

  if (
    // eslint-disable-next-line prettier/prettier
    component instanceof GridColumnElement ||
    component instanceof GridColumnGroupElement
  ) {
    processGridColumnTemplate(component, template);
    return;
  }

  component.renderer = createRenderer(component, template);
}

function processTemplates(component) {
  FlattenedNodesObserver.getFlattenedNodes(component)
    .filter((child) => {
      return child instanceof HTMLTemplateElement;
    })
    .forEach((template) => {
      // Ignore templates which have been processed earlier
      if (template.__templatizer) {
        return;
      }
      processTemplate(component, template);
    });
}

function observeTemplates(component) {
  if (component.__templateObserver) return;

  component.__templateObserver = new FlattenedNodesObserver(component, () => {
    processTemplates(component);
  });
}

window.Vaadin = window.Vaadin || {};
window.Vaadin.templateRendererCallback = (component) => {
  processTemplates(component);
  observeTemplates(component);
};
