import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../shared/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  API_KEY: string = environment.firebaseAPIkey;
  signUp_URL: string = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.API_KEY}`;
  signIn_URL: string = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.API_KEY}`;

  user = new BehaviorSubject<User>(null);
  tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  signUp(user: { email: string; password: string }) {
    const data: SignupData = {
      email: user.email,
      password: user.password,
      returnSecureToken: true,
    };

    return this.http.post<AuthResponseData>(this.signUp_URL, data).pipe(
      this.customCatchError(),
      tap((resData: AuthResponseData) => {
        const { email, localId, idToken, expiresIn } = resData;
        this.handleAuthentication(email, localId, idToken, +expiresIn);
      })
    );
  }

  signIn(user: { email: string; password: string }) {
    const data: SignupData = {
      email: user.email,
      password: user.password,
      returnSecureToken: true,
    };

    return this.http.post<AuthResponseData>(this.signIn_URL, data).pipe(
      this.customCatchError(),
      tap((resData: AuthResponseData) => {
        const { email, localId, idToken, expiresIn } = resData;
        this.handleAuthentication(email, localId, idToken, +expiresIn);
      })
    );
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const { email, id, _token, _tokenExpirationDate } = userData;

    const loadedUser = new User(
      email,
      id,
      _token,
      new Date(_tokenExpirationDate)
    );

    if (loadedUser.token) {
      const expireIn =
        new Date(_tokenExpirationDate).getTime() - new Date().getTime();
      this.user.next(loadedUser);
      this.autoLogout(expireIn);
    }
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);
    if (this.tokenExpirationTimer) {
      clearInterval(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expireIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expireIn * 1000);
    const user: User = new User(email, userId, token, expirationDate);

    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
    this.autoLogout(expireIn * 1000);
  }

  customCatchError() {
    return catchError((errorRes) => {
      let errorMessage = 'sorry ! An error occurred, please again !';

      if (!errorRes.error || !errorRes.error.error) throwError(errorMessage);

      errorMessage = this.setErrorMessage(errorRes);

      return throwError(errorMessage);
    });
  }

  setErrorMessage(errorResponse: HttpErrorResponse) {
    let errorMessage = '';
    switch (errorResponse.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage =
          'The email address is already in use by another account.';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage =
          'There is no user record corresponding to this identifier. The user may have been deleted.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage =
          'The password is invalid or the user does not have a password.';
        break;
      case 'USER_DISABLED':
        errorMessage =
          'The user account has been disabled by an administrator.';
        break;
      default:
        errorMessage = 'Sorry! An error occurred, please try again !';
        break;
    }

    return errorMessage;
  }
}

interface SignupData {
  email: string;
  password: string;
  returnSecureToken: boolean;
}

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
