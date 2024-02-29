import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpParams, HttpHeaders} from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthGuard } from '../../services/auth.guard';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import {chPassword} from '../../model/chPassword';
import * as CryptoJS from 'crypto-js';
import {constInput} from '../../enum/constInput';
// import * as SafeJsonStringify from 'safe-json-stringify';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  submitted: boolean = false;
  svrErr: string; passErr:string; successMsg:string;
  passwordForm: FormGroup;
  public changePass:chPassword;
  
  constructor(private formBuilder: FormBuilder, private router: Router,
    private apiService: ApiService, private authService: AuthService,
    private toastr: ToastrService ) { }

  ngOnInit() {
    this.passwordForm = this.formBuilder.group({
      oldpassword: ['', Validators.required],
      newpassword: ['', Validators.required],
      cfmpassword: ['', Validators.required]
    });
    this.successMsg="";
    this.svrErr="";
    this.passErr="";
  }

  onSubmit() {
    this.submitted = true;    
    let oldPass=""; let newPass="";let cfmPass="";
   
    oldPass=this.passwordForm.get('oldpassword').value;
    newPass=this.passwordForm.get('newpassword').value;
    cfmPass=this.passwordForm.get('cfmpassword').value;
    //console.log("Before save:"+this.changePass.oldPassword+"New"+this.changePass.newPassword+"confirm"+cfmPass);
    if(oldPass.trim()==='' || newPass.trim()==='' || cfmPass.trim()==='' ||
    oldPass==="" || newPass==="" || cfmPass===""){
      this.svrErr= "Password should not be empty."; this.passErr=""
      return;
    }else if(newPass!=cfmPass){ 
      this.passErr="Passwords do not match.";this.svrErr="";
      return;
    }else{
      const body = new HttpParams()
      .set('oldPassword', CryptoJS.AES.encrypt(oldPass, constInput.passencrypt))
      .set('newPassword', CryptoJS.AES.encrypt(newPass, constInput.passencrypt));
     // console.log(body.toString());
      
      //console.log(CircularJSON.stringify(this.changePass)+"oldPassword:"+  this.changePass.oldPassword + "newPassword:" +  this.changePass.newPassword);
      this.apiService.passwordReset('changepassword?',body.toString()).subscribe(data =>{
        //console.log("Ater saved:"+JSON.stringify(data));
        if(JSON.stringify(data)===null|| data===undefined || data=="" || JSON.stringify(data)==='null'){
          this.svrErr = 'Invalid old Password';
          //this.passwordForm.reset();
          //this.resetForm();
        }else {
          this.toastr.success('Successfully changed');
          this.successMsg="Your password has been successfully changed!"; 
          this.passwordForm.reset();
          this.resetForm();
        }
   
      }, error => {
        console.log('err'+ error+"error:"+JSON.stringify(error))
        if(error && error.status == 400){
          this.svrErr = 'Bad Request!Please check your code.';
        }else{
          this.toastr.error('Server Connect Error'); 
        }
      });
    }
     
  }

  resetForm(){
    this.passwordForm.setValue(
      {
        'oldpassword': '',
        'newpassword' : '',
        'cfmpassword': '',

      });
      this.svrErr="";
      this.passErr="";
    }
  

}
