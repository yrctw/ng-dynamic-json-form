import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  CustomControlComponent,
  NgDynamicJsonFormCustomComponent,
  NgxMaskConfigBindingDirective,
} from 'ng-dynamic-json-form';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'ui-material-input-mask',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    NgxMaskDirective,
    NgxMaskConfigBindingDirective,
  ],
  templateUrl: './ui-material-input-mask.component.html',
  styles: [],
  providers: [provideNgxMask()],
})
export class UiMaterialInputMaskComponent extends CustomControlComponent {
  override control = new FormControl('');
}
