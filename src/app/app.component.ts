import { Component, OnInit } from '@angular/core';
import { Route } from '@angular/router';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'recipes book';

  constructor(private authService: AuthService) {}

  calculateScrollPercent(element: any): number {
    const { scrollTop, scrollHeight, clientHeight } = element;
    return (scrollTop / (scrollHeight - clientHeight)) * 100;
  }

  ngOnInit() {
    this.authService.autoLogin();

    const progressBar: HTMLElement | any =
      document.querySelector('#progress-bar');

    const scroll$ = fromEvent(document, 'scroll');
    const progress$ = scroll$.pipe(
      map(({ target }) =>
        this.calculateScrollPercent((target as Document).documentElement)
      )
    );

    progress$.subscribe((percent) => {
      progressBar.style.width = `${percent}%`;
    });
  }
}
