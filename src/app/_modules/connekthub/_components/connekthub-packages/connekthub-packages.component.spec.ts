import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Package } from '@modules/connekthub/_models';
import { ConnekthubService } from '@modules/connekthub/_services/connekthub.service';
import { SharedModule } from '@modules/shared/shared.module';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

import { ConnekthubPackagesComponent } from './connekthub-packages.component';

describe('ConnekthubPackagesComponent', () => {
  let component: ConnekthubPackagesComponent;
  let fixture: ComponentFixture<ConnekthubPackagesComponent>;
  let connekthubService: ConnekthubService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnekthubPackagesComponent ],
      imports: [AppMaterialModuleForSpec, RouterTestingModule, SharedModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnekthubPackagesComponent);
    component = fixture.componentInstance;
    connekthubService = fixture.debugElement.injector.get(ConnekthubService);
    fixture.detectChanges();

    component.packages = [
      {
        id: '1',
        name: 'Duplicate record and golden record identification test',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '29.10.2020',
        imageUrls: ['sss']
      },
      {
        id: '2',
        name: 'Duplicate record and golden record identification',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '29.10.2020',
      },
      {
        id: '3',
        name: 'Duplicate record and golden record identification',
        // downloads: 5,
        brief: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        whatsNew: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis sed labore voluptatum,
        ipsa alias quia voluptates quidem a tenetur. Labore minus doloribus officia molestias
        necessitatibus, laborum nobis temporibus ullam! Quia.`,
        tags: ['Material', 'Spares', 'AIML'],
        origin: 'Prospecta Software',
        createdDate: '29.10.2020',
      },
    ] as Package[];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges', () => {
    const changes = { packages: component.packages } as any;
    component.ngOnChanges(changes);
    expect(component.totalCount).toEqual(component.packages.length);
  });

  it('getPackage(), should emit', () => {
    const item = component.packages[0];
    spyOn(component.emitGetPackage, 'emit')
    component.getPackage(item);
    expect(component.emitGetPackage.emit).toHaveBeenCalled();
  });

  // it('search(), should call seach', () => {
  //   component.tempPackages = JSON.parse(JSON.stringify(component.packages));
  //   expect(component.packages.length).toBe(3);
  //   component.search('test');
  //   expect(component.packages.length).toBe(1);
  // });

  it('onPageChange(), should call getTableData with updated pagination', async(() => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 50,
      length: 100,
    };
    component.ngOnInit();
    component.onPageChange(pageEvent);
    expect(component.recordsPageIndex).toBe(pageEvent.pageIndex);

    const result = component.onPageChange(pageEvent);
    expect(result).toBeFalsy();
  }));
});
