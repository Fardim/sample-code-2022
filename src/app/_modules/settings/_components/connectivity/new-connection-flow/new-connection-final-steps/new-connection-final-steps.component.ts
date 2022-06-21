import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pros-new-connection-final-steps',
  templateUrl: './new-connection-final-steps.component.html',
  styleUrls: ['./new-connection-final-steps.component.scss']
})
export class NewConnectionFinalStepsComponent implements OnInit {

  @Output() navigate: EventEmitter<string> = new EventEmitter<string>();
  @Output() afterClose: EventEmitter<any> = new EventEmitter();
  bannerText: string;
  saveLoader = false;
  constructor() { }

  ngOnInit(): void {
  }

}
