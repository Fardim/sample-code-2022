// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { BpmnBuilderComponent } from './bpmn-builder.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';

// describe('BpmnBuilderComponent', () => {
//   let component: BpmnBuilderComponent;
//   let fixture: ComponentFixture<BpmnBuilderComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ BpmnBuilderComponent ],
//       imports: [HttpClientTestingModule]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(BpmnBuilderComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should start with a zoom rate greater than 0', () => {
//     expect(component.zoomRate).toBeGreaterThan(0) ;
//   }) ;

//   it('should has zoom step greater than 0', () => {
//     expect(component.zoomStep).toBeGreaterThan(0) ;
//   })

//   it('should zoom in', () => {
//     const initialRate = component.zoomRate ;
//     component.zoomIn() ;
//     expect(component.zoomRate).toBeGreaterThan(initialRate) ;
//   })

//   it('should zoom out', () => {
//     const initialRate = component.zoomRate ;
//     component.zoomOut() ;
//     expect(component.zoomRate).toBeLessThan(initialRate) ;
//   })

//   it('should set zoom to 0', () => {
//     component.zoomRate = 0.1 ;
//     component.zoomOut() ;
//     expect(component.zoomRate).toBeGreaterThan(0) ;
//   })

//   it('should reset zoom', () => {
//     component.resetZoom() ;
//     expect(component.zoomRate).toBe(0.8) ;
//   })

//   /*
//   it('should save the diagram', () => {
//     component.save() ;
//     expect(component.zoomRate).toBe(0.8) ;
//   })
//   */

//   it('should init the blank diagram', () => {
//     component.init() ;
//     expect(component.zoomRate).toBe(0.8) ;
//   })

//   it('should not load if there is no selected file', () => {
//     const event = {
//       target : {
//         files : []
//       }
//     }
//     component.load(event) ;
//     expect(component.zoomRate).toBe(0.8) ;
//   });

//   it('should load a diagram file', () => {
//     const event = {
//       target : {
//         files : [new File([component.blankDiagram], 'diagram.xml')]
//       },
//       srcElement : {}
//     }
//     component.load(event) ;
//     expect(component.zoomRate).toBe(0.8) ;
//   })

//   it('should save the diagram', () => {
//     component.init();
//     component.save() ;
//     expect(component.zoomRate).toBe(0.8) ;
//   })

//   it('should not update if there is no element selected', () => {
//     component.onUpdateProperties({});
//     expect(component.zoomRate).toBe(0.8) ;
//   })


//   it('should have a <div> with canvas id', () => {
//     const el: HTMLElement = fixture.nativeElement;
//     const canvas = el.querySelector('#canvas') ;
//     expect(canvas).toBeDefined() ;
//   });

//  /*
//   it('should initialize the modeler element', () => {
//     component.ngOnInit() ;
//     expect(component.modeler).toBeDefined() ;
//   });
//   */

//  it('should handle forward connection creation', () => {

//   const event = {
//     element : {
//       businessObject : {
//           $attrs : {
//             rejection : false
//           }
//         }
//       }
//   } ;

//   // component.ngOnInit() ;
//   component.handleConnectionCreation(event);

//   expect(component.modelerWidth).toBeDefined() ;
// });

// it('should not change the element id', () => {

//   const element = {
//       id : '01',
//       type : 'bpmn:UserTask'
//   } ;


//   component.setElementId(element);
//   expect(component.nextId).toEqual(1) ;
// });

// });
