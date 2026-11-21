// Shared classes for floating lists (Select, Combobox; later Menu). Overlays are the only layer
// with a shadow (R01.4, A01, P-T4); items keep the 44 px target (K1); highlight = surface-hover (D4).

export const positionerClasses = 'z-(--layer-overlay) outline-none';

export const popupClasses =
  'max-h-(--available-height) min-w-(--anchor-width) max-w-(--available-width) overflow-y-auto overscroll-contain rounded-panel border border-border-divider bg-surface-panel py-tight text-text-default shadow-overlay transition-opacity duration-(--duration-overlay) data-ending-style:opacity-0 data-starting-style:opacity-0';

export const listItemClasses =
  'relative flex min-h-control cursor-default items-center gap-inline px-field-x text-body text-text-default outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-text-disabled data-highlighted:bg-surface-hover data-selected:font-medium';

export const itemIndicatorClasses = 'ml-auto flex text-text-link [&>svg]:size-icon-sm';

export const groupLabelClasses =
  'px-field-x pt-inline pb-tight text-meta font-medium text-text-muted';

// Modal layers (Dialog, AlertDialog, Sheet): scrim + panel; fade only, no movement (P-T8, WCAG 2.3.3).
export const backdropClasses =
  'fixed inset-0 z-(--layer-overlay) bg-surface-scrim transition-opacity duration-(--duration-overlay) data-ending-style:opacity-0 data-starting-style:opacity-0';

export const modalPanelClasses =
  'flex flex-col gap-group bg-surface-panel text-text-default shadow-overlay outline-none transition-opacity duration-(--duration-overlay) data-ending-style:opacity-0 data-starting-style:opacity-0';

export const modalTitleClasses = 'text-section-title font-semibold text-text-default';

export const modalDescriptionClasses = 'max-w-measure text-body text-text-muted';
