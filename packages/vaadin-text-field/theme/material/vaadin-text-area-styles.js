import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import './vaadin-text-field-styles.js';

registerStyles(
  'vaadin-text-area',
  css`
    [part='input-field'] {
      height: auto;
      box-sizing: border-box;
    }

    .textarea-wrapper {
      margin-top: 4px;
    }

    [part='value'],
    [part='input-field'] ::slotted(textarea),
    .textarea-wrapper::after {
      padding: 0 0 8px;
    }

    [part='input-field'] [part='value'],
    [part='input-field'] ::slotted(textarea) {
      white-space: pre-wrap; /* override "nowrap" from <vaadin-text-field> */
      align-self: stretch; /* override "baseline" from <vaadin-text-field> */
    }
  `,
  { moduleId: 'material-text-area', include: ['material-text-field'] }
);
