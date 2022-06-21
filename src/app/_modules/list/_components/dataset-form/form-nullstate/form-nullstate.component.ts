import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormTypes } from '@models/list-page/listpage';

@Component({
  selector: 'pros-form-nullstate',
  templateUrl: './form-nullstate.component.html',
  styleUrls: ['./form-nullstate.component.scss']
})
export class FormNullstateComponent implements OnInit {

  @Output() formType: EventEmitter<string> = new EventEmitter<string>();
  formTypes = FormTypes;
  @Input() moduleId: string;
  constructor(private router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  /**
   * choose a form to edit and open the editing form in a sidesheet
   * @param type form type object
   */
  formTypeSelected(type: {id: string; name: string}) {
    const navigationExtras: NavigationExtras = {
      queryParams: { t: type.id },
      fragment: 'property-panel',
      queryParamsHandling: 'preserve',
    };
    this.router.navigate([
      '',
      {
        outlets: {
          sb: `sb/list/dataset-settings/${this.moduleId}/forms/${this.moduleId}`,
          outer: `outer/list/edit-dataset-form/${this.moduleId}/new`,
        },
      },
    ], navigationExtras);
  }
}
