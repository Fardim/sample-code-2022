import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbComponent } from './breadcrumb.component';
import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Breadcrumb } from 'src/app/_models/breadcrumb';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let breadcrumbHtml: HTMLElement;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppMaterialModuleForSpec,
        RouterTestingModule
      ],
      declarations: [BreadcrumbComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    breadcrumbHtml = fixture.nativeElement;
    fixture.detectChanges();
  });

  // mock data
  const crumbs: Breadcrumb = {
    heading: 'Test Breadcrum Heading',
    links: [{ link: '/home/schema', text: 'Schema Group' }]
  };

  it('Breadcrumb Heading : should create', async(() => {
    component.crumbs = crumbs;
    fixture.detectChanges();
    const expectedHeading = crumbs.heading;
    const actualHeading = breadcrumbHtml.querySelector('h1').textContent;
    expect(actualHeading).toEqual(expectedHeading);
  }));

  it('Breadcrumb Link : should create', async(() => {
    component.crumbs = crumbs;
    fixture.detectChanges();
    expect(breadcrumbHtml.querySelector('a').getAttribute('ng-reflect-router-link')).toEqual(crumbs.links[0].link);
  }));

  it('Breadcrumb Link : check links size and order', async(() => {
    const crumbsMock: Breadcrumb = {
      heading: 'Test Breadcrum Heading',
      links: [{ link: '/home/schema', text: 'Schema Group' }, {link: '/home/schema/schema-variants', text: 'Schema Variants'}]
    };
    component.crumbs = crumbsMock;
    fixture.detectChanges();
    expect(breadcrumbHtml.getElementsByTagName('a').length).toEqual(3);
    expect(breadcrumbHtml.getElementsByTagName('a').item(0).getAttribute('ng-reflect-router-link')).toEqual(crumbsMock.links[0].link);
    expect(breadcrumbHtml.getElementsByTagName('a').item(1).getAttribute('ng-reflect-router-link')).toEqual(crumbsMock.links[1].link);
    expect(breadcrumbHtml.getElementsByTagName('a').item(0).textContent).toEqual(crumbsMock.links[0].text);
    expect(breadcrumbHtml.getElementsByTagName('a').item(1).textContent).toEqual(crumbsMock.links[1].text);
    expect(breadcrumbHtml.getElementsByTagName('a').item(2).textContent).toEqual(crumbsMock.heading);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
