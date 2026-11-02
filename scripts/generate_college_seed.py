import json

# Batches: CSE CS1 & CS2 for all 4 years, plus 6 other branches across years
sections = [
    # 1st Year
    {'name': 'CSE-1st-CS1', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'CSE-1st-CS2', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'IT-1st', 'department': 'Information Technology', 'studentCount': 70},
    {'name': 'AIDS-1st', 'department': 'AI & Data Science', 'studentCount': 70},
    {'name': 'ECE-1st', 'department': 'Electronics', 'studentCount': 70},
    {'name': 'EE-1st', 'department': 'Electrical', 'studentCount': 65},
    {'name': 'ME-1st', 'department': 'Mechanical', 'studentCount': 65},
    {'name': 'CE-1st', 'department': 'Civil', 'studentCount': 60},

    # 2nd Year
    {'name': 'CSE-2nd-CS1', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'CSE-2nd-CS2', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'IT-2nd', 'department': 'Information Technology', 'studentCount': 70},
    {'name': 'AIDS-2nd', 'department': 'AI & Data Science', 'studentCount': 70},
    {'name': 'ECE-2nd', 'department': 'Electronics', 'studentCount': 70},
    {'name': 'EE-2nd', 'department': 'Electrical', 'studentCount': 65},
    {'name': 'ME-2nd', 'department': 'Mechanical', 'studentCount': 65},
    {'name': 'CE-2nd', 'department': 'Civil', 'studentCount': 60},

    # 3rd Year
    {'name': 'CSE-3rd-CS1', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'CSE-3rd-CS2', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'ECE-3rd', 'department': 'Electronics', 'studentCount': 70},
    {'name': 'EE-3rd', 'department': 'Electrical', 'studentCount': 65},
    {'name': 'ME-3rd', 'department': 'Mechanical', 'studentCount': 65},

    # 4th Year
    {'name': 'CSE-4th-CS1', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'CSE-4th-CS2', 'department': 'Computer Science', 'studentCount': 70},
    {'name': 'ECE-4th', 'department': 'Electronics', 'studentCount': 70},
    {'name': 'ME-4th', 'department': 'Mechanical', 'studentCount': 65}
]

rooms = [
    # Lecture Halls (Classrooms for common Theory, capacity 75-80)
    {'name': 'Lecture Hall 101', 'roomNumber': 'LH-101', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 102', 'roomNumber': 'LH-102', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 103', 'roomNumber': 'LH-103', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 104', 'roomNumber': 'LH-104', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 105', 'roomNumber': 'LH-105', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 106', 'roomNumber': 'LH-106', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 201', 'roomNumber': 'LH-201', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 202', 'roomNumber': 'LH-202', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 203', 'roomNumber': 'LH-203', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 204', 'roomNumber': 'LH-204', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 205', 'roomNumber': 'LH-205', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 206', 'roomNumber': 'LH-206', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 301', 'roomNumber': 'LH-301', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 302', 'roomNumber': 'LH-302', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 303', 'roomNumber': 'LH-303', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 304', 'roomNumber': 'LH-304', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 305', 'roomNumber': 'LH-305', 'type': 'Classroom', 'capacity': 75},
    {'name': 'Lecture Hall 306', 'roomNumber': 'LH-306', 'type': 'Classroom', 'capacity': 75},

    # Small Specialized Laboratories (Capacity 38 for 35-student half-batch groups G1 and G2)
    {'name': 'Computer Science Lab 1', 'roomNumber': 'CSLAB-1', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'Computer Science Lab 2', 'roomNumber': 'CSLAB-2', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'Computer Science Lab 3', 'roomNumber': 'CSLAB-3', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'AI & Data Science Lab', 'roomNumber': 'AIDSLAB', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'Software Engineering Lab', 'roomNumber': 'SWLAB', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'Web Technologies Lab', 'roomNumber': 'WEBLAB', 'type': 'ComputerLab', 'capacity': 38},
    {'name': 'Electronics Circuits Lab', 'roomNumber': 'ECLAB-1', 'type': 'ElectronicsLab', 'capacity': 38},
    {'name': 'Communication Systems Lab', 'roomNumber': 'ECLAB-2', 'type': 'ElectronicsLab', 'capacity': 38},
    {'name': 'VLSI & Embedded Lab', 'roomNumber': 'VLSILAB', 'type': 'ElectronicsLab', 'capacity': 38},
    {'name': 'Electrical Machines Lab', 'roomNumber': 'EELAB-1', 'type': 'ElectricalLab', 'capacity': 38},
    {'name': 'Power Systems Lab', 'roomNumber': 'EELAB-2', 'type': 'ElectricalLab', 'capacity': 38},
    {'name': 'Mechanical Workshop 1', 'roomNumber': 'MEWK-1', 'type': 'MechanicalWorkshop', 'capacity': 38},
    {'name': 'Mechanical Workshop 2', 'roomNumber': 'MEWK-2', 'type': 'MechanicalWorkshop', 'capacity': 38},
    {'name': 'Thermal & Fluid Lab', 'roomNumber': 'TFLAB', 'type': 'MechanicalWorkshop', 'capacity': 38},
    {'name': 'Civil Surveying Lab', 'roomNumber': 'CIVILLAB', 'type': 'CivilLab', 'capacity': 38},
    {'name': 'Concrete Testing Lab', 'roomNumber': 'CONCLAB', 'type': 'CivilLab', 'capacity': 38},
    {'name': 'Engineering Physics Lab', 'roomNumber': 'PHYLAB', 'type': 'PhysicsLab', 'capacity': 38},
    {'name': 'Engineering Chemistry Lab', 'roomNumber': 'CHMLAB', 'type': 'ChemistryLab', 'capacity': 38},

    # Dedicated Sports Grounds & Complexes
    {'name': 'Sports Ground Main', 'roomNumber': 'SPORTS-1', 'type': 'SportsGround', 'capacity': 300},
    {'name': 'Sports Ground East', 'roomNumber': 'SPORTS-2', 'type': 'SportsGround', 'capacity': 300},
    {'name': 'Indoor Sports Arena 1', 'roomNumber': 'SPORTS-3', 'type': 'SportsGround', 'capacity': 200},
    {'name': 'Indoor Sports Arena 2', 'roomNumber': 'SPORTS-4', 'type': 'SportsGround', 'capacity': 200}
]

