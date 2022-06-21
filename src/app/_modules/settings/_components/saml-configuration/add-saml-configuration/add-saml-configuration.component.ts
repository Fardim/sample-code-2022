import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '@models/teams';
import { SamlConfigurationService } from '@services/user/saml-configuration.service';
import { UserProfileService } from '@services/user/user-profile.service';
import { UserService } from '@services/user/userservice.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import xml2js from 'xml2js';

@Component({
  selector: 'pros-add-saml-configuration',
  templateUrl: './add-saml-configuration.component.html',
  styleUrls: ['./add-saml-configuration.component.scss'],
})
export class AddSamlConfigurationComponent implements OnInit {

  currentConfigDetails = {
    viewId: 'new',
    configurationTitle: 'New',
    showBanner: false,
    message:''
  }

  subscriptions: Subscription = new Subscription();

  samlConfigFormGroup: FormGroup;

  securityProfileList = [
    { label: 'PKIX', value: 'PKIX' },
    { label: 'MetalOP', value: 'MetalOP' },
  ];

  signedArtifactResolveList = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  allCertificateList = [];

  /**
   * hold the list of filtered options
   */
  allCertificateFilteredListOptions: Observable<any[]> = of(this.allCertificateList);
  securityProfileOptions: Observable<any> = of(this.securityProfileList);
  STSecurityProfileOption: Observable<any> = of(this.securityProfileList);
  signedResolveOptions: Observable<any> = of(this.signedArtifactResolveList);

