import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import '@elements/elements/app-header/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/menu/define.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  expanded = true;
}
