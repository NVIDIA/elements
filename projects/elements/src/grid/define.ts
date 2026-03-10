import { define } from '@nvidia-elements/core/internal';
import { Grid, GridColumn, GridRow, GridCell, GridFooter, GridHeader, GridPlaceholder } from '@nvidia-elements/core/grid';

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
