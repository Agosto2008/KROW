import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

/**
 * Test de humo (Fase 8.3): la app debe poder crearse con sus piezas de
 * layout (navbar, outlet, footer y toast) sin providers extra.
 */
describe('App (humo)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('se crea sin errores', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza navbar, outlet, footer y toast', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-navbar')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
    expect(el.querySelector('app-toast')).toBeTruthy();
  });

  it('el footer enlaza a soporte y términos (Fase 8.1)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('app-footer');
    expect(footer).toBeTruthy();

    const enlaces = Array.from((footer as HTMLElement).querySelectorAll('a')).map(
      (a) => a.getAttribute('href') ?? a.getAttribute('ng-reflect-router-link') ?? ''
    );
    // los routerLink del footer se resuelven a href en runtime
    const texto = (footer as HTMLElement).textContent ?? '';
    expect(texto).toContain('Soporte y contacto');
    expect(texto).toContain('Términos y condiciones');
    expect(enlaces.length).toBeGreaterThan(0);
  });
});
