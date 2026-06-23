require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function test() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('Fetching spreadsheet:', process.env.GOOGLE_SHEET_ID);
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    
    console.log('Success! Connected to:', response.data.properties.title);
    
    const rooms = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Rooms!A1:F5',
    });
    console.log('Rooms Data:', rooms.data.values);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
