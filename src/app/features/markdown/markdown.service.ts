import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import hljs from 'highlight.js';
import { Marked, RendererObject } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { markedHighlight } from 'marked-highlight';
import { VersionService } from '../version/version.service';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  private _router = inject(Router);
  private _versionService = inject(VersionService);
  private _domSanitizer = inject(DomSanitizer);
  private _marked = new Marked(
    gfmHeadingId(),
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
    })
  );

  parse(val: string): SafeHtml {
    const version = this._versionService.currentVersion;
    const renderer: RendererObject = {
      link: this._linkRendererFn('', {
        searchValue: version,
        replaceValue: 'docs',
      }),
      code: this._codeRendererFn,
    };

    this._marked.use({ renderer: renderer as any });
    const result = this._marked.parse(val, {
      async: false,
      gfm: true,
    }) as string;

    return this._domSanitizer.bypassSecurityTrustHtml(result);
  }

  private _codeRendererFn(
    code: string,
    infoString: string | undefined,
    escaped: boolean
  ): string {
    const attributes = infoString?.match(/(\w|-)+=("[^"]+")/g);
    const lang = infoString?.split(/\s+/)[0];
    const name = attributes
      ?.find((x) => x.indexOf('name=') > -1)
      ?.split('name=')[1];

    const container = `
      <pre name=${name ?? ''}>
        <code class="hljs language-${lang}">
          {{content}}
        </code>
      </pre>
    `.replace(/\s{2,}/g, '');

    return container.replace('{{content}}', code);
  }

  private _linkRendererFn(
    routePrefix: string,
    replaceHref?: { searchValue: string | RegExp; replaceValue: string }
  ) {
    return (href: string, title: string | null | undefined, text: string) => {
      const prefix = href?.match(/(\.*\/){1,}/)?.[0] || '';
      const useRouter = !!prefix && href?.startsWith(prefix);
      const routeClean = this._router.url.split('?')[0].split('#')[0];

      // Anchor
      if (href?.startsWith('#')) {
        return `<a title="${title || text}" [routerLink]
          href="${routeClean}${href}">${text}</a>`;
      }

      // External link
      if (!useRouter) {
        return `<a target="_blank" rel="noreferrer noopener"
          title="${title || text}" href="${href}">${text}</a>`;
      }

      const _href = href
        ?.substring(prefix.length)
        .replace(
          replaceHref?.searchValue || '',
          replaceHref?.replaceValue || ''
        );

      const newHref = routePrefix ? `/${routePrefix}/${_href}` : _href;

      return `<a title="${title || text}" [routerLink]
        href="${newHref}">${text}</a>`;
    };
  }
}
