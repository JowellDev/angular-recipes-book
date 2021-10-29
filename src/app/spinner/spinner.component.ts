import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: ` <div class="lds-ripple">
    <div></div>
    <div></div>
  </div>`,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {}
