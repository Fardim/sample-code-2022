import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-class-characteristics-empty-view',
  templateUrl: './class-characteristics-empty-view.component.html',
  styleUrls: ['./class-characteristics-empty-view.component.scss']
})
export class ClassCharacteristicsEmptyViewComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  newCharacterictics() {
    this.router.navigate(['', {
      outlets: {
        sb: `sb/settings/classifications`,
        outer: `outer/classifications/characteristics/new`
      },
    }]);
  }

}
