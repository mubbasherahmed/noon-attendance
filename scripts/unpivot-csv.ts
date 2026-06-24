import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

async function unpivotCsv() {
  console.log('Starting CSV unpivot process...');

  const enrollments: any[] = [];
  const attendances: any[] = [];
  let headerMap: Record<string, string> = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream('attendancesheetkamahan.csv')
      .pipe(csv({ headers: Array.from({ length: 1000 }, (_, i) => String(i)) }))
      .on('data', (row) => {
        // Capture header row for date mapping
        if (row['0'] === 'campus_name') {
          headerMap = row;
          return;
        }

        const campus = row['0']?.trim();
        if (!campus || campus === '') return;

        const rollNumber = row['1']?.trim() || '';
        const studentName = row['2']?.trim() || '';
        const guardianName = row['3']?.trim() || '';
        const shift = row['5']?.trim() || '';
        const grade = row['6']?.trim() || '';
        const room = row['7']?.trim() || 'Unassigned';
        const onlineTeacher = row['8']?.trim() || '';
        const facilitator = row['9']?.trim() || '';

        if (!rollNumber || !studentName) return;

        // 1. Build Enrollment Record
        enrollments.push({
          campus_name: campus,
          roll_number: rollNumber,
          student_name: studentName,
          gaurdian_name: guardianName,
          gender: row['4']?.trim() || '',
          shift: shift,
          grade: grade,
          room: room,
          online_teacher: onlineTeacher,
          facilitator: facilitator,
          enrollment_date: '',
          age: '',
          contact_number: '',
          student_b_form_number: '',
          student_status: 'Active',
        });

        // 2. Build Attendance Records (Unpivot dates)
        // From index 50 to 999, if the header is a valid date-like string
        for (let i = 50; i < 1000; i++) {
          const key = String(i);
          const dateHeader = headerMap[key]?.trim();
          const status = row[key]?.trim();

          // Simple check if header looks like a date e.g. "11-Nov-2024" or "1-Jan-2026"
          if (dateHeader && dateHeader.match(/^\d{1,2}-[a-zA-Z]{3}-\d{4}$/) && status) {
            attendances.push({
              date: dateHeader,
              campus_name: campus,
              roll_number: rollNumber,
              student_name: studentName,
              gaurdian_name: guardianName,
              shift: shift,
              grade: grade,
              room: room,
              online_teacher: onlineTeacher,
              facilitator: facilitator,
              status: status,
            });
          }
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${enrollments.length} enrollments and generated ${attendances.length} attendance rows.`);

        // Write Enrollments CSV
        const enrollmentWriter = createObjectCsvWriter({
          path: 'enrollments.csv',
          header: [
            { id: 'campus_name', title: 'campus_name' },
            { id: 'roll_number', title: 'roll_number' },
            { id: 'student_name', title: 'student_name' },
            { id: 'gaurdian_name', title: 'gaurdian_name' },
            { id: 'gender', title: 'gender' },
            { id: 'shift', title: 'shift' },
            { id: 'grade', title: 'grade' },
            { id: 'room', title: 'room' },
            { id: 'online_teacher', title: 'online_teacher' },
            { id: 'facilitator', title: 'facilitator' },
            { id: 'enrollment_date', title: 'enrollment_date' },
            { id: 'age', title: 'age' },
            { id: 'contact_number', title: 'contact_number' },
            { id: 'student_b_form_number', title: 'student_b_form_number' },
            { id: 'student_status', title: 'student_status' },
          ]
        });

        await enrollmentWriter.writeRecords(enrollments);
        console.log('Successfully wrote enrollments.csv');

        // Write Attendance CSV
        const attendanceWriter = createObjectCsvWriter({
          path: 'attendance.csv',
          header: [
            { id: 'date', title: 'date' },
            { id: 'campus_name', title: 'campus_name' },
            { id: 'roll_number', title: 'roll_number' },
            { id: 'student_name', title: 'student_name' },
            { id: 'gaurdian_name', title: 'gaurdian_name' },
            { id: 'shift', title: 'shift' },
            { id: 'grade', title: 'grade' },
            { id: 'room', title: 'room' },
            { id: 'online_teacher', title: 'online_teacher' },
            { id: 'facilitator', title: 'facilitator' },
            { id: 'status', title: 'status' },
          ]
        });

        await attendanceWriter.writeRecords(attendances);
        console.log('Successfully wrote attendance.csv');

        resolve(true);
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        reject(err);
      });
  });
}

unpivotCsv();
