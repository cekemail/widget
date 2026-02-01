/**
 * CSS styles injected by the widget
 */
export const WIDGET_STYLES = `
@keyframes cekemail-spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}
.cekemail-wrapper { position: relative; display: inline-block; width: 100%; }
.cekemail-indicator { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 18px; }
input.cekemail-valid { border-color: #22c55e !important; }
input.cekemail-invalid { border-color: #ef4444 !important; }
input.cekemail-checking { border-color: #3b82f6 !important; }
`;

/**
 * Indicator icons
 */
export const INDICATOR_ICONS = {
  valid: '✓',
  invalid: '✗',
  checking: '⟳',
} as const;

/**
 * Indicator colors
 */
export const INDICATOR_COLORS = {
  valid: '#22c55e',
  invalid: '#ef4444',
  checking: '#3b82f6',
} as const;

let stylesInjected = false;

/**
 * Inject widget styles into the document head
 */
export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (stylesInjected) return;

  const style = document.createElement('style');
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}
