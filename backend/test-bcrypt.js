const bcrypt = require('bcryptjs');

const hash = '$2b$10$yGqAiTAAt2/LwJ5N5.JC0utc7VWOSzT/uTGXFBE/Vkm2Il3Klqa0O';
const password = 'password123';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match:', result);
    console.log('Test:', result ? 'PASS' : 'FAIL');
  }
});
