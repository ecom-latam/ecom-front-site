import type { ErrorDefinition } from './errors';

type ShowErrorFn = (error: ErrorDefinition, retryFn?: () => void) => void;

let _showError: ShowErrorFn | null = null;

export function registerErrorModal(fn: ShowErrorFn) {
  _showError = fn;
}

export function unregisterErrorModal() {
  _showError = null;
}

export function triggerErrorModal(error: ErrorDefinition, retryFn?: () => void) {
  _showError?.(error, retryFn);
}
