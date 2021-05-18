import { nothing, SVGTemplateResult } from 'lit';

export type IconSvgLiteral = SVGTemplateResult | typeof nothing;

/**
 * Clone given node and return its content as SVG literal.
 */
export function cloneSvgNode(source: Element): IconSvgLiteral;

/**
 * Test if the given argument is a valid SVG literal.
 */
export function isValidSvg(source: unknown): source is IconSvgLiteral;

/**
 * Create a valid SVG literal based on the argument.
 */
export function ensureSvgLiteral(source: unknown): IconSvgLiteral;

/**
 * Render a given SVG literal to the container.
 */
export function renderSvg(source: unknown, container: SVGElement);

/**
 * Create an SVG literal from source string.
 */
export function unsafeSvgLiteral(source: string): IconSvgLiteral;
