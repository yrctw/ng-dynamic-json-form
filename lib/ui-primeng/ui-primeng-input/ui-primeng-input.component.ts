import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import {
  CustomControlComponent,
  PropsBindingDirective,
  providePropsBinding,
} from 'ng-dynamic-json-form';
import { InputText, InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'ui-primeng-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PropsBindingDirective,
  ],
  providers: [
    providePropsBinding([
      {
        key: 'p-input-text',
        token: InputText,
      },
    ]),
  ],
  templateUrl: './ui-primeng-input.component.html',
  styles: [],
})
export class UiPrimengInputComponent extends CustomControlComponent {
  override control = new UntypedFormControl('');
}
