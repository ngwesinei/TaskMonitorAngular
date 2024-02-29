/**
 * session duration is in terms of second
 */

//var hostname:any ='172.19.181.1:80'; //gclappprd003.sembmarine.com:8443
var hostname:any = '10.38.18.84:8080';
var basename:any = 'http://'+hostname+'';

export const mcsConfig = {
  clientId: 'ZLbGiq3lQ6c7UsSLx9NSIw==08',
  clientSecret: 'wEPaUwAE/aCoKz0UOUR1OvOTsUy8sT/3SAaXULU2Za0=',
  environment: 'dev',
  hostname: hostname,

  weblogicLogin: basename + '/BSPMonitoring/oauth/token',
  weblogicLogout: basename +'/BSPMonitoring/user/logout',
  logHTTP: true,
 
};