# Teachers across departments with qualified subject codes
teachers = [
    # CS & IT (T01 - T08)
    {'name': 'Dr. Anurag Singh', 'teacherCode': 'T01', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CS101', 'CS101L-G1', 'CS101L-G2', 'CS201', 'CS201L-G1', 'CS201L-G2', 'CS301']},
    {'name': 'Dr. Shelly Sachdeva', 'teacherCode': 'T02', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CS102', 'CS102L-G1', 'CS102L-G2', 'CS202', 'CS202L-G1', 'CS202L-G2']},
    {'name': 'Dr. Chandra Prakash', 'teacherCode': 'T03', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CS103', 'CS203', 'CS401']},
    {'name': 'Dr. Gautam Kumar', 'teacherCode': 'T04', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CS104', 'CS104L-G1', 'CS104L-G2', 'CS204', 'CS204L-G1', 'CS204L-G2']},
    {'name': 'Prof. Ananya Das', 'teacherCode': 'T05', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['IT101', 'IT101L-G1', 'IT101L-G2', 'IT201', 'CS301L-G1', 'CS301L-G2']},
    {'name': 'Dr. Rohit Bansal', 'teacherCode': 'T06', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['IT102', 'IT202', 'IT202L-G1', 'IT202L-G2', 'CS402']},
    {'name': 'Dr. Sneha Roy', 'teacherCode': 'T07', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['AI101', 'AI101L-G1', 'AI101L-G2', 'AI201', 'AI201L-G1', 'AI201L-G2']},
    {'name': 'Prof. Karan Kapoor', 'teacherCode': 'T08', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['AI102', 'AI202', 'CS302', 'CS302L-G1', 'CS302L-G2']},

    # ECE (T09 - T13)
    {'name': 'Dr. Sunita Verma', 'teacherCode': 'T09', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EC101', 'EC101L-G1', 'EC101L-G2', 'EC201', 'EC201L-G1', 'EC201L-G2']},
    {'name': 'Dr. Vikram Joshi', 'teacherCode': 'T10', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EC102', 'EC202', 'EC202L-G1', 'EC202L-G2', 'EC301', 'EC301L-G1', 'EC301L-G2']},
    {'name': 'Prof. Neelam Gupta', 'teacherCode': 'T11', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EC103', 'EC203', 'EC401']},
    {'name': 'Dr. Amit Trivedi', 'teacherCode': 'T12', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EC104', 'EC104L-G1', 'EC104L-G2', 'EC302']},
    {'name': 'Dr. Ritu Agarwal', 'teacherCode': 'T13', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EC204', 'EC204L-G1', 'EC204L-G2', 'EC402']},

    # EE (T14 - T17)
    {'name': 'Prof. Sanjay Kulkarni', 'teacherCode': 'T14', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EE101', 'EE101L-G1', 'EE101L-G2', 'EE201', 'EE201L-G1', 'EE201L-G2']},
    {'name': 'Dr. Harish Rawat', 'teacherCode': 'T15', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EE102', 'EE202', 'EE202L-G1', 'EE202L-G2', 'EE301']},
    {'name': 'Dr. Meenakshi Sundaram', 'teacherCode': 'T16', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EE103', 'EE203', 'EE302']},
    {'name': 'Prof. Alok Sen', 'teacherCode': 'T17', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['EE104', 'EE104L-G1', 'EE104L-G2', 'EE204']},

    # ME (T18 - T22)
    {'name': 'Dr. Anil Sharma', 'teacherCode': 'T18', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['ME101', 'ME101L-G1', 'ME101L-G2', 'ME201', 'ME201L-G1', 'ME201L-G2']},
    {'name': 'Dr. Priya Nair', 'teacherCode': 'T19', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['ME102', 'ME202', 'ME202L-G1', 'ME202L-G2', 'ME301']},
    {'name': 'Prof. Rajesh Khanna', 'teacherCode': 'T20', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['ME103', 'ME203', 'ME302', 'ME302L-G1', 'ME302L-G2']},
    {'name': 'Dr. Suresh Reddy', 'teacherCode': 'T21', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['ME104', 'ME104L-G1', 'ME104L-G2', 'ME401']},
    {'name': 'Dr. Divya Chauhan', 'teacherCode': 'T22', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['ME204', 'ME402']},

    # Civil (T23 - T25)
    {'name': 'Dr. Ramesh Choudhary', 'teacherCode': 'T23', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CE101', 'CE101L-G1', 'CE101L-G2', 'CE201', 'CE201L-G1', 'CE201L-G2']},
    {'name': 'Prof. Vandana Mehta', 'teacherCode': 'T24', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CE102', 'CE202', 'CE202L-G1', 'CE202L-G2']},
    {'name': 'Dr. Tarun Bhatia', 'teacherCode': 'T25', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CE103', 'CE203']},

    # Math, Physics, Chemistry, Humanities, Sports (T26 - T36)
    {'name': 'Prof. Raghav Mehra', 'teacherCode': 'T26', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['MA101', 'MA201']},
    {'name': 'Dr. Sangeeta Rao', 'teacherCode': 'T27', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['MA102', 'MA202']},
    {'name': 'Dr. Kavita Rao', 'teacherCode': 'T28', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['PH101', 'PH101L-G1', 'PH101L-G2', 'PH201']},
    {'name': 'Prof. Manoj Mishra', 'teacherCode': 'T29', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['CH101', 'CH101L-G1', 'CH101L-G2']},
    {'name': 'Dr. Shalini Saxena', 'teacherCode': 'T30', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['HS101', 'HS201', 'HS301']},
    {'name': 'Coach Deepak Sharma', 'teacherCode': 'T31', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['SPORTS-G1', 'SPORTS-G2', 'SPORTS']},
    {'name': 'Coach Virendra Singh', 'teacherCode': 'T32', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['SPORTS-G1', 'SPORTS-G2', 'SPORTS']},
    {'name': 'Coach Neha Malik', 'teacherCode': 'T33', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['SPORTS-G1', 'SPORTS-G2', 'SPORTS']},
    {'name': 'Dr. K. S. Sharma', 'teacherCode': 'T34', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['MA101', 'MA201']},
    {'name': 'Dr. Sunita Saxena', 'teacherCode': 'T35', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['MA101', 'MA301']},
    {'name': 'Coach Rajesh Rawat', 'teacherCode': 'T36', 'maxWeeklyPeriods': 24, 'teachableSubjectCodes': ['SPORTS-G1', 'SPORTS-G2', 'SPORTS']}
]

# Curricula: Common Theory for full batch (in Classroom), Labs split into G1 & G2 for small labs
batch_curricula = {
    # 1st Year CSE (CS1 & CS2)
    'CSE-1st-CS1': [
        ('Programming & Problem Solving', 'CS101', 'Theory', 'T01', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T26', 3, 1, 'Classroom'),
        ('Engineering Physics', 'PH101', 'Theory', 'T28', 3, 1, 'Classroom'),
        ('Communication Skills', 'HS101', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Programming Lab (Group 1)', 'CS101L-G1', 'Lab', 'T01', 1, 2, 'ComputerLab'),
        ('Programming Lab (Group 2)', 'CS101L-G2', 'Lab', 'T01', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'CSE-1st-CS2': [
        ('Digital Logic Design', 'CS102', 'Theory', 'T02', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T34', 3, 1, 'Classroom'),
        ('Discrete Mathematics', 'CS103', 'Theory', 'T03', 3, 1, 'Classroom'),
        ('Communication Skills', 'HS101', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Digital Logic Lab (Group 1)', 'CS102L-G1', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('Digital Logic Lab (Group 2)', 'CS102L-G2', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T36', 1, 2, 'SportsGround')
    ],
    'IT-1st': [
        ('IT Fundamentals', 'IT101', 'Theory', 'T05', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T35', 3, 1, 'Classroom'),
        ('Web Basics', 'IT102', 'Theory', 'T06', 3, 1, 'Classroom'),
        ('IT Workshop Lab (Group 1)', 'IT101L-G1', 'Lab', 'T05', 1, 2, 'ComputerLab'),
        ('IT Workshop Lab (Group 2)', 'IT101L-G2', 'Lab', 'T05', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T32', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'AIDS-1st': [
        ('Intro to AI & Python', 'AI101', 'Theory', 'T07', 3, 1, 'Classroom'),
        ('Mathematical Foundations', 'MA102', 'Theory', 'T27', 3, 1, 'Classroom'),
        ('Data Exploration', 'AI102', 'Theory', 'T08', 3, 1, 'Classroom'),
        ('AI Programming Lab (Group 1)', 'AI101L-G1', 'Lab', 'T07', 1, 2, 'ComputerLab'),
        ('AI Programming Lab (Group 2)', 'AI101L-G2', 'Lab', 'T07', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T36', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'ECE-1st': [
        ('Basic Electronics', 'EC101', 'Theory', 'T09', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T26', 3, 1, 'Classroom'),
        ('Signals Primer', 'EC102', 'Theory', 'T10', 3, 1, 'Classroom'),
        ('Electronics Lab (Group 1)', 'EC101L-G1', 'Lab', 'T09', 1, 2, 'ElectronicsLab'),
        ('Electronics Lab (Group 2)', 'EC101L-G2', 'Lab', 'T09', 1, 2, 'ElectronicsLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'EE-1st': [
        ('Electric Circuit Analysis', 'EE101', 'Theory', 'T14', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T34', 3, 1, 'Classroom'),
        ('Electromagnetics', 'EE102', 'Theory', 'T15', 3, 1, 'Classroom'),
        ('Circuits Lab (Group 1)', 'EE101L-G1', 'Lab', 'T14', 1, 2, 'ElectricalLab'),
        ('Circuits Lab (Group 2)', 'EE101L-G2', 'Lab', 'T14', 1, 2, 'ElectricalLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T36', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'ME-1st': [
        ('Engineering Mechanics', 'ME101', 'Theory', 'T18', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T35', 3, 1, 'Classroom'),
        ('Material Science', 'ME102', 'Theory', 'T19', 3, 1, 'Classroom'),
        ('Workshop Practice (Group 1)', 'ME101L-G1', 'Lab', 'T18', 1, 2, 'MechanicalWorkshop'),
        ('Workshop Practice (Group 2)', 'ME101L-G2', 'Lab', 'T18', 1, 2, 'MechanicalWorkshop'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'CE-1st': [
        ('Basic Surveying', 'CE101', 'Theory', 'T23', 3, 1, 'Classroom'),
        ('Calculus & Linear Algebra', 'MA101', 'Theory', 'T26', 3, 1, 'Classroom'),
        ('Building Materials', 'CE102', 'Theory', 'T24', 3, 1, 'Classroom'),
        ('Surveying Lab (Group 1)', 'CE101L-G1', 'Lab', 'T23', 1, 2, 'CivilLab'),
        ('Surveying Lab (Group 2)', 'CE101L-G2', 'Lab', 'T23', 1, 2, 'CivilLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T36', 1, 2, 'SportsGround'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],

    # 2nd Year CSE (CS1 & CS2)
    'CSE-2nd-CS1': [
        ('Data Structures & Algorithms', 'CS201', 'Theory', 'T01', 3, 1, 'Classroom'),
        ('Database Management Systems', 'CS202', 'Theory', 'T02', 3, 1, 'Classroom'),
        ('Computer Networks', 'CS203', 'Theory', 'T03', 3, 1, 'Classroom'),
        ('DSA Lab (Group 1)', 'CS201L-G1', 'Lab', 'T01', 1, 2, 'ComputerLab'),
        ('DSA Lab (Group 2)', 'CS201L-G2', 'Lab', 'T01', 1, 2, 'ComputerLab'),
        ('DBMS Lab (Group 1)', 'CS202L-G1', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('DBMS Lab (Group 2)', 'CS202L-G2', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],
    'CSE-2nd-CS2': [
        ('Operating Systems', 'CS204', 'Theory', 'T04', 3, 1, 'Classroom'),
        ('Database Management Systems', 'CS202', 'Theory', 'T02', 3, 1, 'Classroom'),
        ('Probability & Statistics', 'MA201', 'Theory', 'T34', 3, 1, 'Classroom'),
        ('OS Lab (Group 1)', 'CS204L-G1', 'Lab', 'T04', 1, 2, 'ComputerLab'),
        ('OS Lab (Group 2)', 'CS204L-G2', 'Lab', 'T04', 1, 2, 'ComputerLab'),
        ('DBMS Lab (Group 1)', 'CS202L-G1', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('DBMS Lab (Group 2)', 'CS202L-G2', 'Lab', 'T02', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T36', 1, 2, 'SportsGround')
    ],
    'IT-2nd': [
        ('Web Technologies', 'IT201', 'Theory', 'T05', 3, 1, 'Classroom'),
        ('Database Management Systems', 'CS202', 'Theory', 'T02', 3, 1, 'Classroom'),
        ('Software Engineering', 'IT202', 'Theory', 'T06', 3, 1, 'Classroom'),
        ('Web Tech Lab (Group 1)', 'IT202L-G1', 'Lab', 'T06', 1, 2, 'ComputerLab'),
        ('Web Tech Lab (Group 2)', 'IT202L-G2', 'Lab', 'T06', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'AIDS-2nd': [
        ('Machine Learning Foundations', 'AI201', 'Theory', 'T07', 3, 1, 'Classroom'),
        ('Data Structures & Algorithms', 'CS201', 'Theory', 'T01', 3, 1, 'Classroom'),
        ('Data Mining & Analytics', 'AI202', 'Theory', 'T08', 3, 1, 'Classroom'),
        ('ML Lab (Group 1)', 'AI201L-G1', 'Lab', 'T07', 1, 2, 'ComputerLab'),
        ('ML Lab (Group 2)', 'AI201L-G2', 'Lab', 'T07', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],
    'ECE-2nd': [
        ('Analog Electronic Circuits', 'EC201', 'Theory', 'T09', 3, 1, 'Classroom'),
        ('Digital Communication', 'EC202', 'Theory', 'T10', 3, 1, 'Classroom'),
        ('Electromagnetic Fields', 'EC203', 'Theory', 'T11', 3, 1, 'Classroom'),
        ('Analog Circuits Lab (Group 1)', 'EC201L-G1', 'Lab', 'T09', 1, 2, 'ElectronicsLab'),
        ('Analog Circuits Lab (Group 2)', 'EC201L-G2', 'Lab', 'T09', 1, 2, 'ElectronicsLab'),
        ('Comm Lab (Group 1)', 'EC202L-G1', 'Lab', 'T10', 1, 2, 'ElectronicsLab'),
        ('Comm Lab (Group 2)', 'EC202L-G2', 'Lab', 'T10', 1, 2, 'ElectronicsLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'EE-2nd': [
        ('Electrical Machines-I', 'EE201', 'Theory', 'T14', 3, 1, 'Classroom'),
        ('Power Systems-I', 'EE202', 'Theory', 'T15', 3, 1, 'Classroom'),
        ('Control Systems', 'EE203', 'Theory', 'T16', 3, 1, 'Classroom'),
        ('Machines Lab (Group 1)', 'EE201L-G1', 'Lab', 'T14', 1, 2, 'ElectricalLab'),
        ('Machines Lab (Group 2)', 'EE201L-G2', 'Lab', 'T14', 1, 2, 'ElectricalLab'),
        ('Power Lab (Group 1)', 'EE202L-G1', 'Lab', 'T15', 1, 2, 'ElectricalLab'),
        ('Power Lab (Group 2)', 'EE202L-G2', 'Lab', 'T15', 1, 2, 'ElectricalLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'ME-2nd': [
        ('Applied Thermodynamics', 'ME201', 'Theory', 'T18', 3, 1, 'Classroom'),
        ('Fluid Mechanics', 'ME202', 'Theory', 'T19', 3, 1, 'Classroom'),
        ('Manufacturing Processes', 'ME203', 'Theory', 'T20', 3, 1, 'Classroom'),
        ('Thermal Lab (Group 1)', 'ME201L-G1', 'Lab', 'T18', 1, 2, 'MechanicalWorkshop'),
        ('Thermal Lab (Group 2)', 'ME201L-G2', 'Lab', 'T18', 1, 2, 'MechanicalWorkshop'),
        ('Fluid Lab (Group 1)', 'ME202L-G1', 'Lab', 'T19', 1, 2, 'MechanicalWorkshop'),
        ('Fluid Lab (Group 2)', 'ME202L-G2', 'Lab', 'T19', 1, 2, 'MechanicalWorkshop'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],
    'CE-2nd': [
        ('Structural Analysis', 'CE201', 'Theory', 'T23', 3, 1, 'Classroom'),
        ('Geotechnical Engineering', 'CE202', 'Theory', 'T24', 3, 1, 'Classroom'),
        ('Fluid Mechanics in Civil', 'CE203', 'Theory', 'T25', 3, 1, 'Classroom'),
        ('Concrete Tech Lab (Group 1)', 'CE201L-G1', 'Lab', 'T23', 1, 2, 'CivilLab'),
        ('Concrete Tech Lab (Group 2)', 'CE201L-G2', 'Lab', 'T23', 1, 2, 'CivilLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],

    # 3rd Year CSE (CS1 & CS2)
    'CSE-3rd-CS1': [
        ('Compiler Design', 'CS301', 'Theory', 'T01', 3, 1, 'Classroom'),
        ('Computer Graphics', 'CS302', 'Theory', 'T08', 3, 1, 'Classroom'),
        ('Optimization Techniques', 'MA301', 'Theory', 'T35', 3, 1, 'Classroom'),
        ('Compiler Lab (Group 1)', 'CS301L-G1', 'Lab', 'T05', 1, 2, 'ComputerLab'),
        ('Compiler Lab (Group 2)', 'CS301L-G2', 'Lab', 'T05', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'CSE-3rd-CS2': [
        ('Compiler Design', 'CS301', 'Theory', 'T01', 3, 1, 'Classroom'),
        ('Computer Graphics', 'CS302', 'Theory', 'T08', 3, 1, 'Classroom'),
        ('Optimization Techniques', 'MA301', 'Theory', 'T35', 3, 1, 'Classroom'),
        ('Graphics Lab (Group 1)', 'CS302L-G1', 'Lab', 'T08', 1, 2, 'ComputerLab'),
        ('Graphics Lab (Group 2)', 'CS302L-G2', 'Lab', 'T08', 1, 2, 'ComputerLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],
    'ECE-3rd': [
        ('Microprocessors & Microcontrollers', 'EC301', 'Theory', 'T10', 3, 1, 'Classroom'),
        ('VLSI Design', 'EC302', 'Theory', 'T12', 3, 1, 'Classroom'),
        ('Microcontroller Lab (Group 1)', 'EC301L-G1', 'Lab', 'T10', 1, 2, 'ElectronicsLab'),
        ('Microcontroller Lab (Group 2)', 'EC301L-G2', 'Lab', 'T10', 1, 2, 'ElectronicsLab'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'EE-3rd': [
        ('Power Electronics', 'EE301', 'Theory', 'T15', 3, 1, 'Classroom'),
        ('Renewable Energy Systems', 'EE302', 'Theory', 'T16', 3, 1, 'Classroom'),
        ('Power Electronics Lab (Group 1)', 'EE104L-G1', 'Lab', 'T17', 1, 2, 'ElectricalLab'),
        ('Power Electronics Lab (Group 2)', 'EE104L-G2', 'Lab', 'T17', 1, 2, 'ElectricalLab'),
        ('Sports & Fitness (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'ME-3rd': [
        ('Heat & Mass Transfer', 'ME301', 'Theory', 'T19', 3, 1, 'Classroom'),
        ('CAD / CAM Systems', 'ME302', 'Theory', 'T20', 3, 1, 'Classroom'),
        ('CAD/CAM Lab (Group 1)', 'ME302L-G1', 'Lab', 'T20', 1, 2, 'MechanicalWorkshop'),
        ('CAD/CAM Lab (Group 2)', 'ME302L-G2', 'Lab', 'T20', 1, 2, 'MechanicalWorkshop'),
        ('Sports & Fitness (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],

    # 4th Year CSE (CS1 & CS2)
    'CSE-4th-CS1': [
        ('Cloud Computing & DevOps', 'CS401', 'Theory', 'T03', 3, 1, 'Classroom'),
        ('Cyber Security & Cryptography', 'CS402', 'Theory', 'T06', 3, 1, 'Classroom'),
        ('Industrial Professional Ethics', 'HS301', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Sports & Recreation (Group 1)', 'SPORTS-G1', 'Lab', 'T32', 1, 2, 'SportsGround')
    ],
    'CSE-4th-CS2': [
        ('Cloud Computing & DevOps', 'CS401', 'Theory', 'T03', 3, 1, 'Classroom'),
        ('Cyber Security & Cryptography', 'CS402', 'Theory', 'T06', 3, 1, 'Classroom'),
        ('Industrial Professional Ethics', 'HS301', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Sports & Recreation (Group 2)', 'SPORTS-G2', 'Lab', 'T33', 1, 2, 'SportsGround')
    ],
    'ECE-4th': [
        ('Wireless & Mobile Networks', 'EC401', 'Theory', 'T11', 3, 1, 'Classroom'),
        ('Embedded IoT Systems', 'EC402', 'Theory', 'T13', 3, 1, 'Classroom'),
        ('Industrial Professional Ethics', 'HS301', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Sports & Recreation (Group 1)', 'SPORTS-G1', 'Lab', 'T31', 1, 2, 'SportsGround')
    ],
    'ME-4th': [
        ('Automobile Engineering', 'ME401', 'Theory', 'T21', 3, 1, 'Classroom'),
        ('Robotics & Automation', 'ME402', 'Theory', 'T22', 3, 1, 'Classroom'),
        ('Industrial Professional Ethics', 'HS301', 'Theory', 'T30', 2, 1, 'Classroom'),
        ('Sports & Recreation (Group 2)', 'SPORTS-G2', 'Lab', 'T32', 1, 2, 'SportsGround')
    ]
}

subjects = []
for sec_name, sub_list in batch_curricula.items():
    for name, code, stype, tcode, weekly, dur, room_type in sub_list:
        subjects.append({
            'name': name,
            'code': code,
            'type': stype,
            'sectionName': sec_name,
            'teacherCode': tcode,
            'weeklySessions': weekly,
            'durationPeriods': dur,
            'requiredRoomType': room_type
        })

# Validate teacher qualification map
teacher_qual_map = {t['teacherCode']: set(t['teachableSubjectCodes']) for t in teachers}
for s in subjects:
    tcode = s['teacherCode']
    code = s['code']
    if code not in teacher_qual_map[tcode]:
        print(f"Error: {tcode} not qualified for {code}")
        exit(1)

dataset = {
    'name': 'college',
    'description': 'Real-world University Dataset (CSE CS1/CS2 all 4 years, Common Theory, Split G1/G2 Small Labs, Distinct Lab Rooms)',
    'sections': sections,
    'rooms': rooms,
    'teachers': teachers,
    'subjects': subjects
}

with open('/Users/sashank/.gemini/antigravity/scratch/smartsched/server/seeds/college.json', 'w') as f:
    json.dump(dataset, f, indent=2)

print(f"Successfully generated realistic college dataset:")
print(f"  Sections: {len(sections)}")
print(f"  Rooms: {len(rooms)}")
print(f"  Teachers: {len(teachers)}")
print(f"  Subjects: {len(subjects)}")
total_sessions = sum(s['weeklySessions'] for s in subjects)
print(f"  Total Weekly Sessions across University: {total_sessions}")
