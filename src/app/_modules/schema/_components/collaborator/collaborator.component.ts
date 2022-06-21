import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SchemaDashboardPermission } from '@models/collaborator';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'pros-collaborator',
  templateUrl: './collaborator.component.html',
  styleUrls: ['./collaborator.component.scss']
})
export class CollaboratorComponent implements OnInit {

  /**
   * schema id , that permission assigned on.
   */
  @Input()
  schemaId: string;

  /**
   * Permission information
   */
  @Input()
  collaborator: SchemaDashboardPermission;

  /**
   * After click saved button
   */
  @Output()
  saveClicked: EventEmitter<SchemaDashboardPermission> = new EventEmitter<SchemaDashboardPermission>();

  /**
   * After click delete button
   */
  @Output()
  deleteClicked: EventEmitter<string> = new EventEmitter<string>();

  isEditMode = false;

  permissionFrmGrp: FormGroup;
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.permissionFrmGrp = this.formBuilder.group({
      isAdmin:[this.collaborator.isAdmin ? this.collaborator.isAdmin : false],
      isViewer:[this.collaborator.isViewer ? this.collaborator.isViewer : false],
      isEditer:[this.collaborator.isEditer ? this.collaborator.isEditer : false],
      isReviewer:[this.collaborator.isReviewer ? this.collaborator.isReviewer : false],
    });

    this.permissionFrmGrp.valueChanges.subscribe(val=>{
      if(val) {
        this.collaborator.isAdmin = val.isAdmin ? val.isAdmin : false;
        this.collaborator.isViewer = val.isViewer ? val.isViewer : false;
        this.collaborator.isEditer = val.isEditer ? val.isEditer : false;
        this.collaborator.isReviewer = val.isReviewer ? val.isReviewer : false;
      }
    });
  }

  /**
   * After click save button should emit
   */
  updateEmit() {
    this.isEditMode = false;
    this.saveClicked.emit(this.collaborator);
  }

  /**
   * After click on delete button should emit
   */
  deleteEmit() {
    this.deleteClicked.emit(String(this.collaborator.sno));
  }

}
