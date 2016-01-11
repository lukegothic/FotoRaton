function login(callback) {
  FB.login(callback);
}
function loginCallback(response) {
  console.log('loginCallback',response);
  if(response.status != 'connected') {
    //top.location.href = 'https://www.facebook.com/appcenter/YOUR_APP_NAMESPACE';
    console.log("el usuario no quiere conectarse")
  }
}
function onStatusChange(response) {
  if( response.status != 'connected' ) {
    login(loginCallback);
  } else {
    //showHome();
    // TODO: Leaderboard etc
  }
}
function onAuthResponseChange(response) {
  console.log('onAuthResponseChange', response);
}