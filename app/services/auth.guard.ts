import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 
  constructor(private router: Router) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = (JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? false : true);
        if (currentUser) {
            return true;
        }
        this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
        return false;
    }
  
}
