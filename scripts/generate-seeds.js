const fs = require('fs');
const path = require('path');

const seedsDir = path.resolve(__dirname, '../server/seeds');
if (!fs.existsSync(seedsDir)) {
  fs.mkdirSync(seedsDir, { recursive: true });
}

// 1. Small Dataset (1 section, 4 teachers, 3 rooms, 4 subjects including 1 lab)
const smallSeed = {
  name: "small",
  description: "Small single-section instance for quick sanity checks and unit tests",
  sections: [
    { name: "CS-A", department: "Computer Science", studentCount: 60 }
  ],
  rooms: [
    { name: "Lecture Hall 101", roomNumber: "LH-101", type: "Classroom", capacity: 70 },
    { name: "Lecture Hall 102", roomNumber: "LH-102", type: "Classroom", capacity: 65 },
    { name: "Software Lab 1", roomNumber: "LAB-1", type: "Laboratory", capacity: 60 }
  ],
  teachers: [
    { name: "Dr. Anurag Singh", teacherCode: "T01", teachableSubjectCodes: ["CS201", "CS201L"], maxWeeklyPeriods: 16 },
    { name: "Dr. Shelly Sachdeva", teacherCode: "T02", teachableSubjectCodes: ["CS202", "CS202L"], maxWeeklyPeriods: 16 },
    { name: "Dr. Chandra Prakash", teacherCode: "T03", teachableSubjectCodes: ["CS203"], maxWeeklyPeriods: 14 },
    { name: "Dr. Gautam Kumar", teacherCode: "T04", teachableSubjectCodes: ["CS204"], maxWeeklyPeriods: 14 }
  ],
  subjects: [
    { name: "Data Structures", code: "CS201", type: "Theory", sectionName: "CS-A", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "Data Structures Lab", code: "CS201L", type: "Lab", sectionName: "CS-A", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "Algorithms (CSBB 202)", code: "CS202", type: "Theory", sectionName: "CS-A", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 },
    { name: "Computer Architecture", code: "CS203", type: "Theory", sectionName: "CS-A", teacherCode: "T03", weeklySessions: 3, durationPeriods: 1 },
    { name: "Discrete Mathematics", code: "CS204", type: "Theory", sectionName: "CS-A", teacherCode: "T04", weeklySessions: 3, durationPeriods: 1 }
  ]
};

