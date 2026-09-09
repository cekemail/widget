import type { CekEmailInput, CekEmailCssClasses, ValidationState } from './types';
import { INDICATOR_ICONS, INDICATOR_COLORS } from './styles';

/**
 * Wrap an input with an indicator element
 */
export function wrapInputWithIndicator(
  input: CekEmailInput,
  cssClass: CekEmailCssClasses
): void {
  if (input.parentElement?.classList.contains(cssClass.wrapper)) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = cssClass.wrapper;
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.style.width = '100%';

  const indicator = document.createElement('span');
  indicator.className = cssClass.indicator;
  indicator.style.position = 'absolute';
  indicator.style.right = '10px';
  indicator.style.top = '50%';
  indicator.style.transform = 'translateY(-50%)';
  indicator.style.pointerEvents = 'none';
  indicator.style.fontSize = '18px';

  input.parentNode?.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  wrapper.appendChild(indicator);

  input.__cekemailIndicator = indicator;
}

/**
 * Set the validation state on an input
 */
export function setValidationState(
  input: CekEmailInput,
  state: ValidationState,
  cssClass: CekEmailCssClasses,
  message = ''
): void {
  clearValidationState(input, cssClass);

  const indicator = input.__cekemailIndicator;

  if (state === 'valid') {
    input.classList.add(cssClass.valid);
    if (indicator) {
      indicator.textContent = INDICATOR_ICONS.valid;
      indicator.style.color = INDICATOR_COLORS.valid;
      indicator.style.animation = '';
    }
  } else if (state === 'invalid') {
    input.classList.add(cssClass.invalid);
    if (indicator) {
      indicator.textContent = INDICATOR_ICONS.invalid;
      indicator.style.color = INDICATOR_COLORS.invalid;
      indicator.style.animation = '';
    }
  } else if (state === 'checking') {
    input.classList.add(cssClass.checking);
    if (indicator) {
      indicator.textContent = INDICATOR_ICONS.checking;
      indicator.style.color = INDICATOR_COLORS.checking;
      indicator.style.animation = 'cekemail-spin 1s linear infinite';
    }
  }

  input.setAttribute('data-cekemail-state', state);
  if (message) {
    input.setAttribute('data-cekemail-message', message);
    input.title = message;
  }
}

/**
 * Clear the validation state from an input
 */
export function clearValidationState(
  input: CekEmailInput,
  cssClass: CekEmailCssClasses
): void {
  input.classList.remove(cssClass.valid, cssClass.invalid, cssClass.checking);
  input.removeAttribute('data-cekemail-state');
  input.removeAttribute('data-cekemail-message');
  input.removeAttribute('title');

  const indicator = input.__cekemailIndicator;
  if (indicator) {
    indicator.textContent = '';
    indicator.style.animation = '';
  }

  clearSuggestion(input);
}

/**
 * Render (or update) the "did you mean" hint next to an input
 */
export function setSuggestion(
  input: CekEmailInput,
  suggestion: string,
  text: string,
  cssClass: CekEmailCssClasses,
  onApply: (suggestion: string) => void
): void {
  let element = input.__cekemailSuggestion;

  if (!element) {
    element = document.createElement('div');
    element.className = cssClass.suggestion;

    const anchor = input.parentElement?.classList.contains(cssClass.wrapper)
      ? input.parentElement
      : input;
    anchor.parentNode?.insertBefore(element, anchor.nextSibling);

    input.__cekemailSuggestion = element;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = suggestion;
  button.addEventListener('click', () => onApply(suggestion));

  const parts = text.split(suggestion);

  element.textContent = '';
  element.appendChild(document.createTextNode(parts.shift() || ''));
  element.appendChild(button);
  element.appendChild(document.createTextNode(parts.join(suggestion)));

  input.setAttribute('data-cekemail-suggestion', suggestion);
}

/**
 * Remove the "did you mean" hint from an input
 */
export function clearSuggestion(input: CekEmailInput): void {
  const element = input.__cekemailSuggestion;
  if (element) {
    element.parentNode?.removeChild(element);
    input.__cekemailSuggestion = undefined;
  }

  input.removeAttribute('data-cekemail-suggestion');
}

/**
 * Find all email inputs in the document
 */
export function findEmailInputs(root: ParentNode = document): NodeListOf<HTMLInputElement> {
  return root.querySelectorAll('input[type="email"]');
}

/**
 * Check if an element is an email input
 */
export function isEmailInput(element: Element): element is HTMLInputElement {
  return element.matches('input[type="email"]');
}

/**
 * Check if input has the disable attribute
 */
export function isDisabled(input: HTMLInputElement): boolean {
  return input.hasAttribute('data-cekemail-disable');
}
