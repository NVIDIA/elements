import { define } from '@elements/elements/internal';
import { Grid, GridColumn, GridRow, GridCell, GridFooter, GridHeader, GridPlaceholder } from '@elements/elements/grid';
import '@elements/elements/sort-button/define.js';
import '@elements/elements/icon/define.js';

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
  }
}
