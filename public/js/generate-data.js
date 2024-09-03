const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',   // Replace with your MySQL username
  password: 'bp880427',   // Replace with your MySQL password
  database: 'user_auth'
});

// Sample users and their plain-text passwords
const users = [
  { username: 'user1', password: 'password123' },
  { username: 'user2', password: 'mysecurepassword' },
  { username: 'user3', password: 'password456' }
];

// Function to hash passwords and insert users
async function insertSampleData() {
  try {
    await connection.promise().connect();

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.promise().query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [user.username, hashedPassword]
      );
      console.log(`Inserted user: ${user.username}`);
    }

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    connection.end();
  }
}

insertSampleData();
