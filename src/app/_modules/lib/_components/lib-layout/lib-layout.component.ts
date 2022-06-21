import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-lib-layout',
  templateUrl: './lib-layout.component.html',
  styleUrls: ['./lib-layout.component.scss']
})
export class LibLayoutComponent implements OnInit {

  constructor() { }

  activeIndex = -1;

  sideNavList: Array<object> = [
    {navElement: 'Form Input', link: 'input'},
    {navElement: 'Slide Toggle', link: 'toggle'},
    {navElement: 'Search Bar', link: 'search'},
    {navElement: 'Progress Bar', link: 'progressbar'},
    {navElement: 'Tab Group', link: 'tabgroup'},
    {navElement: 'Nav Tab', link: 'navtab'},
    {navElement: 'Chip', link: 'chip'},
    {navElement: 'Applied Filter', link: 'applied-filter'},
    {navElement: 'Add Filter', link: 'add-filter'},
    {navElement: 'Checkbox', link: 'checkbox'},
    {navElement: 'Radio Button', link: 'radio'},
    {navElement: 'Range Slider', link: 'range-slider'},
    {navElement: 'Button', link: 'button'},
    {navElement: 'Table', link: 'table'},
    {navElement: 'Accordion', link: 'accordion'}
  ]

  ngOnInit(): void {
  }

}
