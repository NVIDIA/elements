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
    'mlv-grid': Grid;
    'mlv-grid-column': GridColumn;
    'mlv-grid-row': GridRow;
    'mlv-grid-cell': GridCell;
    'mlv-grid-footer': GridFooter;
    'mlv-grid-header': GridHeader;
    'mlv-grid-placeholder': GridPlaceholder;
  }
}
