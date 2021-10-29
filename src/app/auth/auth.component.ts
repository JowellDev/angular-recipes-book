import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  isLoggingMode: boolean = true;
  isLoading: boolean = false;
  error: string = null;
  authObservable: Observable<AuthResponseData>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSwitchMode() {
    this.isLoggingMode = !this.isLoggingMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const userData: { email: string; password: string } = {
      email: form.value.email,
      password: form.value.password,
    };

    this.isLoading = true;
    if (this.isLoggingMode) {
      this.authObservable = this.authService.signIn(
        userData
      ) as Observable<AuthResponseData>;
    } else {
      this.authObservable = this.authService.signUp(
        userData
      ) as Observable<AuthResponseData>;
    }

    this.authObservable.subscribe(
      (response) => {
        console.log(response);
        this.isLoading = false;
        this.router.navigate(['/recipes']);
      },
      (errorMessage) => {
        this.isLoading = false;
        this.error = errorMessage;
      }
    );

    form.reset();
  }

  closeError(): void {
    this.error = null;
  }
}
