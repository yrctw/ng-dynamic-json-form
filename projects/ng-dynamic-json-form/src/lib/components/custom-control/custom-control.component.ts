import { Component, HostListener, ViewChild, inject } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  UntypedFormGroup,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { InputText } from 'primeng/inputtext';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, startWith, tap } from 'rxjs/operators';
import { FormControlConfig, OptionItem } from '../../models';
import {
  ControlValueService,
  ErrorMessageService,
  OptionsDataService,
} from '../../services';

@Component({
  selector: 'custom-control',
  template: ``,
  standalone: true,
})
export class CustomControlComponent implements ControlValueAccessor, Validator {
  private _internal_controlValueService = inject(ControlValueService);
  private _internal_errorMessageService = inject(ErrorMessageService);
  private _internal_optionsDataService = inject(OptionsDataService);

  private _internal_form?: UntypedFormGroup;

  private _internal_onTouched = () => {};

  private _internal_getInputData = (input: unknown) =>
    this._internal_controlValueService.mapInputData(input, this.data);

  private _internal_getOutputData = (input: unknown) =>
    this._internal_controlValueService.mapOutputData(input, this.data);

  /**Can be override by instance of `AbstractControl`
   * @example
   * public override control = new FormControl() 'or' new UntypedFormControl();
   * public override control = new FormGroup() 'or' new UntypedFormGroup();
   * public override control = new FormArray() 'or' new UntypedFormArray();
   */
  public control?: any;
  public data?: FormControlConfig;
  public errors$ = new BehaviorSubject<string[]>([]);

  @ViewChild(InputText) inputTextRef?: InputText;
  @ViewChild(MatFormField) matFormFielRef?: MatFormField;

  @HostListener('focusout', ['$event'])
  onFocusOut(): void {
    this._internal_onTouched();
  }

  writeValue(obj: any): void {
    if (obj === undefined || obj === null || obj === '') return;
    this._internal_control.setValue(this._internal_getInputData(obj));
    this._internal_control.markAsDirty();
    this._internal_control.markAsTouched();
  }

  registerOnChange(fn: any): void {
    this._internal_control?.valueChanges
      .pipe(
        startWith(this._internal_control.value),
        map((x) => this._internal_getOutputData(x))
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
    this._internal_control?.updateValueAndValidity();
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return this._internal_control?.errors ?? null;
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

  /**@internal */
  private _internal_init(
    form?: UntypedFormGroup,
    control?: AbstractControl
  ): void {
    this._internal_form = form;
    this._internal_listenErrors(control);
    this._internal_fetchOptions();
  }

  /**@internal */
  private _internal_listenErrors(control?: AbstractControl): void {
    if (!control) return;

    control.statusChanges
      .pipe(
        startWith(control.status),
        map(() =>
          this._internal_errorMessageService.getErrorMessages(
            control.errors,
            control.value,
            this.data?.validators || []
          )
        ),
        tap((x) => {
          this._internal_control.setErrors(control.errors);
          this.errors$.next(x);
        })
      )
      .subscribe();
  }

  /**@internal */
  private _internal_fetchOptions(): void {
    if (!this.data || !this.data.options) {
      return;
    }

    const loading = (value: boolean) => {
      if (!this.data) return;
      this.data.extra = {
        ...this.data.extra,
        _internal_loading: value,
      };
    };

    const existingOptions = this.data.options.data || [];

    const setData = (
      source: Observable<OptionItem[]>
    ): Observable<OptionItem[]> =>
      source.pipe(
        tap((x) => {
          this.data!.options!.data =
            this.data!.options?.sourceAppendPosition === 'before'
              ? x.concat(existingOptions)
              : existingOptions.concat(x);

          loading(false);
        }),
        finalize(() => loading(false))
      );

    if (!this._internal_form || !this.data.options.trigger) {
      loading(true);
      this._internal_optionsDataService
        .getOptions$(this.data.options)
        .pipe(setData)
        .subscribe();

      return;
    }

    const trigger = this.data.options.trigger;
    if (!trigger.action) return;

    const optionsOnTrigger$ =
      trigger.action === 'FILTER'
        ? this._internal_optionsDataService.filterOptionsOnTrigger$(
            this._internal_form,
            trigger
          )
        : this._internal_optionsDataService.requestOptionsOnTrigger$(
            this._internal_form,
            trigger
          );

    loading(true);
    optionsOnTrigger$
      .pipe(
        setData,
        tap((x) => {
          const clearData = !x.length || x.length > 1;
          const autoValue = clearData ? '' : x[0].value;
          this._internal_control.setValue(autoValue);
        })
      )
      .subscribe();
  }
}
