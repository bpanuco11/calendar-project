// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { ulid } = require('ulid');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); // To handle form data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Folder to save images
  },
  filename: (req, file, cb) => {
      // cb(null, Date.now() + '-' + file.originalname); // Unique file name
      const uniqueName = `${ulid()}-${file.originalname}`; 
      cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Declare a global variable for currentPath
let currentPath = '';

// Middleware to check if the user is authenticated
function checkAuthentication(req, res, next) {
  if (req.session.user_id) {
    // User is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // User is not authenticated, check the global currentPath variable
    if (currentPath === '/signup') {
      // Redirect to signup page if trying to access /signup
      res.redirect('/signup');
    } else {
      // Redirect to login page if trying to access any other protected route
      res.redirect('/login');
    }
  }
}

// Middleware to prevent caching for authenticated routes
function preventCache(req, res, next) {
  res.set('Cache-Control', 'no-store'); // Prevent caching
  res.set('Pragma', 'no-cache'); // For HTTP/1.0 compatibility
  res.set('Expires', '0'); // Immediately expire any cached content
  next();
}

// Route for login page
app.get('/login', (req, res) => {
  currentPath = '/login'; 
  res.render('login-page.ejs', { error: null });
  console.log('Login page loaded correctly');
});

// Route for signup page
app.get('/signup', (req, res) => {
  currentPath = '/signup'; 
  res.render('signup-page.ejs', { error: null });
  console.log('Signup page loaded correctly');
});

// Route for calendar page
app.get('/calendar', checkAuthentication, preventCache, async (req, res) => {
  currentPath = '/calendar'; 
  const userId = req.session.user_id;
``
  try {
    // Create a promise-based connection for this route
    const connection = await mysqlPromise.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });


    const [entries] = await connection.execute(
      'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ?',
      [userId]
    );
 
    const [journalCount] = await connection.execute(
      'SELECT journal_count FROM users WHERE user_id = ?',
      [userId]
    );
    
    const [profileImage] = await connection.execute(
      'SELECT username, profile_image FROM users WHERE user_id = ?',
      [userId]
    );
  
    await connection.end();
    res.render('calendar-page.ejs', { entries, journalCount, profileImage});

  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).send('Error loading the calendar');
  }
});

// Route for form logout function
app.get('/logout', async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error logging out');
      }
      res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name
      currentPath = '';
      res.redirect('/login');
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send('Error logging out');
  }
});

// Handle form submission for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  console.log('Login attempt:', username);

  connection.query(
    'SELECT user_id, password FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.render('login-page.ejs', { error: 'Database error. Please try again.' });
      }

      if (results.length === 0) {
        return res.render('login-page.ejs', { error: 'USERNAME DOES NOT EXIST' });
      }

      const { user_id, password: hashedPassword } = results[0];

      bcrypt.compare(password, hashedPassword, (err, match) => {
        if (err) {
          return res.render('login-page.ejs', { error: 'Login failed. Please try again.' });
        }

        if (match) {
          req.session.user_id = user_id;
          res.redirect('/calendar');
        } else {
          res.render('login-page.ejs', { error: 'PASSWORD INCORRECT' });
        }
      });
    }
  );
});

// Handle form submission for signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  connection.query(
    'SELECT username FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        return res.render('signup-page.ejs', { error: 'Database error. Please try again.' });
      }

      if (results.length > 0) {
        return res.render('signup-page.ejs', { error: 'USERNAME ALREADY TAKEN' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.render('signup-page.ejs', { error: 'Registration failed. Please try again.' });
        }

        const userId = ulid();

        connection.query(
          'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)',
          [userId, username, hashedPassword],
          (err) => {
            if (err) {
              return res.render('signup-page.ejs', { error: 'Registration failed. Please try again.' });
            }

            req.session.user_id = userId;
            res.redirect('/calendar');
          }
        );
      });
    }
  );
});

