import { Utilities } from './utilities';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { async, TestBed } from '@angular/core/testing';

describe('Utilities', () => {
  let classObject: Utilities;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        MatSnackBarModule
      ]
    }).compileComponents();

    classObject = new Utilities();
  }));

  it('should call getPickList and return type', () => {
    expect(classObject.getPickList('0').type).toBe('Text')
  });

  it('should return fullCode from shortCode', () => {
    expect(classObject.statusFromShortCode('INP')).toBe('In Progress');
    expect(classObject.statusFromShortCode('INP')).toBe('In Progress');
    expect(classObject.statusFromShortCode('REJ')).toBe('Rejected');
    expect(classObject.statusFromShortCode('CNCL')).toBe('Cancelled');
  });
});
