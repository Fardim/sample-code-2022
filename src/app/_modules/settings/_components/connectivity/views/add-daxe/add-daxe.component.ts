import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-add-daxe',
  templateUrl: './add-daxe.component.html',
  styleUrls: ['./add-daxe.component.scss']
})
export class AddDaxeComponent implements OnInit {

  segmentOptions = [{label: 'New DAXE', value: 'newDaxe'}, {label: 'Existing DAXE', value: 'existingDaxe'}];
  showSelectedForm = 'new';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  segmentChanged(segmentValue) {
    if(segmentValue === 'newDaxe') {
      this.showSelectedForm = 'new';
    }
    else {
      this.showSelectedForm = 'existing';
    }
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
