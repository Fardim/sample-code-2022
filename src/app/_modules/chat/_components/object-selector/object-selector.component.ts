import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ListDataSource } from '@modules/list/_components/list-datatable/list-data-source';
import { ListService } from '@services/list/list.service';
import { Subject } from 'rxjs';

export interface ObjectData {
  [key: string]: any;
}
@Component({
  selector: 'pros-object-selector',
  templateUrl: './object-selector.component.html',
  styleUrls: ['./object-selector.component.scss'],
})
export class ObjectSelectorComponent implements OnInit, OnChanges, OnDestroy {
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  @Input() moduleId: string;

  /**
   * event emitter to emit the selected object data back to the parent component
   */
  @Output() objectSelected = new EventEmitter<any>();

  /**
   * search control
   */
  searchControl: FormControl = new FormControl('');

  configuration: any;

  /**
   * displayed columns for table
   */
  displayedColumns: string[] = ['OBJECTNUMBER', 'DESCRIPTION'];
  dataSourceLoader: boolean;
  dataSource: ListDataSource;

  constructor(private listService: ListService) {
    this.dataSource = new ListDataSource(this.listService);
  }

  ngOnInit(): void {
    this.dataSource.connect(null).subscribe((data) => {
      this.dataSourceLoader = false;
    })
    if(this.moduleId){
      this.dataSourceLoader = true;
      this.dataSource.getData(this.moduleId, 'default', 1, []);
    }
  }

  /**
   * detect changes and update the object data
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.moduleId?.currentValue !== changes.moduleId?.previousValue) {
      this.moduleId = changes.moduleId.currentValue;
    }
  }

  /**
   * Initialize the search filter control
   */
  initSearchControl() {
    this.searchControl.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  /**
   * emit the selected object data back to the parent component
   * @param object Selected object data
   */
  select(object: any) {
    this.objectSelected.emit({
      selected: object,
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
    this.dataSource.disconnect(null);
  }
}
