import { Injectable } from '@angular/core';
import { GridLayoutService } from './grid-layout.service';
import { FormControlConfig } from '../models';
import { NgxMaskConfig } from '../models/ngx-mask-config.model';

@Injectable()
export class FormConfigInitService {
  private maskDefaultSpecialCharacters: string[] = [
    '-',
    '/',
    '(',
    ')',
    '.',
    ':',
    ' ',
    '+',
    ',',
    '@',
    '[',
    ']',
    '"',
    "'",
  ];

  private maskDefaultPatterns: NgxMaskConfig['patterns'] = {
    '0': {
      pattern: new RegExp('\\d'),
    },
    '9': {
      pattern: new RegExp('\\d'),
      optional: true,
    },
    X: {
      pattern: new RegExp('\\d'),
      symbol: '*',
    },
    A: {
      pattern: new RegExp('[a-zA-Z0-9]'),
    },
    S: {
      pattern: new RegExp('[a-zA-Z]'),
    },
    U: {
      pattern: new RegExp('[A-Z]'),
    },
    L: {
      pattern: new RegExp('[a-z]'),
    },
    d: {
      pattern: new RegExp('\\d'),
    },
    m: {
      pattern: new RegExp('\\d'),
    },
    M: {
      pattern: new RegExp('\\d'),
    },
    H: {
      pattern: new RegExp('\\d'),
    },
    h: {
      pattern: new RegExp('\\d'),
    },
    s: {
      pattern: new RegExp('\\d'),
    },
  };

  constructor(private gridLayoutService: GridLayoutService) {}

  init(config: FormControlConfig[]): void {
    this.gridLayoutService.setGridColumn(config);
    this.initNgxMaskPatterns(config);
  }

  private initNgxMaskPatterns(config: FormControlConfig[]): void {
    for (const item of config) {
      const specialCharacters = item?.ngxMaskConfig?.specialCharacters;
      const patterns = item?.ngxMaskConfig?.patterns;
      const patternsMapped = !patterns
        ? null
        : Object.keys(patterns).reduce((obj, key) => {
            // Type can be string if config is come from parsed JSON
            const patternRegex = patterns[key].pattern as RegExp | string;
            
            obj[key].pattern =
              typeof patternRegex === 'string'
                ? new RegExp(patternRegex)
                : patternRegex;

            return obj;
          }, patterns);

      // Default patterns and specialCharcters will be overwrite when pass in custom data.
      // So we must set the fallback value
      item.ngxMaskConfig = {
        ...item.ngxMaskConfig,
        specialCharacters:
          specialCharacters ?? this.maskDefaultSpecialCharacters,
        patterns: patternsMapped ?? this.maskDefaultPatterns,
      };

      if (!!item.children?.length) {
        this.initNgxMaskPatterns(item.children);
      }

      if (!!item.formArray && !!item.formArray.template) {
        this.initNgxMaskPatterns(item.formArray.template);
      }
    }
  }
}