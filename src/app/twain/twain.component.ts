import { Component, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

import { TwainService } from './twain.service';

@Component({
  selector: 'twain-quote',
  template: `
    <p class="twain"><i>{{quote | async}}</i></p>
    <button (click)="getQuote()">Next quote</button>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>`,
  styles: [
    `.twain { font-style: italic; } .error { color: red; }`
  ]

})
export class TwainComponent implements OnInit {
  errorMessage!: string;
  quote!: Observable<string>;

  constructor(private twainService: TwainService) {}

  ngOnInit(): void {
    this.getQuote();
  }

  getQuote() {
    this.errorMessage = '';
    this.quote = this.twainService.getQuote().pipe(
      startWith('...'),
      catchError( (err: any) => {
        // 이번 싸이클에서 errorMessage가 한 번 할당되었기 때문에 한 싸이클 기다립니다.
        setTimeout(() => this.errorMessage = err.message || err.toString());
        return of('...'); // quote 프로퍼티의 값을 '...'로 재설정합니다.
      })
    );
  }

}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/