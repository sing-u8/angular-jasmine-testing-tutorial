
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

import { addMatchers, click } from '../../testing';
import { Hero } from '../model/hero';

import { DashboardHeroComponent } from './dashboard-hero.component';

beforeEach(addMatchers);

describe('DashboardHeroComponent class only', () => {
  it('raises the selected event when clicked', () => {
    const comp = new DashboardHeroComponent();
    const hero: Hero = {id: 42, name: 'Test'};
    comp.hero = hero;

    comp.selected.pipe(first()).subscribe((selectedHero: Hero) => expect(selectedHero).toBe(hero));
    comp.click();
  });
});

describe('DashboardHeroComponent when tested directly', () => {
  let comp: DashboardHeroComponent;
  let expectedHero: Hero;
  let fixture: ComponentFixture<DashboardHeroComponent>;
  let heroDe: DebugElement;
  let heroEl: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({declarations: [DashboardHeroComponent]})
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardHeroComponent);
    comp = fixture.componentInstance;

    // 컴포넌트의 DebugElement와 HTMLElement를 참조합니다.
    heroDe = fixture.debugElement.query(By.css('.hero'));
    heroEl = heroDe.nativeElement;

    // 컴포넌트에 사용할 히어로 정보를 선언합니다.
    expectedHero = {id: 42, name: 'Test Name'};

    // 부모 컴포넌트에서 입력 프로퍼티로 받는 과정을 처리합니다.
    comp.hero = expectedHero;

    // 초기 데이터 바인딩을 실행합니다.
    fixture.detectChanges();
  });

  it('should display hero name in uppercase', () => {
    const expectedPipedName = expectedHero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });

  it('should raise selected event when clicked (triggerEventHandler)', () => {
    let selectedHero: Hero | undefined;
    comp.selected.pipe(first()).subscribe((hero: Hero) => selectedHero = hero);

    heroDe.triggerEventHandler('click', null);
    expect(selectedHero).toBe(expectedHero);
  });

  it('should raise selected event when clicked (element.click)', () => {
    let selectedHero: Hero | undefined;
    comp.selected.pipe(first()).subscribe((hero: Hero) => selectedHero = hero);

    heroEl.click();
    expect(selectedHero).toBe(expectedHero);
  });

  it('should raise selected event when clicked (click helper with DebugElement)', () => {
    let selectedHero: Hero | undefined;
    comp.selected.pipe(first()).subscribe((hero: Hero) => selectedHero = hero);

    click(heroDe);  // DebugElement로 클릭 헬퍼를 실행합니다.

    expect(selectedHero).toBe(expectedHero);
  });

  it('should raise selected event when clicked (click helper with native element)', () => {
    let selectedHero: Hero | undefined;
    comp.selected.pipe(first()).subscribe((hero: Hero) => selectedHero = hero);

    click(heroEl);  // click helper with native element

    expect(selectedHero).toBe(expectedHero);
  });
});

//////////////////

describe('DashboardHeroComponent when inside a test host', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let heroEl: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed
        .configureTestingModule({declarations: [DashboardHeroComponent, TestHostComponent]})
        .compileComponents();
  }));

  beforeEach(() => {
    // DashboardHeroComponent 대신 TestHostComponent를 생성합니다.
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    heroEl = fixture.nativeElement.querySelector('.hero');
    fixture.detectChanges();  // 초기 데이터 바인딩을 실행합니다.
  });

  it('should display hero name', () => {
    const expectedPipedName = testHost.hero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });

  it('should raise selected event when clicked', () => {
    click(heroEl);
    // 선택된 히어로는 데이터 바인딩한 히어로와 같아야 합니다.
    expect(testHost.selectedHero).toBe(testHost.hero);
  });
});

////// Test Host Component //////
import { Component } from '@angular/core';

@Component({
  template: `
    <dashboard-hero
      [hero]="hero" (selected)="onSelected($event)">
    </dashboard-hero>`
})
class TestHostComponent {
  hero: Hero = {id: 42, name: 'Test Name'};
  selectedHero: Hero | undefined;
  onSelected(hero: Hero) {
    this.selectedHero = hero;
  }
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/