app.post('/save-entry', async (req, res) => {
  console.log('Received POST /save-entry');
  console.log('Request body:', req.body);

  const { title, content, label, date } = req.body;
  const userId = req.session.user_id || 1; // assuming you're using session and logged-in user

  // Validate that all necessary fields are provided
  if (!title || !content || !label || !date) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Insert entry into the database
    const query = `
      INSERT INTO entries (user_id, entry_date, entry_title, entry_input, entry_label)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.promise().query(query, [userId, date, title, content, label]);

    // Update the journal_count in the users table
    const updateQuery = `
      UPDATE users
      SET journal_count = journal_count + 1
      WHERE user_id = ?
    `;
    await connection.promise().execute(updateQuery, [userId]);

    // Respond with success
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving entry:', err);
    res.status(500).json({ success: false, message: 'Failed to save entry.' });
  }
});

app.post('/update-entry', (req, res) => {
  const { entry_id, entry_title, entry_input, entry_label } = req.body;

  // Here, you would use your database logic to update the entry in the 'entries' table
  const sql = `
      UPDATE entries 
      SET entry_title = ?, entry_input = ?, entry_label = ?
      WHERE entry_id = ?
  `;
  
  const values = [entry_title, entry_input, entry_label, entry_id];

  // Assuming you have a database connection pool
  connection.query(sql, values, (error, results) => {
      if (error) {
          console.error('Error updating entry:', error);
          res.status(500).json({ success: false, message: 'Failed to update entry' });
      } else {
          res.json({ success: true, message: 'Entry updated successfully' });
      }
  });
});

app.post('/upload', upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.session.user_id || 1; // Assuming you're using session and logged-in user
        console.log('On upload API Call!');
        
        // Ensure file exists
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        if (!userId) {
            return res.status(400).send('User ID is required.');
        }

        const imagePath = `/uploads/${req.file.filename}`; // Path to the new uploaded image
        console.log('File uploaded successfully:', req.file);
        console.log('Image Path:', imagePath);

        // Create a promise-based database connection
        const connection = await mysqlPromise.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Retrieve the old profile image path from the database
        const [[user]] = await connection.execute(
            'SELECT profile_image FROM users WHERE user_id = ?',
            [userId]
        );

        const oldImagePath = user?.profile_image ? path.join(__dirname, user.profile_image) : null;

        // Update the user's profile image in the database
        const query = 'UPDATE users SET profile_image = ? WHERE user_id = ?';
        await connection.execute(query, [imagePath, userId]);

        // Close the connection
        await connection.end();

        // Remove the old profile image if it exists
        if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error('Error deleting old profile image:', err);
                } else {
                    console.log('Old profile image deleted:', oldImagePath);
                }
            });
        }

        res.send({ message: 'Profile image updated successfully', path: imagePath });
    } catch (err) {
        console.error('Error updating profile image:', err);
        res.status(500).send('An error occurred while updating the profile image');
    }
});

app.delete('/delete-entry/:entry_id', (req, res) => {
  const entryId = req.params.entry_id;
  const userId = req.session.user_id || 1; // assuming you're using session and logged-in user
  
  if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required.' });
  }

  const query = 'DELETE FROM entries WHERE entry_id = ?';
  
  connection.query(query, [entryId], (err, results) => {
      if (err) {
          console.error('Error deleting entry:', err);
          return res.status(500).json({ success: false, message: 'Failed to delete entry.' });
      }
      
      if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Entry not found.' });
      }

      // res.json({ success: true, message: 'Entry deleted successfully.' });
  });

  const updateQuery = `
  UPDATE users
  SET journal_count = journal_count - 1
  WHERE user_id = ?
  `;
  connection.execute(updateQuery, [userId]);

  res.json({ success: true, message: 'Entry deleted successfully.' });
});

app.get('/update-day', async (req, res) => {
  const { date } = req.query;
  const userId = req.session.user_id;

  try {
      // Create the MySQL connection pool using mysql2/promise
      const connection = await mysqlPromise.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME
      });

      try {
          // Query the database for the user's entries on the specific date
          const [results] = await connection.execute(
              'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ? AND entry_date = ?',
              [userId, date]
          );

          // Return the entries as a JSON response
          res.json({ entries: results });
      } finally {
          // Close the connection after the query
          await connection.end();
      }
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error' });
  }
});

app.get('/entries', async (req, res) => {
  const userId = req.session.user_id;

  try {
    // Create a promise-based connection for better handling
    const connection = await mysqlPromise.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query for fetching the entries
    const [entries] = await connection.execute(
      'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ?',
      [userId]
    );

    // Query for fetching the journal_count
    const [journal_count ] = await connection.execute(
      'SELECT journal_count FROM users WHERE user_id = ?',
      [userId]
    );

    // Close the connection
    await connection.end();

    // Send both the entries and journal_count in the response
    res.json({ entries, journal_count });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});