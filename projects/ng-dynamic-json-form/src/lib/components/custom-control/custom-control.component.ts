import { Component, HostListener, inject } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';
import { FormControlConfig } from '../../models';
import { ControlValueService, FormValidationService } from '../../services';

@Component({
  selector: 'custom-control',
  template: ``,
  standalone: true,
})
export class CustomControlComponent implements ControlValueAccessor, Validator {
  private readonly _internal_controlValueService = inject(ControlValueService, {
    optional: true,
  });

  private readonly _internal_formValidationService = inject(
    FormValidationService,
    { optional: true }
  );

  private _internal_onTouched = () => {};
  private readonly _internal_init$ = new Subject<void>();

  /**Can be override by instance of `AbstractControl`
   * @example
   * public override control = new FormControl() 'or' new UntypedFormControl();
   * public override control = new FormGroup() 'or' new UntypedFormGroup();
   * public override control = new FormArray() 'or' new UntypedFormArray();
   */
  public control?: AbstractControl;
  public data?: FormControlConfig;
  public errorMessages: string[] = [];

  @HostListener('focusout', ['$event'])
  onFocusOut(): void {
    this._internal_onTouched();
  }

  writeValue(obj: any): void {
    this._internal_control.patchValue(this._internal_mapData('input', obj));
    this._internal_control.markAsDirty();
    this._internal_control.markAsTouched();
  }

  registerOnChange(fn: any): void {
    this._internal_control?.valueChanges
      .pipe(
        startWith(this._internal_control.value),
        map((x) => this._internal_mapData('output', x))
      )
      .subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this._internal_onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this._internal_control?.disable()
      : this._internal_control?.enable();
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return this._internal_control?.errors ?? null;
  }

  /**
   * @internal
   * Init event after component creation. Called by FormControlComponent.
   */
  private _internal_init(control?: AbstractControl): void {
    this._internal_init$.next();
    this._internal_listenErrors(control);
  }

  /**@internal */
  private _internal_listenErrors(control?: AbstractControl): void {
    if (!control || !this._internal_formValidationService) return;

    this._internal_formValidationService
      .getErrorMessages$(control, this.data?.validators)
      .pipe(
        tap((x) => (this.errorMessages = x)),
        takeUntil(this._internal_init$)
      )
      .subscribe();
  }

  /**@internal */
  private _internal_mapData(type: 'input' | 'output', data: unknown) {
    const service = this._internal_controlValueService;
    if (!service) return data;

    return service.mapData(type, data, this.data);
  }

  /**@internal */
  private get _internal_control(): AbstractControl {
    if (!this.control || !(this.control instanceof AbstractControl)) {
      throw {
        message: `The component extends CustomControlComponent but control is not defined`,
        component: this,
      };
    }

    return this.control;
  }
}