// 2. Medium Dataset (NIT Delhi Realistic DAA Project: 2 sections CS-A & CS-B, 8 teachers, 6 rooms, 14 subjects)
const mediumSeed = {
  name: "medium",
  description: "Realistic NIT Delhi DAA semester instance with 2 sections sharing teachers and labs",
  sections: [
    { name: "CSE-3A", department: "Computer Science & Engineering", studentCount: 60 },
    { name: "CSE-3B", department: "Computer Science & Engineering", studentCount: 58 }
  ],
  rooms: [
    { name: "Lecture Hall 101", roomNumber: "LH-101", type: "Classroom", capacity: 70 },
    { name: "Lecture Hall 102", roomNumber: "LH-102", type: "Classroom", capacity: 70 },
    { name: "Lecture Hall 201", roomNumber: "LH-201", type: "Classroom", capacity: 80 },
    { name: "Computing Lab 1", roomNumber: "COMP-LAB-1", type: "Laboratory", capacity: 65 },
    { name: "Computing Lab 2", roomNumber: "COMP-LAB-2", type: "Laboratory", capacity: 60 },
    { name: "Hardware & IoT Lab", roomNumber: "IOT-LAB", type: "Laboratory", capacity: 65 }
  ],
  teachers: [
    { name: "Dr. Anurag Singh", teacherCode: "T01", teachableSubjectCodes: ["CS201", "CS201L"], maxWeeklyPeriods: 16, preferredSlots: [{ day: 0, period: 0 }, { day: 1, period: 1 }] },
    { name: "Dr. Shelly Sachdeva", teacherCode: "T02", teachableSubjectCodes: ["CS202", "CS202L"], maxWeeklyPeriods: 18, preferredSlots: [{ day: 2, period: 3 }, { day: 3, period: 3 }] },
    { name: "Dr. Chandra Prakash", teacherCode: "T03", teachableSubjectCodes: ["CS203"], maxWeeklyPeriods: 14, preferredSlots: [] },
    { name: "Dr. Gautam Kumar", teacherCode: "T04", teachableSubjectCodes: ["CS204"], maxWeeklyPeriods: 16, preferredSlots: [] },
    { name: "Dr. Karan Verma", teacherCode: "T05", teachableSubjectCodes: ["CS205", "CS205L"], maxWeeklyPeriods: 18, preferredSlots: [] },
    { name: "Dr. Rishav Singh", teacherCode: "T06", teachableSubjectCodes: ["CS206"], maxWeeklyPeriods: 14, preferredSlots: [] },
    { name: "Dr. Divya Punia", teacherCode: "T07", teachableSubjectCodes: ["CS207"], maxWeeklyPeriods: 12, preferredSlots: [] },
    { name: "Dr. Pradeep Kumar", teacherCode: "T08", teachableSubjectCodes: ["CS208"], maxWeeklyPeriods: 12, preferredSlots: [] }
  ],
  subjects: [
    // Section CSE-3A
    { name: "Data Structures", code: "CS201", type: "Theory", sectionName: "CSE-3A", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "Data Structures Lab", code: "CS201L", type: "Lab", sectionName: "CSE-3A", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "DAA (CSBB 202)", code: "CS202", type: "Theory", sectionName: "CSE-3A", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 },
    { name: "DAA Lab", code: "CS202L", type: "Lab", sectionName: "CSE-3A", teacherCode: "T02", weeklySessions: 1, durationPeriods: 2 },
    { name: "Computer Architecture", code: "CS203", type: "Theory", sectionName: "CSE-3A", teacherCode: "T03", weeklySessions: 3, durationPeriods: 1 },
    { name: "Discrete Mathematics", code: "CS204", type: "Theory", sectionName: "CSE-3A", teacherCode: "T04", weeklySessions: 3, durationPeriods: 1 },
    { name: "Object Oriented Programming", code: "CS205", type: "Theory", sectionName: "CSE-3A", teacherCode: "T05", weeklySessions: 3, durationPeriods: 1 },
    { name: "OOP Lab", code: "CS205L", type: "Lab", sectionName: "CSE-3A", teacherCode: "T05", weeklySessions: 1, durationPeriods: 2 },

    // Section CSE-3B (shared teachers & labs)
    { name: "Data Structures", code: "CS201", type: "Theory", sectionName: "CSE-3B", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "Data Structures Lab", code: "CS201L", type: "Lab", sectionName: "CSE-3B", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "DAA (CSBB 202)", code: "CS202", type: "Theory", sectionName: "CSE-3B", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 },
    { name: "DAA Lab", code: "CS202L", type: "Lab", sectionName: "CSE-3B", teacherCode: "T02", weeklySessions: 1, durationPeriods: 2 },
    { name: "Computer Architecture", code: "CS203", type: "Theory", sectionName: "CSE-3B", teacherCode: "T03", weeklySessions: 3, durationPeriods: 1 },
    { name: "Discrete Mathematics", code: "CS204", type: "Theory", sectionName: "CSE-3B", teacherCode: "T04", weeklySessions: 3, durationPeriods: 1 },
    { name: "Object Oriented Programming", code: "CS205", type: "Theory", sectionName: "CSE-3B", teacherCode: "T05", weeklySessions: 3, durationPeriods: 1 },
    { name: "OOP Lab", code: "CS205L", type: "Lab", sectionName: "CSE-3B", teacherCode: "T05", weeklySessions: 1, durationPeriods: 2 }
  ]
};

