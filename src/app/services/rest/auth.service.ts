/// <reference path="../../../../typings/index.d.ts"/>

// Imports
import {AppConfig} from '../../config/app.config';
import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {IAuthRequest, IAuthResponse} from '../../interfaces/auth.interface';
import {CookieService} from 'angular2-cookie/core';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {
  private xosToken:string;
  private xosSessionId:string;
  // Resolve HTTP using the constructor
  constructor (private http: Http, private cookieService:CookieService) {
  }

  // check if the user is authenticated
  isAuthenticated(){
    this.xosToken = this.cookieService.get('xoscsrftoken');
    this.xosSessionId = this.cookieService.get('xossessionid');
    return this.xosToken;
  }

  // save cookies
  storeAuth(auth:IAuthResponse){
    this.cookieService.put('xoscsrftoken', auth.xoscsrftoken);
    this.cookieService.put('xossessionid', auth.xossessionid);
  }

  // Log the user in
  login(auth: IAuthRequest) : Observable<IAuthResponse> {
    return this.http.post(`${AppConfig.apiEndpoint}/utility/login/`, auth)
      .map((res:Response) => res.json())
      .map((auth:IAuthResponse) => {
        this.storeAuth(auth);
        auth.user = JSON.parse(auth.user);
        return auth;
      })
      .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
  }
}