  /**
   * Store all MDO roles ...
   */
  roles$:Observable<Role[]> = of([]);

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(LOCALE_ID) public locale: string,
    private router: Router,
    private samlConfigurationService: SamlConfigurationService,
    public userService: UserService,
    private profileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.locale = this.locale !== '' ? this.locale.split('-')[0] : 'en';
    this.createConfigurationForm();
    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params) => {
        this.currentConfigDetails.viewId = params.viewId !== 'new' ? params.viewId : '';
        if (this.currentConfigDetails.viewId === 'edit') {
          this.currentConfigDetails.configurationTitle = 'Edit';
        }
      })
    );

    this.subscriptions.add(
      this.activatedRoute.queryParams.subscribe((queryParam) => {
        if (queryParam?.t) {
          const params = JSON.parse(atob(queryParam.t));
          this.patchConfigurationForm(params);
        }
      })
    )

    /**
     * Get the obserable for making HTTP to get roles at run time ...
     */
    this.roles$ = this.profileService.getTeamRoles({searchString:'',pageInfo:{pageNumer:0,pageSize:50}}).pipe(map((m)=>{
      return m.listPage.content;
    }));

    this.rolesMappingsArray.valueChanges.subscribe(s=>{
      console.log(s);
    })
  }

  patchConfigurationForm(params) {
    this.samlConfigurationService.getSAMLConfigurationData(params?.orgId, params?.tenantId).subscribe((configData: any) => {
      if (configData) {
        this.samlConfigFormGroup.patchValue(configData);
      }
    }, error => {
      console.log('Error:', error);
    })
  }

  showErrorBanner(msg?: string) {
    const isShowBanner =
      !this.samlConfigFormGroup.get('idpMetaDataImport').value &&
      (this.samlConfigFormGroup.controls.certificateListctrl.touched ||
        this.samlConfigFormGroup.controls.signingCertificate.touched ||
        this.samlConfigFormGroup.controls.idpXmlUrl.touched);
    this.currentConfigDetails.showBanner = isShowBanner;
  }

  allCertificateClicked() {
    this.samlConfigFormGroup.controls.certificateListctrl.markAsTouched();
    this.showErrorBanner();
  }

  createConfigurationForm(formData?: any) {
    this.samlConfigFormGroup = new FormGroup({
      idpXml: new FormControl(''),
      idpaliasName: new FormControl(''),
      idpEntityId: new FormControl(''),
      fileName: new FormControl(''),
      idpXmlUrl: new FormControl(''),
      certificateListctrl: new FormControl(''),
      signingCertificate: new FormControl(''),
      securityProfile: new FormControl('PKIX'),
      tlssecurityProfile: new FormControl('PKIX'),
      artifactResolver: new FormControl('Yes'),
      companyId: new FormControl(''),
      orgId: new FormControl(''),
      tenantId: new FormControl(''),
      rolesMappings: new FormArray([])
    });

    // add default row ....
    this.addRow();

  }

  /**
   * Form array for the roles mappings ...
   */
  get rolesMappingsArray(): FormArray {
    return this.samlConfigFormGroup.get('rolesMappings') as FormArray;
  }

  getUserDetails() {
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user => {
      this.samlConfigFormGroup.patchValue({
        orgId: user.orgId ? user.orgId : '0',
        tenantId: user.plantCode ? user.plantCode : '0'
      })
    },(error) => console.error(`Error : ${error.message}`));
  }

  submitConfiguration() {
    const formValue = this.samlConfigFormGroup.value;
    console.log(formValue);
    if(formValue.idpXmlUrl && !this.samlConfigurationService.validateUrl(formValue.idpXmlUrl)) {
      this.currentConfigDetails.showBanner = true;
      this.currentConfigDetails.message = `Invalid IDP metadat url `;
      return;
    }
    const rolesM = [];

    this.rolesMappingsArray.value.forEach(f=>{
      console.log(f);
      rolesM.push({
        ADRole: f.ADRole || '',
        mdoRole: f.mdoRole?.uuid || ''
      })
    });

    const payload = {
      idpXmlUrl: formValue?.idpXmlUrl ? formValue?.idpXmlUrl : '',
      idpEntityId: '',
      idpaliasName: formValue?.idpaliasName ? formValue?.idpaliasName : '',
      certificateList: [],
      signingCertificate: '',
      securityProfile: '',
      tlssecurityProfile: '',
      artifactResolver: '',
      orgId: formValue.orgId ? formValue.orgId : '0',
      rolesMappings: rolesM || []
    };

    this.saveConfigurationData(payload);


  }

  saveConfigurationData(payload) {
    this.userService.getUserDetails().pipe(distinctUntilChanged()).subscribe(user=>{
      payload.orgId = user.orgId || '';
      combineLatest([
        this.samlConfigurationService.saveUpdateSAMLConfiguration(payload)
      ]).subscribe((res) => {
        this.updateConfig();
      }, err=>{
        this.currentConfigDetails.showBanner = true;
        this.currentConfigDetails.message = (err?.error?.message || 'Something is not right');
      });
    }, err=>{
      this.currentConfigDetails.showBanner = true;
      this.currentConfigDetails.message = (err?.error?.message || 'Something is not right');
    })
  }

  updateConfig() {
    this.samlConfigurationService.nextupdateConfiguration(true);
    this.close();
  }

  close() {
    this.router.navigate([{ outlets: { sb: `sb/settings/saml-configuration`, outer: null } }]);
  }

  fileChange(evt: Event) {
    if (evt !== undefined) {
      const target: DataTransfer = evt.target as unknown as DataTransfer;
      const file = target?.files[0];

      this.samlConfigFormGroup.patchValue({
        idpMetaDataImport: target?.files[0]
      });
      this.samlConfigFormGroup.patchValue({ fileName: file ? file?.name : '' });

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        this.parseXML(bstr).then((data: any) => {
          if (data) {
            this.samlConfigFormGroup.patchValue({
              idpXmlUrl: data?.EntityDescriptor?.$?.entityID ? data?.EntityDescriptor?.$?.entityID : '',
            });
            const roleDescriptor = data.EntityDescriptor.RoleDescriptor;
            roleDescriptor.forEach((element) => {
              if (element.$['xsi:type'] === 'fed:SecurityTokenServiceType') {
                this.allCertificateList = element.KeyDescriptor.map((keyDescriptor, i) => {
                  if (keyDescriptor.$.use === 'signing') {
                    const keyInfo = keyDescriptor.KeyInfo[0];
                    const certificateText = keyInfo?.X509Data[0]?.X509Certificate[0];
                    return {
                      certificateValue: `-----BEGIN CERTIFICATE----- ${certificateText} \n-----END CERTIFICATE-----`,
                      certificateName: `Certificate${i + 1}`,
                    };
                  }
                });
                this.allCertificateFilteredListOptions = of(this.allCertificateList);
              }
            });
          }
        });
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  parseXML(data) {
    return new Promise((resolve) => {
      const parser = new xml2js.Parser({
        trim: true,
        explicitArray: true,
      });
      parser.parseString(data,(err, result) => {
        resolve(result);
      });
    });
  }

  /**
   * Display the role , after selection
   * @param obj the current role object to get the desc
   * @returns will return the description as a string if have otherwise roleid
   */
  displayFn(obj): string {
    return obj.description || obj.uuid;
  }

  /**
   * Add the new row in the roles maping FormArray
   */
  addRow() {
    this.rolesMappingsArray.push(new FormGroup({
      ADRole: new FormControl('', Validators.required),
      mdoRole: new FormControl('',Validators.required)
    }))
  }

  /**
   * Remove the mapping from form array ...
   * @param idx index for removing the element from form array
   */
  removeRow(idx: number) {
    console.log(`Removing the row mapping from array for index `, idx);
    this.rolesMappingsArray.removeAt(idx);
  }
}
