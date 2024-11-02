import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/menu/define.js';

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
