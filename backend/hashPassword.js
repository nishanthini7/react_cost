
const bcrypt = require('bcryptjs'); // Import bcryptjs
const saltRounds = 10; // The cost factor for the hash function (10 is a good default)

const plainTextPassword = 'password123'; // Example password to hash

// Hash the password
bcrypt.hash(plainTextPassword, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hashedPassword);
});
