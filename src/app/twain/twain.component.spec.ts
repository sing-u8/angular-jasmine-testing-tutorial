import { fakeAsync, ComponentFixture, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { asyncData, asyncError } from '../../testing';

import { of, throwError } from 'rxjs';
import { last } from 'rxjs/operators';

import { TwainComponent } from './twain.component';
import { TwainService } from './twain.service';

describe('TwainComponent', () => {
  let component: TwainComponent;
  let fixture: ComponentFixture<TwainComponent>;
  let getQuoteSpy: jasmine.Spy;
  let quoteEl: HTMLElement;
  let testQuote: string;

  // Helper function to get the error message element value
  // An *ngIf keeps it out of the DOM until there is an error
  const errorMessage = () => {
    const el = fixture.nativeElement.querySelector('.error');
    return el ? el.textContent : null;
  };

  beforeEach(() => {
    testQuote = 'Test Quote';

    // `getQuote()` 스파이 메소드가 선언된 가짜 TwainService 객체를 정의합니다.
    const twainService = jasmine.createSpyObj('TwainService', ['getQuote']);
    // `getQuote()` 메소드는 테스트 데이터를 Observable 형태로 즉시 반환합니다.
    getQuoteSpy = twainService.getQuote.and.returnValue(of(testQuote));

    TestBed.configureTestingModule({
      declarations: [TwainComponent],
      providers: [{provide: TwainService, useValue: twainService}]
    });

    fixture = TestBed.createComponent(TwainComponent);
    component = fixture.componentInstance;
    quoteEl = fixture.nativeElement.querySelector('.twain');
  });

  describe('when test with synchronous observable', () => {
    it('should not show quote before OnInit', () => {
      expect(quoteEl.textContent).toBe('', 'nothing displayed');
      expect(errorMessage()).toBeNull('should not show error element');
      expect(getQuoteSpy.calls.any()).toBe(false, 'getQuote not yet called');
    });

    // The quote would not be immediately available if the service were truly async.
    it('should show quote after component initialized', () => {
      fixture.detectChanges();  // onInit()

      // 스파이 메소드가 반환한 결과는 컴포넌트가 초기화된 이후에 바로 표시됩니다.
      expect(quoteEl.textContent).toBe(testQuote);
      expect(getQuoteSpy.calls.any()).toBe(true, 'getQuote called');
    });


    // The error would not be immediately available if the service were truly async.
    // Use `fakeAsync` because the component error calls `setTimeout`
    it('should display error when TwainService fails', fakeAsync(() => {
         // 스파이 메소드가 에러를 Observable 타입으로 반환합니다.
         getQuoteSpy.and.returnValue(throwError('TwainService test failure'));

         fixture.detectChanges();  // onInit()
         // 스파이가 보내는 에러는 init이 실행된 직후에 받습니다.

         tick();  // 컴포넌트가 실행한 setTimeout()을 끝냅니다.

         fixture.detectChanges();  // setTimeout() 안에서 변경한 errorMessage를 반영합니다.

         expect(errorMessage()).toMatch(/test failure/, 'should display error');
         expect(quoteEl.textContent).toBe('...', 'should show placeholder');
       }));
  });

  describe('when test with asynchronous observable', () => {
    beforeEach(() => {
      // `asyncData()` 헬퍼 함수를 사용해서 옵저버블을 비동기로 처리합니다.
      getQuoteSpy.and.returnValue(asyncData(testQuote));
    });

    it('should not show quote before OnInit', () => {
      expect(quoteEl.textContent).toBe('', 'nothing displayed');
      expect(errorMessage()).toBeNull('should not show error element');
      expect(getQuoteSpy.calls.any()).toBe(false, 'getQuote not yet called');
    });

    it('should still not show quote after component initialized', () => {
      fixture.detectChanges();
      // getQuote service is async => still has not returned with quote
      // so should show the start value, '...'
      expect(quoteEl.textContent).toBe('...', 'should show placeholder');
      expect(errorMessage()).toBeNull('should not show error');
      expect(getQuoteSpy.calls.any()).toBe(true, 'getQuote called');
    });

    it('should show quote after getQuote (fakeAsync)', fakeAsync(() => {
         fixture.detectChanges();  // ngOnInit()
         expect(quoteEl.textContent).toBe('...', 'should show placeholder');

         tick();                   // 옵저버블을 실행합니다.
         fixture.detectChanges();  // 화면을 갱신합니다.

         expect(quoteEl.textContent).toBe(testQuote, 'should show quote');
         expect(errorMessage()).toBeNull('should not show error');
       }));

    it('should show quote after getQuote (waitForAsync)', waitForAsync(() => {
         fixture.detectChanges();  // ngOnInit()
         expect(quoteEl.textContent).toBe('...', 'should show placeholder');

         fixture.whenStable().then(() => {  // 비동기 getQuote를 기다립니다.
           fixture.detectChanges();         // 화면을 갱신합니다.
           expect(quoteEl.textContent).toBe(testQuote);
           expect(errorMessage()).toBeNull('should not show error');
         });
       }));


    it('should show last quote (quote done)', (done: DoneFn) => {
      fixture.detectChanges();

      component.quote.pipe(last()).subscribe(() => {
        fixture.detectChanges();  // 화면을 갱신합니다.
        expect(quoteEl.textContent).toBe(testQuote);
        expect(errorMessage()).toBeNull('should not show error');
        done();
      });
    });

    it('should show quote after getQuote (spy done)', (done: DoneFn) => {
      fixture.detectChanges();

      // 컴포넌트가 받는 문자열은 스파이가 마지막으로 실행되었을 때 반환하는 값으로 참조할 수도 있습니다.
      getQuoteSpy.calls.mostRecent().returnValue.subscribe(() => {
        fixture.detectChanges();  // 화면을 갱신합니다.
        expect(quoteEl.textContent).toBe(testQuote);
        expect(errorMessage()).toBeNull('should not show error');
        done();
      });
    });

    it('should display error when TwainService fails', fakeAsync(() => {
         // tell spy to return an async error observable
         getQuoteSpy.and.returnValue(asyncError<string>('TwainService test failure'));

         fixture.detectChanges();
         tick();                   // component shows error after a setTimeout()
         fixture.detectChanges();  // update error message

         expect(errorMessage()).toMatch(/test failure/, 'should display error');
         expect(quoteEl.textContent).toBe('...', 'should show placeholder');
       }));
  });
});


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/