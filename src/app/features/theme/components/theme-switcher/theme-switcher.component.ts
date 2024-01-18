import { CommonModule } from '@angular/common';
import { Component, Renderer2, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, skip, takeUntil, tap } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-switcher.component.html',
  styles: [],
})
export class ThemeSwitcherComponent {
  private _renderer2 = inject(Renderer2);
  private _themeService = inject(ThemeService);
  private readonly _onDestroy$ = new Subject<void>();

  themes = this._themeService.themes;
  currentTheme =
    this.themes.find((x) => x.key === this._themeService.savedTheme) ||
    this.themes[0];

  ngOnInit(): void {
    this.switchTheme(this.currentTheme.key as 'light' | 'dark');
    this._themeService
      .prefersDark$()
      .pipe(
        skip(1),
        tap((x) => this.switchTheme(x ? 'dark' : 'light')),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

  switchTheme(theme?: 'light' | 'dark'): void {
    const html = document.querySelector('html');
    const nextTheme = this.themes.find((x) => {
      if (theme) return x.key === theme;
      return x.key !== this.currentTheme.key;
    });

    if (!nextTheme) return;

    this.currentTheme = nextTheme;
    this._renderer2.setAttribute(html, 'class', nextTheme.key);
    this._themeService.theme$.next(nextTheme.key);
    this._themeService.savedTheme = nextTheme.key;
  }
}
