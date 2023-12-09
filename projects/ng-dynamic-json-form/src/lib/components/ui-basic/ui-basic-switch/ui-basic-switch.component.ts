import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomControlComponent } from '../../custom-control/custom-control.component';

@Component({
  selector: 'ui-basic-switch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ui-basic-switch.component.html',
  styles: [],
})
export class UiBasicSwitchComponent extends CustomControlComponent {
  override control = new FormControl(false);
}
