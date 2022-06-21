// import { HttpHeaders, HttpResponse } from '@angular/common/http';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { MsteamsConfigService } from '@modules/msteams/_service/msteams-config.service';
// import { FormInputComponent } from '@modules/shared/_components/form-input/form-input.component';
// import { SvgIconComponent } from '@modules/shared/_components/svg-icon/svg-icon.component';
// import { of } from 'rxjs';
// import { AppMaterialModuleForSpec } from 'src/app/app-material-for-spec.module';

// import { LoginComponent } from './login.component';

// describe('LoginComponent', () => {
//   let component: LoginComponent;
//   let fixture: ComponentFixture<LoginComponent>;
//   let msTeamService: MsteamsConfigService;
//   let router: Router

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         LoginComponent,
//         FormInputComponent,
//         SvgIconComponent
//       ],
//       imports:[
//         AppMaterialModuleForSpec,
//         HttpClientTestingModule,
//         RouterTestingModule
//       ],providers:[
//         MsteamsConfigService
//       ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(LoginComponent);
//     component = fixture.componentInstance;
//     msTeamService = fixture.debugElement.injector.get(MsteamsConfigService);
//     router = fixture.debugElement.injector.get(Router);
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

// //   it('signIn(), signin ..', async(()=>{
// //     component.signIn();
// //     expect(component.errorMsg).toEqual('Username or password require ');

// //     component.signInForm.setValue({userName:'srana', password:'rana'})

// //     const httpOptions = {
// //       headers: new HttpHeaders({
// //         'JWT-TOKEN':'',
// //         'JWT-REFRESH-TOKEN':''
// //     }), observe: 'response' as const};
// //     const httpRes = new HttpResponse({headers: httpOptions.headers});
// //     spyOn(msTeamService,'signIn').withArgs('srana', 'rana').and.returnValue(of(httpRes))

// //     spyOn(router,'navigate');

// //     component.signIn();

// //     expect(msTeamService.signIn).toHaveBeenCalledWith('srana', 'rana');
// //     expect(router.navigate).toHaveBeenCalledWith(['/home']);
// //   }));

// });