// 3. Large Dataset (4 sections, 14 teachers, 10 rooms, 32 subjects)
const largeSeed = {
  name: "large",
  description: "Large multi-department benchmark instance (4 sections: CSE-3A, CSE-3B, IT-3A, ECE-3A)",
  sections: [
    { name: "CSE-3A", department: "CSE", studentCount: 60 },
    { name: "CSE-3B", department: "CSE", studentCount: 60 },
    { name: "IT-3A", department: "IT", studentCount: 55 },
    { name: "ECE-3A", department: "ECE", studentCount: 50 }
  ],
  rooms: [
    { name: "LH-101", roomNumber: "LH-101", type: "Classroom", capacity: 70 },
    { name: "LH-102", roomNumber: "LH-102", type: "Classroom", capacity: 70 },
    { name: "LH-103", roomNumber: "LH-103", type: "Classroom", capacity: 70 },
    { name: "LH-104", roomNumber: "LH-104", type: "Classroom", capacity: 70 },
    { name: "LH-201", roomNumber: "LH-201", type: "Classroom", capacity: 80 },
    { name: "LH-202", roomNumber: "LH-202", type: "Classroom", capacity: 80 },
    { name: "CS-LAB-1", roomNumber: "CS-LAB-1", type: "Laboratory", capacity: 65 },
    { name: "CS-LAB-2", roomNumber: "CS-LAB-2", type: "Laboratory", capacity: 65 },
    { name: "IT-LAB-1", roomNumber: "IT-LAB-1", type: "Laboratory", capacity: 60 },
    { name: "ECE-LAB-1", roomNumber: "ECE-LAB-1", type: "Laboratory", capacity: 55 }
  ],
  teachers: [
    { name: "Dr. T01", teacherCode: "T01", teachableSubjectCodes: ["CS201", "CS201L"], maxWeeklyPeriods: 18 },
    { name: "Dr. T02", teacherCode: "T02", teachableSubjectCodes: ["CS202", "CS202L"], maxWeeklyPeriods: 18 },
    { name: "Dr. T03", teacherCode: "T03", teachableSubjectCodes: ["CS203"], maxWeeklyPeriods: 18 },
    { name: "Dr. T04", teacherCode: "T04", teachableSubjectCodes: ["CS204"], maxWeeklyPeriods: 18 },
    { name: "Dr. T05", teacherCode: "T05", teachableSubjectCodes: ["CS205", "CS205L"], maxWeeklyPeriods: 18 },
    { name: "Dr. T06", teacherCode: "T06", teachableSubjectCodes: ["IT201", "IT201L"], maxWeeklyPeriods: 18 },
    { name: "Dr. T07", teacherCode: "T07", teachableSubjectCodes: ["IT202"], maxWeeklyPeriods: 18 },
    { name: "Dr. T08", teacherCode: "T08", teachableSubjectCodes: ["EC201", "EC201L"], maxWeeklyPeriods: 18 },
    { name: "Dr. T09", teacherCode: "T09", teachableSubjectCodes: ["EC202"], maxWeeklyPeriods: 18 },
    { name: "Dr. T10", teacherCode: "T10", teachableSubjectCodes: ["MA201"], maxWeeklyPeriods: 20 }
  ],
  subjects: [
    // CSE-3A
    { name: "DS", code: "CS201", type: "Theory", sectionName: "CSE-3A", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "DS Lab", code: "CS201L", type: "Lab", sectionName: "CSE-3A", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "DAA", code: "CS202", type: "Theory", sectionName: "CSE-3A", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 },
    { name: "DAA Lab", code: "CS202L", type: "Lab", sectionName: "CSE-3A", teacherCode: "T02", weeklySessions: 1, durationPeriods: 2 },
    { name: "Math", code: "MA201", type: "Theory", sectionName: "CSE-3A", teacherCode: "T10", weeklySessions: 3, durationPeriods: 1 },

    // CSE-3B
    { name: "DS", code: "CS201", type: "Theory", sectionName: "CSE-3B", teacherCode: "T01", weeklySessions: 3, durationPeriods: 1 },
    { name: "DS Lab", code: "CS201L", type: "Lab", sectionName: "CSE-3B", teacherCode: "T01", weeklySessions: 1, durationPeriods: 2 },
    { name: "DAA", code: "CS202", type: "Theory", sectionName: "CSE-3B", teacherCode: "T02", weeklySessions: 3, durationPeriods: 1 },
    { name: "DAA Lab", code: "CS202L", type: "Lab", sectionName: "CSE-3B", teacherCode: "T02", weeklySessions: 1, durationPeriods: 2 },
    { name: "Math", code: "MA201", type: "Theory", sectionName: "CSE-3B", teacherCode: "T10", weeklySessions: 3, durationPeriods: 1 },

    // IT-3A
    { name: "Web Tech", code: "IT201", type: "Theory", sectionName: "IT-3A", teacherCode: "T06", weeklySessions: 3, durationPeriods: 1 },
    { name: "Web Lab", code: "IT201L", type: "Lab", sectionName: "IT-3A", teacherCode: "T06", weeklySessions: 1, durationPeriods: 2 },
    { name: "DB Systems", code: "IT202", type: "Theory", sectionName: "IT-3A", teacherCode: "T07", weeklySessions: 3, durationPeriods: 1 },
    { name: "Math", code: "MA201", type: "Theory", sectionName: "IT-3A", teacherCode: "T10", weeklySessions: 3, durationPeriods: 1 },

    // ECE-3A
    { name: "Signals", code: "EC201", type: "Theory", sectionName: "ECE-3A", teacherCode: "T08", weeklySessions: 3, durationPeriods: 1 },
    { name: "Signals Lab", code: "EC201L", type: "Lab", sectionName: "ECE-3A", teacherCode: "T08", weeklySessions: 1, durationPeriods: 2 },
    { name: "Analog Circuits", code: "EC202", type: "Theory", sectionName: "ECE-3A", teacherCode: "T09", weeklySessions: 3, durationPeriods: 1 },
    { name: "Math", code: "MA201", type: "Theory", sectionName: "ECE-3A", teacherCode: "T10", weeklySessions: 3, durationPeriods: 1 }
  ]
};

