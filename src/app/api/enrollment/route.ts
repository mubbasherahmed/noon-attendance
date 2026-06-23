import { NextRequest, NextResponse } from "next/server";
import { getSheetData, appendRow } from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rollNumber,
      studentName,
      campusName,
      enrollmentDate,
      shift,
      grade,
      roomNumber,
      roomId,
      facilitator,
      claimedAge,
      gender,
      isOrphan,
      deceasedParents,
      medicalConditionCategory,
      specifyMedicalCondition,
      doesStudentWork,
      studentWorkDetails,
      careerGoals,
      hobbies,
      ooscClassification,
      lastSchoolAttended,
      lastGradeCompleted,
      reasonForOos,
      religion,
      nationality,
      fatherName,
      relationship,
      fatherEducation,
      fatherProfession,
      fatherIncome,
      fatherCnic,
      fatherCnicCheck,
      numberOfSiblings,
      parentContactNumber,
      parentContactNumberCheck,
      motherName,
      motherEducation,
      motherProfession,
      motherIncome,
      motherCnic,
      motherCnicCheck,
      homeAddress,
      distanceToLearningCentre,
      emergencyContactName,
      emergencyContactNumber,
      highestLevelDocument,
      documentSubmitted,
      bFormNumber,
      bFormNumberCheck,
      dobOnBForm,
      currentAgeBForm,
      studentPictureUploaded,
      bFormUploaded,
      providedUniform,
      providedBooks,
      providedWorkbooks,
      studentProfileSorted,
      studentStatus30Days,
      enrollmentMonth,
      monthsSinceEnrollment,
      enrollmentWeek,
      firstAttended,
      lastAttended,
    } = body;

    if (!rollNumber || !studentName) {
      return NextResponse.json(
        { error: "Roll number and Student name are required" },
        { status: 400 }
      );
    }

    const rowData = [
      rollNumber,                           // A: Roll #
      studentName,                          // B: Student name
      null,                                 // C: Guardian's name (automated)
      null,                                 // D: Mother's name (automated)
      "",                                   // E: How did you find out
      "",                                   // F: Details of referrer
      enrollmentDate || "",                 // G: Enrollment date
      shift || "",                          // H: Shift
      grade || "",                          // I: Grade
      roomNumber || "",                     // J: Room#
      roomId || "",                         // K: Room ID
      facilitator || "",                    // L: Facilitator
      claimedAge || "",                     // M: Claimed age
      gender || "",                         // N: Gender
      isOrphan || "",                       // O: Is orphan
      deceasedParents || "",                // P: Deceased parents
      medicalConditionCategory || "",       // Q: Medical category
      specifyMedicalCondition || "",        // R: Medical condition
      doesStudentWork || "",                // S: Does student work
      studentWorkDetails || "",             // T: What work
      careerGoals || "",                    // U: Career goals
      hobbies || "",                        // V: Hobbies
      ooscClassification || "",             // W: OOSC class
      lastSchoolAttended || "",             // X: Last school
      lastGradeCompleted || "",             // Y: Last grade
      reasonForOos || "",                   // Z: Reason OOS
      religion || "",                       // AA: Religion
      nationality || "",                    // AB: Nationality
      fatherName || "",                     // AC: Father Name
      relationship || "",                   // AD: Relationship
      fatherEducation || "",                // AE: Father Ed
      fatherProfession || "",               // AF: Father Prof
      fatherIncome || "",                   // AG: Father Inc
      fatherCnic || "",                     // AH: Father CNIC
      fatherCnicCheck || "",                // AI: Father CNIC Check
      numberOfSiblings || "",               // AJ: Siblings
      parentContactNumber || "",            // AK: Contact
      parentContactNumberCheck || "",       // AL: Contact check
      motherName || "",                     // AM: Mother Name
      motherEducation || "",                // AN: Mother Ed
      motherProfession || "",               // AO: Mother Prof
      motherIncome || "",                   // AP: Mother Inc
      motherCnic || "",                     // AQ: Mother CNIC
      motherCnicCheck || "",                // AR: Mother CNIC Check
      homeAddress || "",                    // AS: Address
      distanceToLearningCentre || "",       // AT: Distance
      emergencyContactName || "",           // AU: Emerg Name
      emergencyContactNumber || "",         // AV: Emerg Number
      highestLevelDocument || "",           // AW: Doc level
      documentSubmitted || "",              // AX: Doc submitted
      bFormNumber || "",                    // AY: Bform
      bFormNumberCheck || "",               // AZ: Bform check
      dobOnBForm || "",                     // BA: DOB bform
      currentAgeBForm || "",                // BB: Age bform
      studentPictureUploaded || "",         // BC: Pic upload
      bFormUploaded || "",                  // BD: Bform upload
      providedUniform || "",                // BE: Uniform
      providedBooks || "",                  // BF: Books
      providedWorkbooks || "",              // BG: Workbooks
      studentProfileSorted || "",           // BH: Profile sorted
      studentStatus30Days || "",            // BI: Status 30d
      enrollmentMonth || "",                // BJ: Enroll month
      monthsSinceEnrollment || "",          // BK: Months since
      enrollmentWeek || "",                 // BL: Enroll week
      firstAttended || "",                  // BM: First attend
      lastAttended || "",                   // BN: Last attend
      campusName || ""                      // BO: Campus
    ];

    await appendRow("Enrollment data!A:BO", rowData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: "Failed to create enrollment record" },
      { status: 500 }
    );
  }
}
