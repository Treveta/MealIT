// eslint-disable-next-line no-unused-vars
function checkPassword(password) {
  // Start valid, if invalde, turn false
  let validPassword = true;
  // console.log(password);

  // Message to inform the user about the requirements
  const correctionMessage = "The password should satisfy the following:\nBe 8 or more characters long\nContain 1 or more numebrs\nContain 1 or more '*,#,?,/,$'";

  // Split the password for checking purposes
  const AltPassword = password.split('');
  // console.log(AltPassword);

  // Length check
  if (AltPassword.length < 8) {
    validPassword = false;
  }

  // Variables to check for in the password
  let passwordNum = false;
  let passwordSym = false;
  let i = 0;

  for (i = 0; i < AltPassword.length; i += 1) {
    // Number check
    if (AltPassword[i] === '0' || AltPassword[i] === '1' || AltPassword[i] === '2' || AltPassword[i] === '3' || AltPassword[i] === '4' || AltPassword[i] === '5' || AltPassword[i] === '6' || AltPassword[i] === '7' || AltPassword[i] === '8' || AltPassword[i] === '9') {
      passwordNum = true;
    }
    // Symbol check
    if (AltPassword[i] === '*' || AltPassword[i] === '#' || AltPassword[i] === '?' || AltPassword[i] === '/' || AltPassword[i] === '$' || AltPassword === '!') {
      passwordSym = true;
    }
  }

  // Final Check to make sure password requirements are satisfied
  if (passwordNum === false || passwordSym === false) {
    validPassword = false;
  }

  // If invalid
  if (validPassword === false) {
    // eslint-disable-next-line no-alert
    alert(correctionMessage);
  }

  // Return valid or not
  return validPassword;
}