// 4. Teacher Unavailable Seed (tests teacher availability matrix constraint H6)
const teacherUnavailableSeed = {
  name: "teacher_unavailable",
  description: "Teacher has tight availability matrix (available only 2 days)",
  sections: [{ name: "SEC-T-UNAVAIL", department: "CSE", studentCount: 50 }],
  rooms: [{ name: "Hall 1", roomNumber: "H-1", type: "Classroom", capacity: 60 }],
  teachers: [
    {
      name: "Dr. Busy",
      teacherCode: "T_BUSY",
      teachableSubjectCodes: ["BUSY101"],
      maxWeeklyPeriods: 10,
      availability: [
        [true, true, true, true, true, true, true, true, true],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false]
      ]
    }
  ],
  subjects: [
    { name: "Subject Busy", code: "BUSY101", type: "Theory", sectionName: "SEC-T-UNAVAIL", teacherCode: "T_BUSY", weeklySessions: 2, durationPeriods: 1 }
  ]
};

// 5. Full Room Capacity Seed (tests H4: room capacity exactly matches section size)
const fullRoomCapacitySeed = {
  name: "full_room_capacity",
  description: "Room capacity exactly matches section size (60 seats for 60 students)",
  sections: [{ name: "SEC-FULL-CAP", department: "CSE", studentCount: 60 }],
  rooms: [{ name: "Exact Hall", roomNumber: "EXACT-60", type: "Classroom", capacity: 60 }],
  teachers: [{ name: "Dr. Cap", teacherCode: "T_CAP", teachableSubjectCodes: ["CAP101"], maxWeeklyPeriods: 10 }],
  subjects: [{ name: "Capacity Test", code: "CAP101", type: "Theory", sectionName: "SEC-FULL-CAP", teacherCode: "T_CAP", weeklySessions: 3, durationPeriods: 1 }]
};

// 6. Shared Teacher Conflicts Seed (tests H1: 1 teacher for 2 sections simultaneously)
const sharedTeacherConflictsSeed = {
  name: "shared_teacher_conflicts",
  description: "Two sections taught by the same teacher; must never be assigned in the same slot",
  sections: [
    { name: "SEC-ST-1", department: "CSE", studentCount: 50 },
    { name: "SEC-ST-2", department: "CSE", studentCount: 50 }
  ],
  rooms: [
    { name: "Hall 1", roomNumber: "H-ST-1", type: "Classroom", capacity: 60 },
    { name: "Hall 2", roomNumber: "H-ST-2", type: "Classroom", capacity: 60 }
  ],
  teachers: [
    { name: "Dr. Shared", teacherCode: "T_SHARED", teachableSubjectCodes: ["ST101"], maxWeeklyPeriods: 14 }
  ],
  subjects: [
    { name: "Shared Subject A", code: "ST101", type: "Theory", sectionName: "SEC-ST-1", teacherCode: "T_SHARED", weeklySessions: 3, durationPeriods: 1 },
    { name: "Shared Subject B", code: "ST101", type: "Theory", sectionName: "SEC-ST-2", teacherCode: "T_SHARED", weeklySessions: 3, durationPeriods: 1 }
  ]
};

// 7. Shared Section Conflicts Seed (tests H2: section attending multiple subjects)
const sharedSectionConflictsSeed = {
  name: "shared_section_conflicts",
  description: "Single section with multiple subjects; sessions must never clash in the same slot",
  sections: [{ name: "SEC-SSC", department: "CSE", studentCount: 50 }],
  rooms: [
    { name: "Room 1", roomNumber: "R-SSC-1", type: "Classroom", capacity: 60 },
    { name: "Room 2", roomNumber: "R-SSC-2", type: "Classroom", capacity: 60 }
  ],
  teachers: [
    { name: "Dr. A", teacherCode: "T_A", teachableSubjectCodes: ["SUB_A"], maxWeeklyPeriods: 10 },
    { name: "Dr. B", teacherCode: "T_B", teachableSubjectCodes: ["SUB_B"], maxWeeklyPeriods: 10 }
  ],
  subjects: [
    { name: "Course A", code: "SUB_A", type: "Theory", sectionName: "SEC-SSC", teacherCode: "T_A", weeklySessions: 3, durationPeriods: 1 },
    { name: "Course B", code: "SUB_B", type: "Theory", sectionName: "SEC-SSC", teacherCode: "T_B", weeklySessions: 3, durationPeriods: 1 }
  ]
};

