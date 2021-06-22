import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { UserService } from '../model/user.service';
import { WelcomeComponent } from './welcome.component';

class MockUserService {
  isLoggedIn = true;
  user = { name: 'Test User'};
}

describe('WelcomeComponent (class only)', () => {
  let comp: WelcomeComponent;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // 테스트할 컴포넌트와 의존성으로 주입될 서비스를 프로바이더에 등록합니다.
      providers: [
        WelcomeComponent,
        { provide: UserService, useClass: MockUserService }
      ]
    });
    // TestBed를 사용해서 컴포넌트 인스턴스와 서비스 인스턴스를 참조합니다.
    comp = TestBed.inject(WelcomeComponent);
    userService = TestBed.inject(UserService);
  });

  it('should not have welcome message after construction', () => {
    expect(comp.welcome).toBe('');
  });

  it('should welcome logged in user after Angular calls ngOnInit', () => {
    comp.ngOnInit();
    expect(comp.welcome).toContain(userService.user.name);
  });

  it('should ask user to log in if not logged in after ngOnInit', () => {
    userService.isLoggedIn = false;
    comp.ngOnInit();
    expect(comp.welcome).not.toContain(userService.user.name);
    expect(comp.welcome).toContain('log in');
  });
});

describe('WelcomeComponent', () => {

  let comp: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let componentUserService: UserService; // the actually injected service
  let userService: UserService; // the TestBed injected service
  let el: HTMLElement; // the DOM element with the welcome message

  let userServiceStub: Partial<UserService>;

  beforeEach(() => {
    // 테스트하기 위해 만든 목 UserService
    userServiceStub = {
      isLoggedIn: true,
      user: { name: 'Test User' },
    };

    TestBed.configureTestingModule({
       declarations: [ WelcomeComponent ],
    // providers: [ UserService ],  // NO! 프로바이더에 실제 서비스 클래스를 등록하면 안됩니다!
                                    // 목 서비스를 등록하세요.
       providers: [ { provide: UserService, useValue: userServiceStub } ],
    });

    fixture = TestBed.createComponent(WelcomeComponent);
    comp    = fixture.componentInstance;

    // 컴포넌트에 주입된 UserService를 가져옵니다.
    userService = fixture.debugElement.injector.get(UserService);
    componentUserService = userService;
    // 최상위 인젝터에서 UserService를 가져옵니다.
    userService = TestBed.inject(UserService);

    // 클래스 이름으로 CSS 셀렉터를 사용해서 "welcome" 엘리먼트를 가져옵니다.
    el = fixture.nativeElement.querySelector('.welcome');
  });

  it('should welcome the user', () => {
    fixture.detectChanges();
    const content = el.textContent;
    expect(content).toContain('Welcome', '"Welcome ..."');
    expect(content).toContain('Test User', 'expected name');
  });

  it('should welcome "Bubba"', () => {
    userService.user.name = 'Bubba'; // 환영 메시지는 아직 표시되지 않습니다.
    fixture.detectChanges();
    expect(el.textContent).toContain('Bubba');
  });

  it('should request login if not logged in', () => {
    userService.isLoggedIn = false; // 환영 메시지는 아직 표시되지 않습니다.
    fixture.detectChanges();
    const content = el.textContent;
    expect(content).not.toContain('Welcome', 'not welcomed');
    expect(content).toMatch(/log in/i, '"log in"');
  });

  it('should inject the component\'s UserService instance',
    inject([UserService], (service: UserService) => {
    expect(service).toBe(componentUserService);
  }));

  it('TestBed and Component UserService should be the same', () => {
    expect(userService === componentUserService).toBe(true);
  });
});


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/