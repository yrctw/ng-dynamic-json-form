import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { firstUppercaseValidator } from './custom-validators/first-uppercase.validator';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { UiPrimengComponent } from 'ng-dynamic-json-form/ui-primeng';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'NgDynamicJsonForm Demo';

  jsonString = '';
  private _jsonString = '';

  form?: UntypedFormGroup;

  customValidators = {
    firstUppercase: firstUppercaseValidator,
  };

  customComponents = {
    'custom-input': CustomInputComponent,
  };

  customUIComponent = UiPrimengComponent;

  onJsonEditorChanged(value: string): void {
    this._jsonString = value;
  }

  onFormGet(e: UntypedFormGroup): void {
    this.form = e;
  }

  // Update form manually to prevent form binding errors when JSON is invalid
  generateForm(): void {
    this.jsonString = this._jsonString;
  }

  patchForm(): void {
    const dataToOverwrite = {
      basicInfo: {
        name: 'ANother NameYOu dontKNow',
        age: '25',
        gender: '1',
        status: false,
        email: 'emailPatched@example.com',
      },
      creditCardTypes: ['master'],
      carBrand: '0',
      address: {
        country: 'country name',
        state: 'State name',
        postcode: '00000',
      },
      familyMemberInfo: [
        {
          name: '00',
          email: '',
          address: {
            country: 'country A',
            state: 'State A',
            postcode: '00001',
          },
          relationship: '',
        },
        {
          name: 'AA123',
          email: '',
          address: {
            country: 'country B',
            state: 'State B',
            postcode: '00002',
          },
          relationship: '',
        },
      ],
    };

    this.form?.patchValue(dataToOverwrite);
  }
}
