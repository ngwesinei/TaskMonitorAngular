import { Component,Input, OnInit,ChangeDetectorRef,ViewChild, ElementRef,AfterViewInit,OnDestroy } from '@angular/core';
import { FormBuilder,FormControl,FormGroup, Validators } from '@angular/forms';
import { DatePipe,DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiService,DialogService } from '../../services';
import { interval, Observable, Subscription } from 'rxjs';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule }   from '@angular/forms';
import { AuthService } from "../../services/auth.service";


@Component({
  selector: 'app-mastertable',
  templateUrl: './mastertable.component.html',
  styleUrls: ['./mastertable.component.scss', '../../util/dialog/content/app.less', '../../util/dialog/content/model.less']
})
export class MastertableComponent implements OnInit {

  public taskList$:any = []; public tempList$:any=[];
  dtOptions: DataTables.Settings = {};
  enableEdit = false;
  enableEditIndex = null;
  addNewItemList: any = []; // for data merge

  constructor(private router: Router, private apiService: ApiService, 
    private formBuilder: FormBuilder,private authService : AuthService, 
    private toastr: ToastrService, private el: ElementRef, private dialogService: DialogService,
    ){ 

    }

  ngOnInit() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      order:[0, 'asc'],
    };
    this.loadAllData();
    
  }

  loadAllData(){
    this.taskList$ =null;
    this.apiService.getLOV('code/all').subscribe( data => {
      this.tempList$ =data;
      this.taskList$ = [];
      if(this.tempList$.length >0){      
        for (var i=0; i<this.tempList$.length; i++) {
          this.tempList$[i].sortData = (this.tempList$[i].internalId);
            this.taskList$.push(this.tempList$[i]); 
        }  
        
       
      }else {
        console.log("No Data List!");
    }  
      //console.log(" this.taskList$:"+JSON.stringify(this.taskList$));
    });
  }
  saveSegment(selectedData) {
    this.enableEditIndex = null; 
  }

  enableEditMethod(e, i, selectedData: any) {
    this.enableEdit = true;
    this.enableEditIndex = i;
    let updateFlag = false;
    selectedData.updateFlag = true;
  }

  checkAllList(event: any){
    let table:any = document.getElementById('task-tbl');
    this.taskList$.forEach(u =>{            
        for (var i = 1, row; row = table.rows[i]; i++) {
            if(row.cells[0].innerHTML == u.taskType){
                u.checkFlag = event.currentTarget.checked;
            }
        }            
    });
  }
  checkOnels(selectedData: any, event: any){
    selectedData.checkFlag = event.currentTarget.checked;
  }

  addNewValue(){
      let list = {
        "sortData" : "null",
        "internalId": null,
        "tableType": "",
        "tableName": "",
        "tableValue":"",
        "tableDESC": "",
        "application": "",
       
    }
    let tempList = this.taskList$;
    this.taskList$ = null;

    setTimeout(() => {
      this.taskList$ = [];    
      this.taskList$ = tempList;
      this.taskList$.push(list)
      this.enableEdit = true;
      this.enableEditIndex = this.taskList$.length-1;
    },200);

  }

  saveValue(){
    
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to save data?",
      confirmButtonText: 'Confirm',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
        let validFlag = true;
        let saveList = [];
        this.taskList$.forEach(e => {
          
          if(!e.tableType){
            this.toastr.error('Table Type is empty!'); 
            validFlag = false;
            return;
          }else if(e.err){
            this.toastr.error(e.err ); 
            validFlag = false;
            return;
          }else if(!e.internalId && !e.err && e.tableType ){ // for valid new data
              saveList.push(e);
          }else if(e.internalId && !e.err && e.updateFlag ) // for valid update data (check update flag)
              saveList.push(e);
        }); 

        if(saveList.length>0){
         // console.log("saveList:"+JSON.stringify(saveList)); 
          saveList.forEach(chkSt => {
            if(!chkSt.tableName){
              this.toastr.error('Table Name is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.tableValue){
              this.toastr.error('Table Value is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.application){
              this.toastr.error('Application Name is empty!'); 
              validFlag = false;
              return;
            }  
          });
        }

        if(validFlag){
          //console.log("saveList:"+JSON.stringify(saveList));
          this.apiService.PostApi('submitcode', saveList)
            .subscribe( data => {
              this.loadAllData();
              this.toastr.success('Successfully Saved!');
              this.enableEditIndex = null;
             // this.stpTime=false;
             // this.taskEnable=false;
          }, er => {
             this.toastr.error(er.error); 
          });   
        }

      }
    });
  }

  deleteValue(){
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to delete data?",
      confirmButtonText: 'Confirm',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
        let updateList = [];
        let addNewList = [];
        let deleteNewList = [];
        this.taskList$.forEach(e =>{
          if(e.checkFlag && e.internalId)
            updateList.push({"internalId":e.internalId});
          if(!e.internalId && !e.checkFlag)
            addNewList.push(e);
          if(!e.internalId && e.checkFlag)
            deleteNewList.push(e);
        });
        if(!updateList || updateList.length ==0 && deleteNewList.length == 0){
          this.toastr.error('Please select row(s) to delete');
          return;
        } 
        this.apiService.PostApi('deletecode', updateList)
            .subscribe( data => {
              this.reloadValueList(addNewList);
              this.toastr.success('Successfully Deleted!');              
        });       
      }
    });
  }

  deleteRow(e, i, selectedData: any){
    Swal.fire({
        title: "Confirmation!",text: "Are you sure to delete record?", confirmButtonText: 'Delete',
        showConfirmButton: true, showCancelButton: true     
    }).then((willSave) => {
        if(willSave.value){
          let deleteList = [];
          deleteList.push(selectedData);
            this.apiService.PostApi('deletecode', deleteList).subscribe( data => {  
                this.toastr.success('Successfully Deleted!') ;
                this.loadAllData();
            });
        }
    });
  }

  reloadValueList(addNewList) {
    this.taskList$ = null;
    this.addNewItemList = [];
    this.enableEditIndex = null;
    this.apiService.getLOV('code/all').subscribe( data => {
        this.taskList$=data;
        addNewList.forEach(n => {
          this.taskList$.push(n);
        })
    });
        
  }

}
