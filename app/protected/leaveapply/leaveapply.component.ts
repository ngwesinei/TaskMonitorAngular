
import { Component,Input, OnInit,ChangeDetectorRef,ViewChild, ElementRef,AfterViewInit,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService,DialogService } from '../../services';
import Swal from 'sweetalert2';
import { AuthService } from "../../services/auth.service";
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-taskcreate',
  templateUrl: './leaveapply.component.html',
  styleUrls: ['./leave.component.scss', '../../util/dialog/content/app.less', '../../util/dialog/content/model.less']
})
export class LeaveApplyComponent implements OnInit {

    leaveType; leaveStatus; leaveMode;employeelist; // for list or value
    leaveApplyForm : FormGroup;    
    monthYear;// for search filter
    leaveList; dayList; // for calendar and list
    enableEdit; enableEditIndex; // for edit table    
    public searchLeave: any={curMonth:'', userRole:''};
    employeeno; globalRemark; globalInternalId;
    maxDate;disabledWeekend; tableMaxDate;holidayList;

    constructor( private apiService: ApiService,
    private formBuilder: FormBuilder, private authService : AuthService, private dialogService: DialogService, 
    private toastr: ToastrService,  private bsLocaleService: BsLocaleService) {   
        this.bsLocaleService.use('en');   
     }

    ngOnInit() {
        // get data from memory        
        this.maxDate = new Date();
        this.disabledWeekend = (date) => {    // disable weekend & holiay
            if(date.getDay() != 0 && date.getDay() != 6) {
                let allow = true;
                this.holidayList.forEach(h => {                 
                    if(date.getDate() +"-"+ (date.getMonth()+1) == (new Date(h).getDate() +"-"+ (new Date(h).getMonth()+1))){
                        allow = false;
                    }                    
                });
                return allow;
            }else{
                return false;
            }
        };
        this.authService.isUserRole.subscribe(data => {
            this.searchLeave.userRole= data; 
        });
        this.authService.isEmployeeData.subscribe(data => {
            this.employeeno = data;
        });
        this.leaveApplyForm = this.formBuilder.group({
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            leaveType: [''],
            leaveStatus:[''],
            leaveMode:[''],
            employeeNo:[''],
            remark: [''],
            employeelist:['']
        });
        // get data from service
        this.monthYear = new Date();
        this.apiService.getLOV('code/leave_type').subscribe( data => {
            this.leaveType=data;
        });
        this.apiService.getLOV('code/leave_status').subscribe( data => {
            this.leaveStatus=data;
        });
        this.apiService.getApi('publicHoliday').subscribe( data => {
            this.holidayList=data; 
        });
        this.apiService.getLOV('code/leave_mode').subscribe( data => {
            this.leaveMode=data;
            this.changeMonth();    
        });   
        this.apiService.getLOV('user/employeeinfo/').subscribe(data=>{
            this.employeelist=data;
            
        });
    }
    
    changeStartDate(){ // for disable end date
        if(this.leaveApplyForm.value.startDate){
            this.maxDate = new Date(this.leaveApplyForm.value.startDate.getFullYear(), this.leaveApplyForm.value.startDate.getMonth() +1, 0);            
        }
    }    

    applyLeave(){ // new leave apply
        
        Swal.fire({
            title: "Confirmation!",text: "Are you sure to save data?", confirmButtonText: 'Confirm',
            showConfirmButton: true, showCancelButton: true     
          }).then((willSave) => {
            if(willSave.value){
                if( this.leaveApplyForm.value.employeelist){
                    this.leaveApplyForm.value.employeeNo =  this.leaveApplyForm.value.employeelist;
                }else{
                    this.leaveApplyForm.value.employeeNo = this.employeeno;
                }
                
                if(this.checkValidation(this.leaveApplyForm.value) == false)
                    return;
                else{                    
                    this.apiService.PostApi('applyleave', this.leaveApplyForm.value)
                    .subscribe( data => {
                        let d : any = data;
                        if(d.error) 
                            this.toastr.error(d.error);
                        else{                  
                            this.toastr.success('Save Success');
                            this.changeMonth();
                        }
                    }, err => {
                        this.toastr.error(err); 
                    });   
                }
            }
        });
    }

