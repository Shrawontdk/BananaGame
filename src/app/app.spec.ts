import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Auth } from './services/auth';
describe('App', () => {
  it('shows the Banana GP login before authentication', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: { currentUser: signal(null), isLoading: signal(false) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Banana GP');
    expect(fixture.nativeElement.querySelector('app-race-track')).toBeNull();
  });
});
