import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConnectorDetails, ExistingConnectorsList } from '@modules/list/_components/connector/connectors.constants';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'pros-new-connection',
  templateUrl: './new-connection.component.html',
  styleUrls: ['./new-connection.component.scss']
})
export class NewConnectionComponent implements OnInit {

  @Output() navigate: EventEmitter<string> = new EventEmitter<string>();
  @Output() connectionChange: EventEmitter<ConnectorDetails> = new EventEmitter<ConnectorDetails>();
  @Output() afterClose: EventEmitter<any> = new EventEmitter();
  connectionsList: Observable<ConnectorDetails[]> = of([...ExistingConnectorsList]);
  searchControl: FormControl = new FormControl('');
  // Show list of adapters for connection here
  constructor() { }

  ngOnInit(): void {
    this.connectionsList = this.searchControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  filter(search: string): ConnectorDetails[] {
    return ExistingConnectorsList.filter(connection =>
      connection.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  selectConnector(connection: ConnectorDetails) {
    this.connectionChange.emit(connection);
    this.navigate.emit('connection-description');
  }
}
