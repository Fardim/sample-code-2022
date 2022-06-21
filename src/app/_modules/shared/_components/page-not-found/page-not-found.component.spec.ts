import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFoundComponent } from './page-not-found.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { Location } from '@angular/common';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let location: Location;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, AppMaterialModuleForSpec ],
      declarations: [ PageNotFoundComponent ]
    })
    .compileComponents();
    location = TestBed.inject(Location);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and back should go back by location', () => {
    expect(component).toBeTruthy();
    spyOn(location, 'back');
    component.back();
    expect(location.back).toHaveBeenCalledTimes(1);
  });
});
