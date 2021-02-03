/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
function checkPassword(password) {
  // Start valid, if invalde, turn false
  validPassword = true;
  console.log(password);

  // Message to inform the user about the requirements
  correctionMessage = 'The password should satisfy the following:\nBe 8 or more characters long\nContain 1 or more numebrs\nContain 1 or more \'*,#,?,/,$\'';

  const AltPassword = password.split('');
  console.log(AltPassword);

  // length check
  if (AltPassword.length < 8) {
    validPassword = false;
  }

  let passwordNum = false;
  let passwordSym = false;
  for (i = 0; i < AltPassword.length; i++) {
    // number check
    if (AltPassword[i] == '0' || AltPassword[i] == '1' || AltPassword[i] == '2' || AltPassword[i] == '3' || AltPassword[i] == '4' || AltPassword[i] == '5' || AltPassword[i] == '6' || AltPassword[i] == '7' || AltPassword[i] == '8' || AltPassword[i] == '9') {
      passwordNum = true;
    }
    // symbol check
    if (AltPassword[i] == '*' || AltPassword[i] == '#' || AltPassword[i] == '?' || AltPassword[i] == '/' || AltPassword[i] == '$' || AltPassword == '!') {
      passwordSym = true;
    }
  }

  if (passwordNum == false || passwordSym == false) {
    validPassword = false;
  }

  // If invalid
  if (validPassword == false) {
    alert(correctionMessage);
  }

  // return valid or not
  return validPassword;
}

;
//# sourceMappingURL=scripts.js.map