// 8. Labs Consecutive Periods Seed (tests H8/H9: 2-period lab cannot span lunch break)
const labsConsecutiveSeed = {
  name: "labs_needing_consecutive_periods",
  description: "Multi-period laboratory sessions that must occupy consecutive periods without break straddling",
  sections: [{ name: "SEC-LAB-CONSEC", department: "CSE", studentCount: 50 }],
  rooms: [{ name: "Lab Hall", roomNumber: "LAB-CONSEC", type: "Laboratory", capacity: 60 }],
  teachers: [{ name: "Dr. Lab", teacherCode: "T_LAB", teachableSubjectCodes: ["LAB201"], maxWeeklyPeriods: 10 }],
  subjects: [{ name: "Advanced Lab", code: "LAB201", type: "Lab", sectionName: "SEC-LAB-CONSEC", teacherCode: "T_LAB", weeklySessions: 2, durationPeriods: 2 }]
};

// 9. Insufficient Rooms Seed (tests bottleneck room capacity/availability)
const insufficientRoomsSeed = {
  name: "insufficient_rooms",
  description: "More simultaneous sessions than available rooms, forcing spread across days",
  sections: [
    { name: "SEC-IR-1", department: "CSE", studentCount: 50 },
    { name: "SEC-IR-2", department: "CSE", studentCount: 50 },
    { name: "SEC-IR-3", department: "CSE", studentCount: 50 }
  ],
  rooms: [
    { name: "Only Classroom", roomNumber: "ONLY-CR", type: "Classroom", capacity: 60 }
  ],
  teachers: [
    { name: "Dr. T1", teacherCode: "T_IR1", teachableSubjectCodes: ["IR101"], maxWeeklyPeriods: 10 },
    { name: "Dr. T2", teacherCode: "T_IR2", teachableSubjectCodes: ["IR102"], maxWeeklyPeriods: 10 },
    { name: "Dr. T3", teacherCode: "T_IR3", teachableSubjectCodes: ["IR103"], maxWeeklyPeriods: 10 }
  ],
  subjects: [
    { name: "Subject 1", code: "IR101", type: "Theory", sectionName: "SEC-IR-1", teacherCode: "T_IR1", weeklySessions: 4, durationPeriods: 1 },
    { name: "Subject 2", code: "IR102", type: "Theory", sectionName: "SEC-IR-2", teacherCode: "T_IR2", weeklySessions: 4, durationPeriods: 1 },
    { name: "Subject 3", code: "IR103", type: "Theory", sectionName: "SEC-IR-3", teacherCode: "T_IR3", weeklySessions: 4, durationPeriods: 1 }
  ]
};

// 10. Impossible Timetable Seed (tests infeasibility: 1 teacher with 1 single available slot but 2 sessions)
const impossibleTimetableSeed = {
  name: "impossible_timetable",
  description: "Strictly impossible schedule: teacher has only 1 available slot in the entire week but needs 3 sessions",
  sections: [{ name: "SEC-IMPOSSIBLE", department: "CSE", studentCount: 50 }],
  rooms: [{ name: "Hall", roomNumber: "H-IMP", type: "Classroom", capacity: 60 }],
  teachers: [
    {
      name: "Dr. Impossible",
      teacherCode: "T_IMPOSSIBLE",
      teachableSubjectCodes: ["IMP101"],
      maxWeeklyPeriods: 10,
      availability: [
        [true, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false]
      ]
    }
  ],
  subjects: [
    { name: "Impossible Course", code: "IMP101", type: "Theory", sectionName: "SEC-IMPOSSIBLE", teacherCode: "T_IMPOSSIBLE", weeklySessions: 3, durationPeriods: 1 }
  ]
};

const seeds = [
  smallSeed,
  mediumSeed,
  largeSeed,
  teacherUnavailableSeed,
  fullRoomCapacitySeed,
  sharedTeacherConflictsSeed,
  sharedSectionConflictsSeed,
  labsConsecutiveSeed,
  insufficientRoomsSeed,
  impossibleTimetableSeed
];

seeds.forEach(seed => {
  const filePath = path.join(seedsDir, `${seed.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), 'utf8');
  console.log(`Generated seed: ${seed.name}.json`);
});

console.log('All 10 seed datasets generated successfully in server/seeds/');
