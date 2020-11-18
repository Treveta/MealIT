// eslint-disable-next-line no-unused-vars
function checkEmail(email) {
  // Start valid and turn false if invalid
  let validEmail = true;

  // Message to tell people what is required
  const correctionMessage = "This email address is not valid. You need:\n'@'\nA domain name.\nExample: Al@gmail.com";

  // Split the email for checking purposes
  const AltEmail = email.split('');

  // Variables for the @ and domain
  let AtCheck = false;
  let DomainCheck = false;

  for (let i = 1; i < AltEmail.length - 3; i += 1) {
    // Check for @
    if (AltEmail[i] === '@') {
      AtCheck = true;
    }
    // Check for .com domain
    if (AtCheck === true && AltEmail[i] === '.' && AltEmail[i + 1] === 'c' && AltEmail[i + 2] === 'o' && AltEmail[i + 3] === 'm') {
      DomainCheck = true;
    }
    // Check for .net domain
    if (AtCheck === true && AltEmail[i] === '.' && AltEmail[i + 1] === 'n' && AltEmail[i + 2] === 'e' && AltEmail[i + 3] === 't') {
      DomainCheck = true;
    }
    // Check for .org domain
    // if (AtCheck == true && AltEmail[i] == '.'
    // && AltEmail[i + 1] == 'o' && AltEmail[i + 2] == 'r'
    // && AltEmail[i + 3] == 'g') {
    //     DomainCheck = true;
    // }
  }

  // Final Check that @ and domian are satisfied
  if (AtCheck === false || DomainCheck === false) {
    // log(AtCheck);
    // log(DomainCheck);
    validEmail = false;
  }

  // Send the correction message when false
  if (validEmail === false) {
    // eslint-disable-next-line no-alert
    alert(correctionMessage);
  }

  // Return if valid or not
  return validEmail;
}
