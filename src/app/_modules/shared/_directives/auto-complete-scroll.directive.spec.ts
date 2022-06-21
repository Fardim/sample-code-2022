// import { ElementRef } from '@angular/core';
// import { async, TestBed } from '@angular/core/testing';
// import { MatAutocomplete } from '@angular/material/autocomplete';
// import { RouterTestingModule } from '@angular/router/testing';
// import { AutoCompleteScrollDirective } from './auto-complete-scroll.directive';


// describe('AutoCompleteScrollDirective', () => {
//     let directive: AutoCompleteScrollDirective;

//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             imports: [ RouterTestingModule ],
//             declarations: [ AutoCompleteScrollDirective ]
//             })
//         .compileComponents();
//     }));

//     beforeEach(() => {
//         const spy = jasmine.createSpyObj(MatAutocomplete,['closed','opened']);
//         directive = new AutoCompleteScrollDirective(spy);
//     });

//     it('onScroll(), should call when oscroll event is called', async (()=> {
//         directive.thresholdPercent = 2;
//         const event = {type: 'scroll', target: {scrollHeight:50, scrollTop:130, clientHeight:250}};
//         // spyOn(directive.scroll,'next');

//         directive.onScroll(event);

//         // directive.scroll.subscribe(sub=> {
//         //     expect(sub.scrollEvent).toEqual(event);
//         // });
//     }));
// });
