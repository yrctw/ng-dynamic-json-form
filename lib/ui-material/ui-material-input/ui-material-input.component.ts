import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  CustomControlComponent,
  PropsBindingDirective,
  providePropsBinding,
} from 'ng-dynamic-json-form';

@Component({
  selector: 'ui-material-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    PropsBindingDirective,
  ],
  providers: [
    providePropsBinding([
      {
        key: 'mat-input',
        token: MatInput,
      },
    ]),
  ],
  templateUrl: './ui-material-input.component.html',
  styles: [],
})
export class UiMaterialInputComponent extends CustomControlComponent {
  override control = new UntypedFormControl('');
}
