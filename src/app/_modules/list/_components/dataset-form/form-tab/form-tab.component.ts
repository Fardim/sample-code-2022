import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pros-form-tab',
  templateUrl: './form-tab.component.html',
  styleUrls: ['./form-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormTabComponent implements OnInit {
  @Input() tabContainer = [];

  constructor() { }

  ngOnInit(): void {
  }

  deleteFormWidget(event) {
  }
}
