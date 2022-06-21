export const ExistingConnectorsList = [
  // {
  //   title: 'SAP Odata',
  //   iconTitle: 'SAP',
  //   i18n_title: '@@sap_odata',
  //   height: 45,
  //   viewPort: '0 0 90 45',
  //   description: 'SAP description',
  //   subtitle: 'About this adapter',
  //   i18n_subtitle: '@@about_this_adaptor',
  //   selectLink: '#',
  //   isSelectedCard: false,
  // },
  // {
  //   title: 'SAP Webservices',
  //   iconTitle: 'SAP',
  //   i18n_title: '@@sap_webservices',
  //   height: 45,
  //   viewPort: '0 0 90 45',
  //   description: 'SAP description',
  //   subtitle: 'About this adapter',
  //   i18n_subtitle: '@@about_this_adaptor',
  //   selectLink: '#',
  //   isSelectedCard: false,
  // },
  {
    id: 'sap_cpi',
    title: 'SAP CPI',
    iconTitle: 'SAP',
    i18n_title: '@@sap_odata',
    height: 45,
    viewPort: '0 0 90 45',
    description: 'SAP description',
    subtitle: 'About this adapter',
    i18n_subtitle: '@@sap_odata_subtitle',
    selectLink: '#',
    isSelectedCard: false,
  },
  // {
  //   title: 'Salesforce',
  //   iconTitle: 'SALESFORCE',
  //   i18n_title: '@@salesForce',
  //   height: 65,
  //   viewPort: '0 0 92 65',
  //   description: 'Salesforce description',
  //   subtitle: 'About this adapter',
  //   i18n_subtitle: '@@about_this_adaptor',
  //   selectLink: '#',
  //   isSelectedCard: false,
  // },
];

export interface ConnectorDetails   {
  id: string;
  title: string;
  iconTitle: string;
  i18n_title: string;
  height: number;
  viewPort:  string;
  description:  string;
  subtitle:  string;
  i18n_subtitle:  string;
  selectLink: string;
  isSelectedCard: boolean,
}