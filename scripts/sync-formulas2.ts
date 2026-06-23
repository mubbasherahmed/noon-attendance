import { google } from "googleapis";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function fixFormulas() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const updates = [
    { range: "Attendance!A11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!A4:A, \"\"))" },
    { range: "Attendance!B11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!B4:B, \"\"))" },
    { range: "Attendance!C11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!C4:C, \"\"))" },
    
    // D is hidden. Clear my previous mistake
    { range: "Attendance!D11", value: "" },
    
    // E is Shift, F is Grade, G is Room
    { range: "Attendance!E11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!H4:H, \"\"))" },
    { range: "Attendance!F11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!I4:I, \"\"))" },
    { range: "Attendance!G11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!J4:J, \"\"))" },
    
    // H is Online Teacher, I made a mistake here previously. Clear it.
    { range: "Attendance!H11", value: "" },
    
    // I is Facilitator
    { range: "Attendance!I11", value: "=ARRAYFORMULA(IF('Enrollment data'!A4:A<>\"\", 'Enrollment data'!L4:L, \"\"))" },
  ];

  console.log("Applying corrected formulas...");
  
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates.map((u) => ({
        range: u.range,
        values: [[u.value]],
      })),
    },
  });

  console.log("Corrected formulas applied successfully.");
}

fixFormulas().catch(console.error);
