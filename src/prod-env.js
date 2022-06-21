/**
 * Config file for set the environments in prod mode ... 
 * @author sandeep.rana
 */
(function (window) {
  window.__pros_env = window.__pros_env || {};

  /**
   * CKH endpoint ... 
   */
  const ckhLibUrl = 'https://dataplay.connekthub.com/api/v1.0';

  /**
   * mdo-auth endpoint ...
   */
  const authUrl = 'https://dev.masterdataonline.com';


  /**
   * Endpoint for drools MS 
   */
  const droolsUrl = 'https://secure-drools-dev.apps.rosa-sg.3xbl.p1.openshiftapps.com/business-central/kie-wb.jsp';

  /**
   * Endpoint for DAXE Editor 
   */
  const daxeEditorUrl = 'https://secure-daxe-dev.apps.rosa-sg.3xbl.p1.openshiftapps.com/editor.html';


  /**
   * Expose the endpoints to the global variable.... 
   */
   window.__pros_env.ckhLibUrl = ckhLibUrl;
   window.__pros_env.authUrl = authUrl;   
   window.__pros_env.droolsUrl = droolsUrl;
   window.__pros_env.daxeEditorUrl = daxeEditorUrl;
   

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__pros_env.enableDebug = true;
}(this));

