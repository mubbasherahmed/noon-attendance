import { google } from "googleapis";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setFormulas() {
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

  // We want to insert ARRAYFORMULAs into row 11 of Attendance.
  // A11: Roll No -> 'Enrollment data'!A4:A
  // B11: Student Name -> 'Enrollment data'!B4:B
  // C11: Parent Name -> 'Enrollment data'!C4:C
  // D11: Shift -> 'Enrollment data'!H4:H
  // E11: Grade -> 'Enrollment data'!I4:I
  // F11: Room -> 'Enrollment data'!J4:J
  // G11: Online Teacher -> leave as is or empty? We'll leave it empty.
  // H11: Facilitator -> 'Enrollment data'!K4:K

  const updates = [
    { range: "Attendance!A11", value: "=ARRAYFORMULA('Enrollment data'!A4:A)" },
    { range: "Attendance!B11", value: "=ARRAYFORMULA('Enrollment data'!B4:B)" },
    { range: "Attendance!C11", value: "=ARRAYFORMULA('Enrollment data'!C4:C)" },
    { range: "Attendance!D11", value: "=ARRAYFORMULA('Enrollment data'!H4:H)" },
    { range: "Attendance!E11", value: "=ARRAYFORMULA('Enrollment data'!I4:I)" },
    { range: "Attendance!F11", value: "=ARRAYFORMULA('Enrollment data'!J4:J)" },
    { range: "Attendance!H11", value: "=ARRAYFORMULA('Enrollment data'!K4:K)" },
  ];

  console.log("Applying formulas...");
  
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

  console.log("Formulas applied successfully.");
}

setFormulas().catch(console.error);
