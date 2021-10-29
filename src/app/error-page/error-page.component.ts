import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {
  errMessage: string;
  constructor(private routes: ActivatedRoute) {}

  ngOnInit(): void {
    this.routes.data.subscribe((data: Data) => {
      this.errMessage = data['message'];
    });
  }
}
