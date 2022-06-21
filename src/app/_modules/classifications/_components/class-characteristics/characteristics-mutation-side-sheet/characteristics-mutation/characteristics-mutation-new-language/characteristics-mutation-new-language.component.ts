import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-characteristics-mutation-new-language',
  templateUrl: './characteristics-mutation-new-language.component.html',
  styleUrls: ['./characteristics-mutation-new-language.component.scss']
})
export class CharacteristicsMutationNewLanguageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  close() {
    this.router.navigate([{ outlets: { sb: `sb/settings/classifications`, outer: `outer/classifications/characteristics/new` } }]);
  }

}
