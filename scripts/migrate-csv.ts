import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables manually for the script
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('Starting CSV migration...');
  const students: any[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('attendancesheetkamahan.csv')
      .pipe(csv({ headers: Array.from({ length: 300 }, (_, i) => String(i)) }))
      .on('data', (row) => {
        // Skip empty rows and the header row
        const campus = row['0']?.trim();
        if (!campus || campus === 'campus_name') return;

        // Clean and map data by index (based on manual inspection)
        const student = {
          campus_name: campus,
          roll_number: row['1']?.trim() || '',
          student_name: row['2']?.trim() || '',
          guardian_name: row['3']?.trim() || null,
          gender: row['4']?.trim() || null,
          shift: row['5']?.trim() || null,
          grade: row['6']?.trim() || null,
          room: row['7']?.trim() || 'Unassigned', // Default room as requested
          online_teacher: row['8']?.trim() || null,
          facilitator: row['9']?.trim() || null,
          pic: null, // Skipping pic URL due to CSV export misalignment
          
          // Aggregates
          sessions_present: parseInt(row['11']) || 0,
          sessions_absent: parseInt(row['12']) || 0,
          sessions_on_leave: 0,
          
          // Timeline
          first_attended: row['13']?.trim() || null,
          last_attended: row['14']?.trim() || null,
          last_attended_mo: row['15']?.trim() || null,
          bonus_eligibility: row['16']?.trim() || null,
        };

        if (student.roll_number && student.student_name) {
          students.push(student);
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${students.length} valid student records from CSV.`);
        
        // Batch insert into Supabase
        const BATCH_SIZE = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);
          
          const { error } = await supabase
            .from('master_attendance')
            .upsert(batch, { onConflict: 'campus_name,room,roll_number' });

          if (error) {
            console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
            errorCount += batch.length;
          } else {
            successCount += batch.length;
            console.log(`Successfully migrated ${successCount} / ${students.length} records...`);
          }
        }

        console.log('\n--- Migration Complete ---');
        console.log(`Successfully inserted/updated: ${successCount}`);
        console.log(`Failed: ${errorCount}`);
        resolve(true);
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        reject(err);
      });
  });
}

migrateData();
