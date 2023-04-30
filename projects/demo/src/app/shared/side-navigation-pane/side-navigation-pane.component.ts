import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  Subject,
  filter,
  fromEvent,
  map,
  merge,
  takeUntil,
  tap
} from 'rxjs';
import { ContentWrapperComponent } from '../content-wrapper/content-wrapper.component';
import { SideNavigationPaneService } from './side-navigation-pane.service';

@Component({
  selector: 'app-side-navigation-pane',
  standalone: true,
  imports: [CommonModule, ContentWrapperComponent],
  template: ` <ng-container *ngFor="let item of links$ | async; index as i">
    <a
      href="javascript:void(0)"
      [class.active]="activeIndex === i"
      (click)="scrollToTitle(i)"
      >{{ item }}</a
    >
  </ng-container>`,
  styleUrls: ['./side-navigation-pane.component.scss'],
})
export class SideNavigationPaneComponent {
  activeIndex = 0;

  links$ = this.sideNavigationPaneService.h2$.pipe(
    map((x) => x.map((x) => x.innerHTML)),
    tap((x) => {
      this.findActiveIndex();
      if (!x.length) this.renderer2.addClass(this.el.nativeElement, 'hidden');
      else this.renderer2.removeClass(this.el.nativeElement, 'hidden');
    })
  );

  scrolling = false;
  scrollingTimeout: number = 0;
  onRouteChange$ = new Subject();
  onDestroy$ = new Subject();

  constructor(
    private sideNavigationPaneService: SideNavigationPaneService,
    private el: ElementRef,
    private renderer2: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.onRouteChange();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  private onRouteChange(): void {
    this.router.events
      .pipe(
        filter((x) => x instanceof NavigationEnd),
        tap((x) => {
          this.onRouteChange$.next(null);
          this.sideNavigationPaneService.h2$.next([]);
          this.activeIndex = 0;
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  private findActiveIndex(): void {
    let lastScrollPosition = 0;

    const h2 = Array.from(document.querySelectorAll('markdown h2'));
    const rect = (input: Element) => input.getBoundingClientRect();

    fromEvent(document, 'scroll', { passive: true })
      .pipe(
        tap((x) => {
          if (this.scrolling) return;

          const activeTitles = h2.filter((x) => {
            return rect(x).top >= 0 && rect(x).bottom < window.innerHeight;
          });

          let activeTitle = null;

          if (activeTitles.length === 1) {
            activeTitle = activeTitles[0];
          }

          if (activeTitles.length > 1) {
            activeTitle = activeTitles.find(
              (x) => rect(x).y < window.innerHeight * 0.5
            );
          }

          if (!activeTitle) return;
          const scrollUp = window.scrollY < lastScrollPosition;
          this.activeIndex = h2.indexOf(activeTitle);

          if (scrollUp && rect(activeTitle).top > window.innerHeight * 0.85) {
            this.activeIndex -= 1;
          }

          lastScrollPosition = window.scrollY;
        }),
        takeUntil(merge(this.onDestroy$, this.onRouteChange$))
      )
      .subscribe();
  }

  scrollToTitle(index: number): void {
    const target = Array.from(document.querySelectorAll('markdown h2'))[index];
    const header = document.querySelector('.header');

    if (!target || !header) return;

    this.activeIndex = index;
    this.scrolling = true;

    this.renderer2.setStyle(
      target,
      'scroll-margin',
      `${header.clientHeight + 16}px`
    );
    target.scrollIntoView({
      behavior: 'smooth',
    });

    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = window.setTimeout(
      () => (this.scrolling = false),
      1000
    );
  }
}
