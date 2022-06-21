import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { AddDaxe, LoadDaxeRuleInfo, SaveDaxe, UpdateDaxe } from '@store/actions/daxe.action';
import { Daxe, DaxeStatus, DaxeUsage } from '@store/models/daxe.model';
import { getDaxeInfo } from '@store/selectors/daxe.selector';

interface DaxeFormData {
  name: string;
  brief: string;
  whatsNew: string;
  usage: DaxeUsage;
  daxeCode: string;
}

@Component({
  selector: 'pros-daxe-creation',
  templateUrl: './daxe-creation.component.html',
  styleUrls: ['./daxe-creation.component.scss']
})
export class DaxeCreationComponent implements OnInit {
  readonly DaxeUsage = DaxeUsage;
  editorOptions = { theme: 'vs-light', language: 'javascript' };
  mode: 'new' | 'edit';
  form: FormGroup;
  daxeRule: Daxe;
  showFullScreenEditor: boolean;
  moduleId: string;
  menuOpen: boolean;

  constructor(
    private dialogRef: MatDialogRef<DaxeCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    protected sanitizer: DomSanitizer,
    private store: Store
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      brief: ['', Validators.required],
      whatsNew: [''],
      usage: ['', Validators.required],
      daxeCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data.mode) {
      this.mode = this.data.mode;
    } else {
      this.mode = 'new';
    }

    if (this.data.moduleId) {
      this.moduleId = this.data.moduleId;
    }

    if (this.mode === 'edit') {
      this.store.select(getDaxeInfo);
      this.daxeRule = this.data.daxe;
      this.store.dispatch(new LoadDaxeRuleInfo(this.daxeRule.id));

      if (this.mode === 'edit') {
        this.store.select(getDaxeInfo).subscribe((ruleInfo) => {
          this.form.setValue({
            name: this.daxeRule.name || '',
            brief: this.daxeRule.brief,
            whatsNew: '',
            usage: this.daxeRule.usage,
            daxeCode: ruleInfo ? ruleInfo.daxeProgrmaDetail.daxeCode : ''
          });
        });
        this.store.dispatch(new LoadDaxeRuleInfo(this.daxeRule.id));
      }
    }
  }

  close() {
    this.dialogRef.close();
  }

  toggleFullScreenEditor() {
    this.showFullScreenEditor = !this.showFullScreenEditor;
  }

  save(draft: boolean) {
    if (this.form.invalid) {
      return;
    }

    const formData: DaxeFormData = this.form.value;
    console.log('formData', formData);
    let hasChange = false;

    if (this.mode === 'new') {
      delete formData.whatsNew;
      hasChange = true;
    }

    for (const key in formData) {
      if (formData[key]) {
        formData[key] = formData[key].trim();
        if (this.mode === 'edit' && formData[key] !== this.daxeRule[key]) {
          hasChange = true;
        }
      }
    }

    if (hasChange) {
      if (this.mode === 'new') {
        let status = DaxeStatus.ACTIVE;
        if (draft) {
          status = DaxeStatus.DRAFT;
        }
        this.daxeRule = {
          ...formData,
          id: '',
          version: '1.0',
          assignedState: status === DaxeStatus.ACTIVE ? true : false,
          createdOn: new Date().getTime(),
          createdBy: null,
          modifiedOn: new Date().getTime(),
          modifiedBy: null,
          tenantId: '',
          status
        };
        if (this.moduleId) {
          this.daxeRule.dataSetId = this.moduleId;
          this.store.dispatch(new SaveDaxe(this.daxeRule));
        } else {
          this.store.dispatch(new AddDaxe(this.daxeRule));
        }
      } else {
        this.daxeRule = Object.assign({}, this.daxeRule);
        this.daxeRule.brief = formData.brief;
        this.daxeRule.name = formData.name;
        this.daxeRule.usage = formData.usage;
        this.daxeRule.daxeCode = formData.daxeCode;
        this.daxeRule.whatsNew = formData.whatsNew;
        if (this.moduleId) {
          this.daxeRule.dataSetId = this.moduleId;
          this.store.dispatch(new SaveDaxe(this.daxeRule));
        } else {
          this.store.dispatch(new UpdateDaxe(this.daxeRule));
        }
      }
      this.close();
    }
  }
}
