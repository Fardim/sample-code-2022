import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransientService } from 'mdo-ui-library';

@Component({
  selector: 'pros-preview-mapping',
  templateUrl: './preview-mapping.component.html',
  styleUrls: ['./preview-mapping.component.scss']
})
export class PreviewMappingComponent implements OnInit {

  constructor(private router: Router, private transientService: TransientService) { }

  ngOnInit(): void {
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }

  openConfirmation(msg: any): void {
    let dialogMsg

    if(msg === 'interface save') {
      dialogMsg = 'Saving the edits made will reset XSL to system generated and any customization maintained will be revereted.'
    }
    else if(msg === 'interface del') {
      dialogMsg = 'The following flow will be impacted if you delete this interface\nAre you sure you want to delete this interface?'
    }

    this.transientService.confirm({
      data: { dialogTitle: 'Alert', label: dialogMsg},
      disableClose: true,
      autoFocus: false,
      width: '600px',
      panelClass: 'create-master-panel',
    }, (response) => {});
  }
}
