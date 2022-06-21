import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-empty-view',
  templateUrl: './empty-view.component.html',
  styleUrls: ['./empty-view.component.scss']
})
export class EmptyViewComponent {
  constructor(private router: Router) { };

  openDialog() {
    this.router.navigate([{
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/class-types/new`
      },
    }]);
  }
}
