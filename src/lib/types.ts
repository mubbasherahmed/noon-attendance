// =============================================
// Attendance Management App — Type Definitions
// =============================================

export interface Campus {
  campusName: string;
  principalName: string;
  numberOfStudents: number;
  /** 1-indexed row number in the Google Sheet */
  rowIndex: number;
}

export interface Room {
  roomId: string;
  roomName: string;
  currentSheetName: string;
  campusName: string;
  /** 1-indexed row number in the Google Sheet (for updates) */
  rowIndex: number;
}

export interface Student {
  rollNumber: string;
  studentName: string;
  parentName: string;
  shift: string;
  grade: string;
  room: string;
  roomId?: string;
  onlineTeacher: string;
  facilitator: string;
  droppedOut: string;
  pic: string;
  status30D: string;
  campusName: string;
  todayStatus: "Present" | "Absent" | null;
  /** 1-indexed row number in the Google Sheet (for updates) */
  rowIndex: number;
}

export interface EnrollmentData {
  rollNumber: string;
  studentName: string;
  campusName: string;
  enrollmentDate: string;
  shift?: string;
  grade?: string;
  roomNumber?: string;
  roomId?: string;
  facilitator?: string;
  claimedAge: string;
  gender: string;
  isOrphan: string;
  deceasedParents: string;
  medicalConditionCategory: string;
  specifyMedicalCondition: string;
  doesStudentWork: string;
  studentWorkDetails: string;
  careerGoals: string;
  hobbies: string;
  ooscClassification: string;
  lastSchoolAttended: string;
  lastGradeCompleted: string;
  reasonForOos: string;
  religion: string;
  nationality: string;
  fatherName: string;
  relationship: string;
  fatherEducation: string;
  fatherProfession: string;
  fatherIncome: string;
  fatherCnic: string;
  fatherCnicCheck: string;
  numberOfSiblings: string;
  parentContactNumber: string;
  parentContactNumberCheck: string;
  motherName: string;
  motherEducation: string;
  motherProfession: string;
  motherIncome: string;
  motherCnic: string;
  motherCnicCheck: string;
  homeAddress: string;
  distanceToLearningCentre: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  highestLevelDocument: string;
  documentSubmitted: string;
  bFormNumber: string;
  bFormNumberCheck: string;
  dobOnBForm: string;
  currentAgeBForm: string;
  studentPictureUploaded: string;
  bFormUploaded: string;
  providedUniform: string;
  providedBooks: string;
  providedWorkbooks: string;
  studentProfileSorted: string;
  studentStatus30Days: string;
  enrollmentMonth: string;
  monthsSinceEnrollment: string;
  enrollmentWeek: string;
  firstAttended: string;
  lastAttended: string;
  rowIndex?: number;
}

export interface AttendanceUpdate {
  rollNumber: string;
  status: "Present" | "Absent" | null;
}

export interface BatchSaveRequest {
  date: string;
  updates: AttendanceUpdate[];
}

export interface BatchSaveResponse {
  success: boolean;
  updatedCount: number;
  errors?: string[];
}

export interface TransferRequest {
  studentId: string;
  sourceSheet: string;
  targetSheet: string;
  campusName: string;
}

export interface TransferResponse {
  success: boolean;
  merged: boolean;
  message: string;
}

export interface RoomSwapRequest {
  roomId: string;
  newSheetName: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
