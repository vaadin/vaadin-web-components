import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { click, fire, fixtureSync, nextFrame } from '@vaadin/testing-helpers';

import '../vaadin-template-renderer.js';
import { Templatizer } from '../src/vaadin-template-renderer-templatizer.js';

import './x-component-host.js';
import './x-component.js';

describe('vaadin-template-renderer', () => {
  describe('basic', () => {
    let component, template;

    beforeEach(() => {
      component = fixtureSync(`
        <x-component>
          <template>foo</template>
        </x-component>
      `);

      template = component.querySelector('template');
    });

    it('should render the template', () => {
      expect(component.$.content.textContent).to.equal('foo');
    });

    it('should process the template only once', () => {
      const oldTemplatizer = template.__templatizer;

      window.Vaadin.templateRendererCallback(component);

      const newTemplatizer = template.__templatizer;

      expect(newTemplatizer).to.be.instanceOf(Templatizer);
      expect(newTemplatizer).to.equal(oldTemplatizer);
    });

    it('should preserve the template instance when re-rendering', () => {
      const oldTemplateInstance = component.$.content.__templateInstance;

      component.render();

      const newTemplateInstance = component.$.content.__templateInstance;

      expect(template.__templatizer.__templateInstances).to.have.lengthOf(1);
      expect(template.__templatizer.__templateInstances).to.include(newTemplateInstance);
      expect(template.__templatizer.__templateInstances).to.include(oldTemplateInstance);
    });
  });

  it('should not process non-child templates', () => {
    const component = fixtureSync(`
      <x-component>
        <div>
          <template>foo</template>
        </div>
      </x-component>
    `);

    expect(component.$.content.textContent).to.equal('');
  });

  it('should render the last child template in case of multiple templates', () => {
    const component = fixtureSync(`
      <x-component>
        <template>foo</template>
        <template>bar</template>
      </x-component>
    `);

    expect(component.$.content.textContent).to.equal('bar');
  });

  it('should handle events from the template instance', () => {
    const host = fixtureSync(`<x-component-host></x-component-host>`);
    const component = host.$.component;
    const button = component.$.content.querySelector('button');
    const spy = sinon.spy(host, 'onClick');

    click(button);

    expect(spy.calledOnce).to.be.true;
  });

  it('should re-render the template istance when changing a parent property', async () => {
    const host = fixtureSync(`<x-component-host></x-component-host>`);
    const component = host.$.component;

    host.value = 'foobar';

    expect(component.$.content.textContent.trim()).to.equal('foobar');
  });

  it('should re-render multiple template instances independently', async () => {
    const host1 = fixtureSync(`<x-component-host></x-component-host>`);
    const host2 = fixtureSync(`<x-component-host></x-component-host>`);
    const component1 = host1.$.component;
    const component2 = host2.$.component;

    host1.value = 'foo';
    host2.value = 'bar';

    expect(component1.$.content.textContent.trim()).to.equal('foo');
    expect(component2.$.content.textContent.trim()).to.equal('bar');
  });

  it('should support the 2-way property binding', () => {
    const host = fixtureSync(`<x-component-host></x-component-host>`);
    const component = host.$.component;
    const input = component.$.content.querySelector('input');

    input.value = 'foobar';
    fire(input, 'input');

    expect(host.value).to.equal('foobar');
  });

  describe('observer', () => {
    it('should observe adding a template', async () => {
      const component = fixtureSync(`<x-component></x-component>`);
      const template = fixtureSync(`<template>bar</template>`);

      component.appendChild(template);
      await nextFrame();

      expect(component.$.content.textContent).to.equal('bar');
    });

    it('should observe replacing a template', async () => {
      const component = fixtureSync(`
        <x-component>
          <template>foo</template>
        </x-component>
      `);
      const template = fixtureSync(`<template>bar</template>`);

      component.replaceChildren(template);
      await nextFrame();

      expect(component.$.content.textContent).to.equal('bar');
    });

    it('should not observe adding a non-template element', async () => {
      const component = fixtureSync(`<x-component></x-component>`);
      const element = fixtureSync('<div>bar</div>');

      component.appendChild(element);
      await nextFrame();

      expect(component.$.content.textContent).to.equal('');
    });

    it('should not observe adding a non-child template', async () => {
      const component = fixtureSync(`
        <x-component>
          <div></div>
        </x-component>
      `);
      const template = fixtureSync(`<template>bar</template>`);

      component.querySelector('div').appendChild(template);
      await nextFrame();

      expect(component.$.content.textContent).to.equal('');
    });
  });
});
