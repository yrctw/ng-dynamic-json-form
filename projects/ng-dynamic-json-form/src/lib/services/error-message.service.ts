import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidatorConfig } from '../models';
import { ValidatorAndConditionTypes } from '../enums/validator-and-condition-types.enum';

@Injectable()
export class ErrorMessageService {
  getErrorMessages(
    control: AbstractControl,
    validatorConfigs: ValidatorConfig[]
  ): string[] {
    const errors = control.errors;
    if (!errors) return [];

    const validationTypes = Object.values(ValidatorAndConditionTypes)
      .filter(
        (x) =>
          x !== ValidatorAndConditionTypes.CUSTOM &&
          x !== ValidatorAndConditionTypes.DISABLED
      )
      .map((x) => x.toLowerCase());

    return Object.keys(errors).reduce((acc, key) => {
      const targetConfig = validatorConfigs.find(
        (x) => x.name.toLowerCase() === key
      );

      const isCustomValidation = validationTypes.every((x) => x !== key);

      const messageRaw = isCustomValidation
        ? errors[key]
        : { [key]: errors[key] };

      const messageReplaced = targetConfig?.message?.replace(
        /{{value}}/g,
        control.value || ''
      );

      const messageGet = messageReplaced ?? messageRaw;

      const result =
        typeof messageGet === 'string'
          ? messageGet
          : JSON.stringify(messageGet);

      acc.push(result);
      return acc;
    }, [] as string[]);
  }
}
