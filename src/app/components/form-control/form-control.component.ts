import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { debounceTime, map, tap } from 'rxjs';
import { JsonFormControlData } from 'src/app/core/models/json-form-control-data.model';
import { JsonFormControlOptions } from 'src/app/core/models/json-form-control-options.model';
import { getValidators } from 'src/app/utils/validator-generator';

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormControlComponent),
      multi: true,
    },
  ],
})
export class FormControlComponent implements ControlValueAccessor, Validator {
  @Input() label = '';
  @Input() inputType = '';
  @Input() options: JsonFormControlOptions[] = [];
  @Input() validators: string[] = [];

  formControl?: UntypedFormControl;
  checkboxValues: any[] = [];

  constructor() {}

  writeValue(obj: any): void {
    if (!this.formControl) return;

    if (!!this.options.length) {
      switch (this.inputType) {
        case 'checkbox':
          this.checkboxValues = [...obj];
          break;
      }
    }

    this.formControl.setValue(this.getInitialValue(obj));
  }
  registerOnChange(fn: any): void {
    this.formControl?.valueChanges.pipe(debounceTime(0)).subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.formControl?.markAllAsTouched();
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formControl?.disable() : this.formControl?.enable();
    this.formControl?.updateValueAndValidity();
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    if (!this.formControl) return null;
    return this.formControl.valid ? null : this.formControl.errors;
  }
  registerOnValidatorChange?(fn: () => void): void {
    return;
  }

  ngOnInit(): void {
    this.formControl = new UntypedFormControl('', {
      validators: getValidators(this.validators),
    });
  }

  private getInitialValue(input: any): any {
    if (input !== null && input !== '' && input !== undefined) {
      return input;
    }

    switch (typeof input) {
      case 'boolean':
        return false;

      case 'number':
        return 0;

      case 'string':
        return '';

      default:
        return null;
    }
  }

  onCheckboxChange(e: Event): void {
    const input = e.target as HTMLInputElement;

    if (!input.checked || this.checkboxValues.includes(input.value)) {
      this.checkboxValues = this.checkboxValues.filter(
        (x) => x !== input.value
      );
    } else {
      this.checkboxValues.push(input.value);
    }

    this.formControl?.setValue(this.checkboxValues);
  }
}