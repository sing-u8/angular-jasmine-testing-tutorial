import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RouterLinkDirectiveStub } from '../testing';

import { AppComponent } from './app.component';

@Component({selector: 'app-banner', template: ''})
class BannerStubComponent {
}

@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent {
}

@Component({selector: 'app-welcome', template: ''})
class WelcomeStubComponent {
}

let comp: AppComponent;
let fixture: ComponentFixture<AppComponent>;

describe('AppComponent & TestModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          declarations: [
            AppComponent, RouterLinkDirectiveStub, BannerStubComponent, RouterOutletStubComponent,
            WelcomeStubComponent
          ]
        })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));
  tests();
});

//////// Testing w/ NO_ERRORS_SCHEMA //////
describe('AppComponent & NO_ERRORS_SCHEMA', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({
          declarations: [
            AppComponent,
            BannerStubComponent,
            RouterLinkDirectiveStub
          ],
          schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));
  tests();
});

//////// Testing w/ real root module //////
// Tricky because we are disabling the router and its configuration
// Better to use RouterTestingModule
import { AppModule } from './app.module';
import { AppRoutingModule } from './app-routing.module';

describe('AppComponent & AppModule', () => {
  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({imports: [AppModule]})

        // Get rid of app's Router configuration otherwise many failures.
        // Doing so removes Router declarations; add the Router stubs
        .overrideModule(AppModule, {
          remove: {imports: [AppRoutingModule]},
          add: {declarations: [RouterLinkDirectiveStub, RouterOutletStubComponent]}
        })

        .compileComponents()

        .then(() => {
          fixture = TestBed.createComponent(AppComponent);
          comp = fixture.componentInstance;
        });
  }));

  tests();
});

function tests() {
  let routerLinks: RouterLinkDirectiveStub[];
  let linkDes: DebugElement[];

  beforeEach(() => {
    fixture.detectChanges(); // 초기 데이터 바인딩을 실행합니다.

    // RouterLinkStubDirective가 사용된 DebugElement를 쿼리합니다.
    linkDes = fixture.debugElement.queryAll(By.directive(RouterLinkDirectiveStub));

    // DebugElement의 인젝터를 사용해서 개별 디렉티브 인스턴스를 참조합니다.
    routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
  });

  it('can instantiate the component', () => {
    expect(comp).not.toBeNull();
  });

  it('can get RouterLinks from template', () => {
    expect(routerLinks.length).toBe(3, 'should have 3 routerLinks');
    expect(routerLinks[0].linkParams).toBe('/dashboard');
    expect(routerLinks[1].linkParams).toBe('/heroes');
    expect(routerLinks[2].linkParams).toBe('/about');
  });

  it('can click Heroes link in template', () => {
    const heroesLinkDe = linkDes[1];    // 히어로 목록으로 가는 링크를 표현하는 DebugElement
    const heroesLink = routerLinks[1];  // 히어로 목록으로 가는 링크와 연결된 디렉티브

    expect(heroesLink.navigatedTo).toBeNull('should not have navigated yet');

    heroesLinkDe.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(heroesLink.navigatedTo).toBe('/heroes');
  });
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/