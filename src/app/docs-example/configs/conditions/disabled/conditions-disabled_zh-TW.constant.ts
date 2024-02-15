import { FormControlConfig } from 'ng-dynamic-json-form';

export const CONDITIONS_DISABLED_ZHTW: FormControlConfig[] = [
  {
    formControlName: 'checkbox',
    type: 'checkbox',
    value: true,
    options: {
      data: [{ label: '取消勾選，禁用以下輸入欄位' }],
    },
  },
  {
    formControlName: 'text',
    conditions: {
      disabled: {
        '&&': [['checkbox', '===', false]],
      },
    },
  },
];
