import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { GlobaldialogService } from '@services/globaldialog.service';
import { LoadDaxeRules } from '@store/actions/daxe.action';
import { Daxe } from '@store/models/daxe.model';
import { getDaxeList, getNewDaxeList } from '@store/selectors/daxe.selector';
import { Observable, of } from 'rxjs';
import { DaxeCreationComponent } from '../daxe-creation/daxe-creation.component';
import { DaxeProgramListComponent } from '../daxe-program-list/daxe-program-list.component';

@Component({
  selector: 'pros-daxe-input',
  templateUrl: './daxe-input.component.html',
  styleUrls: ['./daxe-input.component.scss']
})
export class DaxeInputComponent implements OnInit {
  @Input() daxeList: Observable<Daxe[]> = of([]);
  @Input() moduleId: string;
  selectedDaxeRule: Daxe;

  constructor(
    private globaldialogService: GlobaldialogService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    if (this.moduleId) {
      this.store.dispatch(new LoadDaxeRules(this.moduleId));
      this.daxeList = this.store.pipe(select(getDaxeList));
    } else {
      this.daxeList = this.store.pipe(select(getNewDaxeList));
    }
  }

  triggerSearch(search: string) {
    console.log('triggerSearch = ', search);
  }

  selectDaxeRule(data: Daxe) {
    if (data) {
      this.selectedDaxeRule = data;
    }
  }

  openDAXESideSheet() {
    this.globaldialogService.openDialog(DaxeProgramListComponent, {
      moduleId: this.moduleId
    },{panelClass: ['mdo-dialog']});
  }

  delete() {
    this.selectedDaxeRule = undefined;
  }

  newDaxe() {
    this.globaldialogService.openDialog(DaxeCreationComponent, {
      mode: 'new',
      moduleId: this.moduleId
    },{panelClass: ['mdo-dialog']});
  }

  editDaxe(daxe: Daxe) {
    this.globaldialogService.openDialog(DaxeCreationComponent, {
      mode: 'edit',
      moduleId: this.moduleId,
      daxe
    },{panelClass: ['mdo-dialog']});
  }
}
