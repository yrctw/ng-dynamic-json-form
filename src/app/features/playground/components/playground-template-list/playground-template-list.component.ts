import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, combineLatest, debounceTime, map, share, tap } from 'rxjs';
import { LanguageDataService } from 'src/app/features/language/language-data.service';
import { PlaygroundConfigItem } from '../../interfaces/playground-config-item.interface';
import { PlaygroundEditorDataService } from '../../services/playground-editor-data.service';
import { PlaygroundTemplateDataService } from '../../services/playground-template-data.service';
import { VersionService } from 'src/app/features/version/version.service';

@Component({
  selector: 'app-playground-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './playground-template-list.component.html',
  styleUrls: ['./playground-template-list.component.scss'],
})
export class PlaygroundTemplateListComponent {
  private _langService = inject(LanguageDataService);
  private _templateDataService = inject(PlaygroundTemplateDataService);
  private _versionService = inject(VersionService);
  private _editorDataService = inject(PlaygroundEditorDataService);

  @Output() onEdit = new EventEmitter<boolean>();

  nameControl = new FormControl('');
  isEditing = false;
  currentVersion = this._versionService.docVersion;
  showTemplateNameInput = false;

  // When rendering in server side, the items are not wrapped inside
  // this component, don't know the reason yet, so rendering it only
  // on browser.
  list$ =
    typeof window !== 'undefined'
      ? combineLatest([
          this._templateDataService.exampleList$,
          this._templateDataService.userTemplateList$,
        ]).pipe(
          debounceTime(0),
          map(([examples, userTemplates]) => [...examples, ...userTemplates]),
          share()
        )
      : EMPTY;

  currentTemplateKey$ = this._templateDataService.currentTemplateKey$;
  currentTemplate$ = combineLatest([this.list$, this.currentTemplateKey$]).pipe(
    debounceTime(0),
    map(([list, key]) => list.find((x) => x.key === key))
  );
  i18nContent$ = this._langService.i18nContent$;

  select(key: string): void {
    if (key === this.currentTemplateKey$.value) return;

    this._editorDataService.configModifiedData = undefined;
    this.currentTemplateKey$.next(key);
    this.setEditStatus(false);
  }

  save(key: string, isUserTemplate: boolean): void {
    if (!key) return;

    const editorData = this._editorDataService.configModifiedData;

    if (editorData !== undefined) {
      this._editorDataService.configModifiedData = undefined;

      isUserTemplate
        ? this._templateDataService.setUserTemplate(key, editorData)
        : this._templateDataService.setExampleTemplate(key, editorData);

      this.currentTemplateKey$.next(key);
    }

    this.setEditStatus(false);
  }

  reset(key: string): void {
    if (!key) return;

    const defaultData = this._templateDataService.fallbackExample;
    this._templateDataService.setExampleTemplate(key, defaultData);
    this._editorDataService.configModifiedData = defaultData;
    this._templateDataService.currentTemplateKey$.next(key);
  }

  remove(key: string): void {
    if (!key) return;

    this._templateDataService.setUserTemplate(key, null);
    this.setEditStatus(false);
    this._selectLastTemplate();
  }

  newTemplate(): void {
    const key = this.nameControl.value?.trim();
    const keyExists = this._templateDataService.allTemplateKeys.includes(
      key ?? ''
    );

    if (!key || keyExists) return;

    this._templateDataService.setUserTemplate(key, []);
    this.nameControl.setValue('');
    this.currentTemplateKey$.next(key);
    this.toggleTemplateNameInput(false);
    this.setEditStatus(true);
  }

  cancelNewTemplate(): void {
    this.nameControl.setValue('');
  }

  toggleTemplateNameInput(value: boolean): void {
    this.showTemplateNameInput = value;
  }

  setEditStatus(value: boolean): void {
    this.isEditing = value;
    this.onEdit.emit(this.isEditing);

    // if (this.isEditing) {
    //   this._editorDataService.configModifiedData =
    //     this._currentTemplate?.config;
    // }
  }

  private _selectLastTemplate(): void {
    if (typeof window === 'undefined') return;

    const templateKeys = this._templateDataService.allTemplateKeys;

    window.setTimeout(() => {
      this.currentTemplateKey$.next(templateKeys[templateKeys.length - 1]);
    });
  }
}
