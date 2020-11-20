/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
function checkEmail(email) {
  validEmail = true;

  correctionMessage = 'This email address is not valid. You need:\n\'@\'\nA domain name.\nExample: Al@gmail.com';

  const AltEmail = email.split('');

  let AtCheck = false;
  let DomainCheck = false;

  for (i = 1; i < AltEmail.length - 4; i++) {
    // Check for @
    if (AltEmail[i] == '@') {
      AtCheck = true;
    }
    // Check for .com domain
    if (AtCheck == true && AltEmail[i] == '.' && AltEmail[i + 1] == 'c' && AltEmail[i + 2] == 'o' && AltEmail[i + 3] == 'm') {
      DomainCheck = true;
    }
    // Check for .net domain
    if (AtCheck == true && AltEmail[i] == '.' && AltEmail[i + 1] == 'n' && AltEmail[i + 2] == 'e' && AltEmail[i + 3] == 't') {
      DomainCheck = true;
    }
    // Check for .org domain
    // if (AtCheck == true && AltEmail[i] == '.' && AltEmail[i + 1] == 'o' && AltEmail[i + 2] == 'r' && AltEmail[i + 3] == 'g') {
    //     DomainCheck = true;
    // }
  }

  if (AtCheck == false || DomainCheck == false) {
    validEmail = false;
  }

  if (validEmail == false) {
    alert(correctionMessage);
  }

  return validEmail;
}
