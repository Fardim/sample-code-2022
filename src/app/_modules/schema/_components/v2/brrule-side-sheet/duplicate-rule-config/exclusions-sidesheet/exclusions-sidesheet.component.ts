import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { GlobaldialogService } from '@services/globaldialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pros-exclusions-sidesheet',
  templateUrl: './exclusions-sidesheet.component.html',
  styleUrls: ['./exclusions-sidesheet.component.scss']
})
export class ExclusionsSidesheetComponent implements OnInit, OnDestroy {

  fId: string;
  serachText = '';
  newGroupActive = false;
  editText = '';

  exclusionControl = new FormControl('');
  synonymsForm: FormGroup ;
  subscription: Subscription;

  @ViewChild('editInput', {static: false}) editInput: MatInput;

  constructor(private router: Router,
    private sharedService: SharedServiceService,
    private formBuilder: FormBuilder,
    private glocalDialogService: GlobaldialogService
    ) { }


  ngOnInit(): void {

    this.synonymsForm = this.formBuilder.group({
      synonymsArray: this.formBuilder.array([])
    });

    this.subscription = this.sharedService.getExclusionData()
      .subscribe(data => {
        if (data && data.fId) {
          this.initExclusionData(data);
        } else {
          this.close();
        }
      })
  }

  enableGroupCreation(){
    this.newGroupActive = true;
  }


  /**
   * set initial exclusion data
   * @param data initial value
   */
  initExclusionData(data) {

    this.fId = data.fId;

    this.exclusionControl.setValue(data.ival ? data.ival.split(',').join('\n') : '');

    const synonyms = data.sval ? data.sval.replace(/[:]/g, ' ').split(',') : [];


    synonyms.forEach(synonym => {
      this.synonymsArray.push(
        this.formBuilder.group({
          text: synonym,
          editActive: false,
          visible: true,
          hover: false
        })
      )
    })

  }

  /**
   * add a new synonym group
   */
  addSynonymGroup() {

    const newValue = this.editText.replace(/[:, ]/g,'');

    if(newValue){
     this.synonymsArray.insert(0, this.formBuilder.group({
       text: this.concatStringLines(newValue),
       editActive: false,
       visible: true,
       hover: false
     }));

     this.editText = '';
     this.newGroupActive = false;
    }
  }


  /**
   * start synonym group edition
   * @param index group index
   */
  editSynonymGroup(index) {

    const group = this.synonymsArray.at(index);

    group.patchValue({
      editActive: true
    });

    this.newGroupActive = false;

    setTimeout(() => {
      if(this.editInput){
        this.editInput.focus()
      }
    }, 100);
  }


  /**
   * convert a multiline string to space separate single line
   * @param value string to be formatted
   */
  concatStringLines(value: string): string {
    return value.replace(/[ ]/g, '').split('\n').join(' ');
  }

  /**
   * convert space separate string to a multiline string
   * @param value string to be formatted
   */
  splitStringLines(value: string) {
    return value.split(' ').join('\n');
  }

  /**
   * remove a synonym group
   * @param index element to remove
   */
  removeSynonymGroup(index) {

    this.glocalDialogService.confirm({label:'Are you sure to delete ?'}, (resp) => {
      this.removeSynGrpAfterConfirm(resp, index);
    })

  }

  removeSynGrpAfterConfirm(resp: string, index: number) {
    if (resp && resp === 'yes') {
      this.synonymsArray.removeAt(index);
    }
  }

  /**
   * Save a synonym group after edition
   * @param value new value
   * @param index synonym index
   */
  saveSynonymGroup(index, value) {

    const group = this.synonymsArray.at(index);
    const newValue = value.replace(/[:, ]/g,'');

    if(newValue) {
      group.patchValue({
          text: this.concatStringLines(newValue.replace(/[:,]/g,'')),
          editActive: false
        });
    } else {
      group.patchValue({
        editActive: false
      });
    }

  }

  searchWords(searchText){
    if(!searchText){
      this.synonymsArray.controls.forEach( control => control.patchValue({visible:true}));
      this.serachText = '';
      return;
    }

    this.synonymsArray.controls.forEach( control => {
      if(control.value.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1){
        control.patchValue({visible:true})
      } else {
        control.patchValue({visible:false})
      }
    });

    this.serachText = searchText;
  }

  /**
   * save the configured exclusion data
   */
  save(){

    const result = { fId: this.fId, exclusion: 0, ival: '', sval: '' };
    const exclusionArray = this.exclusionControl.value ? this.exclusionControl.value.trim().replace(/[ ,:]/g,'').split('\n') : [];
    result.ival = exclusionArray.join(',');
    result.exclusion = exclusionArray.length;
    result.sval = this.synonymsArray.value.map(e => e.text.trim().replace(/[ ]/g, ':')).join(',');
    console.log(result);
    this.subscription.unsubscribe();
    this.sharedService.setExclusionData(result);

    this.close();
  }


  /**
   * function to emit data and close the dialog
   */
  close() {
    this.router.navigate([{ outlets: { sb3: null } }]);
  }

  get synonymsArray(){
    return this.synonymsForm.get('synonymsArray') as FormArray;
  }

  groupHover(index){
    this.synonymsArray.at(index)
      .patchValue({hover:true});
  }

  groupLeave(index){
    this.synonymsArray.at(index)
      .patchValue({hover:false});
  }

  ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }



}
