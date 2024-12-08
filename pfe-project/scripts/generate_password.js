const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Test123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password:', password);
    console.log('Hashed password:', hash);
}

generateHash();