    checkValidation(selectedData){
        let startDate = new Date(selectedData.startDate);
        let endDate = new Date(selectedData.endDate);
        if(!selectedData.leaveType){
            this.toastr.error('Leave Type required');
            return false;
        }
        else if(!selectedData.leaveStatus){
            this.toastr.error('Leave Status required');
            return false;
        }else if(!selectedData.leaveMode){
            this.toastr.error('Leave Mode required');
            return false;
        }
        else if(!selectedData.startDate){
            this.toastr.error('Start Date Required');
            return false;
        }
        else if(!selectedData.endDate){
            this.toastr.error('End Date Required');
            return false;
        }else if(endDate < startDate){
            this.toastr.error('Invalid Start Date and End Date');
            return false;
        }else if((endDate > startDate) && selectedData.leaveMode != 'F'){
            this.toastr.error('Invalid Leave Mode for Start Date and End Date');
            return false;
        }
    }

    changeMonth(){ // get calendar by month data
        this.tableMaxDate = new Date(this.monthYear.getFullYear(), this.monthYear.getMonth() +1, 0);            
        this.enableEditIndex = null; 
        this.leaveList=null;
        this.searchLeave.curMonth = this.monthYear.getMonth()+1+"-"+this.monthYear.getFullYear();
        this.apiService.getApi("daylist/"+this.searchLeave.curMonth).subscribe( data => {
            this.dayList=data;
        });
        this.apiService.PostApi("leavelisttable", this.searchLeave).subscribe( data => {
            this.leaveList = data;
            this.leaveList.forEach(l => {
                this.leaveMode.forEach(lm => {                    
                if(l.leaveMode === lm.tableValue)
                    l.leaveModeDesc = lm.tableName;             
                });
            });
        });
    }

    openCalendar(container) { // open monthly calendar
        container.monthSelectHandler = (event: any): void => {
          container._store.dispatch(container._actions.select(event.date));
        };     
        container.setViewMode('month');
     }

    enableEditMethod(e, i, selectedData: any) { // set table editable
        this.enableEdit = true;
        this.enableEditIndex = i;
        let updateFlag = false;
        selectedData.updateFlag = true;       
    }

    deleteLeave(e, i, selectedData: any){ // click delete
        Swal.fire({
            title: "Confirmation!",text: "Are you sure to delete data?", confirmButtonText: 'Confirm',
            showConfirmButton: true, showCancelButton: true     
          }).then((willSave) => {
            if(willSave.value){
                this.apiService.PostApi('deleteleave', selectedData).subscribe( data => {  
                    this.toastr.success('Delete Success') ;
                    this.changeMonth();
                });
            }
        });
    }

    updateLeave(e, i, selectedData: any){ // update data
        Swal.fire({
            title: "Confirmation!",text: "Are you sure to update data?", confirmButtonText: 'Confirm',
            showConfirmButton: true, showCancelButton: true     
          }).then((willSave) => {
            if(willSave.value){
                selectedData.employeeNo = this.employeeno;
                if(this.checkValidation(selectedData) == false)
                    return;
                else{
                    this.apiService.PostApi('applyleave', selectedData).subscribe( data => {  
                        let d : any = data;
                        if(d.error) 
                            this.toastr.error(d.error);
                        else{                  
                            this.toastr.success('Save Success');
                            this.changeMonth();
                            this.enableEditIndex = null; 
                        }                        
                    });
                }
            }
        });
    }
    
    getRemark(modelId: string, ls, i){ // show popup box
        this.globalInternalId = ls.internalId;    
        this.dialogService.open(modelId);
        this.leaveList.forEach(element => {
          if(element.internalId === this.globalInternalId)
            this.globalRemark = element.remark == 'null' ? '': element.remark;                  
        });        
    }

    @Input() id: string;
    closeModal(modelId: string) { // close popup box
        this.dialogService.remove(this.id);
        this.dialogService.close(modelId);
        this.globalRemark = '';
     }

    saveRemark(modelId: string){ // put remark to model object
        this.leaveList.forEach(element => {
            if(element.internalId === this.globalInternalId){
                element.remark = this.globalRemark;
            }        
        });
        this.dialogService.remove(this.id);
        this.dialogService.close(modelId);
    }

}


