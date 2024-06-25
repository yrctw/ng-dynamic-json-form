import { FormControlConfig } from 'ng-dynamic-json-form';

export const CONFIG_BASIC_DATE_EN: FormControlConfig = {
  label: 'Date',
  formControlName: 'date',
  type: 'date',
  props: {
    appendTo: 'body',
    min: new Date(),
    minDate: new Date(),
    showTime: true,
    showIcon: true,
  },
};
