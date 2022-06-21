import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pros-edit-interface',
  templateUrl: './edit-interface.component.html',
  styleUrls: ['./edit-interface.component.scss']
})
export class EditInterfaceComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
