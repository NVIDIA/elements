import { define } from '@nvidia-elements/core/internal';
import { Grid, GridColumn, GridRow, GridCell, GridFooter, GridHeader, GridPlaceholder } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/icon/define.js';

define(Grid);
define(GridColumn);
define(GridRow);
define(GridCell);
define(GridFooter);
define(GridHeader);
define(GridPlaceholder);

declare global {
  interface HTMLElementTagNameMap {
    'nve-grid': Grid;
    'nve-grid-column': GridColumn;
    'nve-grid-row': GridRow;
    'nve-grid-cell': GridCell;
    'nve-grid-footer': GridFooter;
    'nve-grid-header': GridHeader;
    'nve-grid-placeholder': GridPlaceholder;
    'mlv-grid': Grid;
    'mlv-grid-column': GridColumn;
    'mlv-grid-row': GridRow;
    'mlv-grid-cell': GridCell;
    'mlv-grid-footer': GridFooter;
    'mlv-grid-header': GridHeader;
    'mlv-grid-placeholder': GridPlaceholder;
  }
}
