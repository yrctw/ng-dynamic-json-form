import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  Validators,
  isFormArray,
  isFormControl,
  isFormGroup
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  NgDynamicJsonFormControlCondition,
  NgDynamicJsonFormControlConfig,
} from '../models';
import { NgDynamicJsonFormConditionExtracted } from '../models/condition-extracted.model';
import { clearEmpties } from '../utils/clear-empties';

@Injectable({
  providedIn: 'root',
})
export class FormStatusService {
  reset$ = new Subject();

  updateFormErrors(form: FormGroup): void {
    const getErrors = (input: AbstractControl) => {
      let errors = null;

      if (isFormControl(input)) {
        errors = input.errors;
      }

      if (isFormGroup(input)) {
        errors = Object.keys(input.controls).reduce((acc, key) => {
          const formControlErrors = getErrors(input.controls[key]);

          if (!!formControlErrors) {
            acc = {
              ...acc,
              [key]: formControlErrors,
            };
          }

          return acc;
        }, {});
      }

      if (isFormArray(input)) {
        const parentErrors = input.errors;
        const childrenErrors: any = input.controls.map(x => getErrors(x))

        errors = {
          ...parentErrors,
          ...childrenErrors,
        };
      }

      return errors ? JSON.parse(JSON.stringify(errors)) : null;
    };

    const errors = clearEmpties(getErrors(form));
    form.setErrors(!Object.keys(errors).length ? null : errors);
  }

  updateControlStatus(
    form: FormGroup,
    control: AbstractControl | null,
    controlPath: string,
    conditions: NgDynamicJsonFormControlCondition[]
  ): void {
    if (!conditions.length) return;

    const conditionsFiltered = (type: 'hidden' | 'disabled' | 'required') =>
      conditions.filter((x) => x.name === type);

    const result = (type: 'hidden' | 'disabled' | 'required') =>
      this.getConditionResult(form, conditionsFiltered(type));

    const controlRequired = result('required');
    const disableControl = result('disabled');
    const hideControl = result('hidden');
    const getElement$ = new Promise<HTMLElement | null>((resolve, reject) => {
      requestAnimationFrame(() => {
        const element = document.querySelector(
          `ng-dynamic-json-form grid-item-wrapper#${controlPath.replace(
            '.',
            '\\.'
          )}`
        ) as HTMLElement | null;

        resolve(element);
      });
    });

    if (!control) return;

    if (controlRequired !== undefined) {
      if (controlRequired) control.addValidators(Validators.required);
      else control.removeValidators(Validators.required);
    }

    if (disableControl !== undefined) {
      if (disableControl) control.disable();
      else control.enable();
    }

    if (hideControl !== undefined) {
      if (hideControl) {
        getElement$.then((x) => x?.setAttribute('style', 'display:none'));
        control.disable();
      } else {
        getElement$.then((x) => x?.setAttribute('style', 'display:block'));
        control.enable();
      }
    }

    control.updateValueAndValidity();
  }

  extractConditions(
    input: NgDynamicJsonFormControlConfig[],
    parentControlName?: string,
    path?: NgDynamicJsonFormConditionExtracted[]
  ): NgDynamicJsonFormConditionExtracted[] {
    if (path === undefined) {
      path = [];
    }

    const result = input.reduce((acc, curr) => {
      if (!curr.children?.length && !!curr.conditions?.length) {
        acc.push({
          targetControlPath: parentControlName
            ? `${parentControlName}.${curr.formControlName}`
            : curr.formControlName,
          conditions: curr.conditions,
        });
      }

      if (!!curr.children?.length && !curr.conditions?.length) {
        return this.extractConditions(curr.children, curr.formControlName, acc);
      }

      return acc;
    }, [] as any[]);

    path.push(...result);
    return path;
  }

  private getConditionResult(
    form: FormGroup,
    conditions: NgDynamicJsonFormControlCondition[]
  ): boolean | undefined {
    if (!conditions.length) return undefined;

    const chainCondition = (
      input: NgDynamicJsonFormControlCondition
    ): boolean => {
      if (!input.group?.length) return false;

      const group = input.group;
      const parentResult = this.booleanEvaluation(form, input);

      return group.reduce((acc, curr) => {
        if (!!curr.group?.length) {
          return chainCondition(curr);
        }

        const result = this.booleanEvaluation(form, curr);
        switch (input.groupBooleanOperator) {
          case 'AND':
            return acc && result;

          case 'OR':
            return acc || result;
        }

        return acc;
      }, parentResult);
    };

    // Only single condition and no group condition under it
    if (conditions.length === 1 && !conditions[0].group?.length) {
      const config = conditions[0];
      return this.booleanEvaluation(form, config);
    }

    return conditions.reduce((acc, curr) => {
      const result = !!curr.group?.length
        ? chainCondition(curr)
        : this.booleanEvaluation(form, curr);

      return acc || result;
    }, false);
  }

  private booleanEvaluation(
    form: FormGroup,
    data: NgDynamicJsonFormControlCondition
  ): boolean {
    const left = form.get(data.control)?.value;
    const right = data.controlValue;

    switch (data.operator) {
      case '===':
        return left === right;

      case '!==':
        return left !== right;

      case '>=':
        return left >= right;

      case '>':
        return left > right;

      case '<=':
        return left <= right;

      case '<':
        return left < right;
    }
  }
}
