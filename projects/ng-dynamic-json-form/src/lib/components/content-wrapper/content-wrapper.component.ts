import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ControlLayoutDirective } from '../../directives';
import { FormControlConfig } from '../../models';
import { FormLayout } from '../../models/form-layout.interface';
import { IsControlRequiredPipe } from '../../pipes/is-control-required.pipe';
import { GlobalVariableService } from '../../services/global-variable.service';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { FormTitleComponent } from '../form-title/form-title.component';

@Component({
  selector: 'content-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormTitleComponent,
    ErrorMessageComponent,
    ControlLayoutDirective,
    IsControlRequiredPipe,
  ],
  templateUrl: './content-wrapper.component.html',
  styles: [],
})
export class ContentWrapperComponent {
  private _globalVariableService = inject(GlobalVariableService);

  @Input() config?: FormControlConfig;
  @Input() control?: AbstractControl;
  @Input() collapsibleState?: FormLayout['contentCollapsible'];
  @Input() controlLayoutDisabled = false;

  labelComponents = this._globalVariableService.labelComponents;
  labelTemplates = this._globalVariableService.labelTemplates;
  layoutComponents = this._globalVariableService.layoutComponents;
  layoutTemplates = this._globalVariableService.layoutTemplates;
}
