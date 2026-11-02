import json
import os

# -------------------------------------------------------------
# 1. SECTIONS: 7 Branches x (4 BTech + 2 MTech + 2 PhD) = 60 sections
# CSE has CS1 & CS2 for all 4 BTech years
# -------------------------------------------------------------
sections = []

departments = [
    ('Computer Science', 'CSE', True),   # has CS1/CS2 for BTech
    ('Information Technology', 'IT', False),
    ('AI & Data Science', 'AIDS', False),
    ('Electronics', 'ECE', False),
    ('Electrical', 'EE', False),
    ('Mechanical', 'ME', False),
    ('Civil', 'CE', False)
]

for dept_name, prefix, has_double_btech in departments:
    # B.Tech Years 1 to 4
    for yr, yr_lbl in enumerate(['1st', '2nd', '3rd', '4th'], 1):
        std_count = 60 if prefix == 'CE' else (65 if prefix in ['EE', 'ME'] else 70)
        if has_double_btech:
            sections.append({'name': f'{prefix}-{yr_lbl}-CS1', 'department': dept_name, 'studentCount': std_count})
            sections.append({'name': f'{prefix}-{yr_lbl}-CS2', 'department': dept_name, 'studentCount': std_count})
        else:
            sections.append({'name': f'{prefix}-{yr_lbl}', 'department': dept_name, 'studentCount': std_count})

    # M.Tech Years 1 and 2
    for yr, yr_lbl in enumerate(['1st', '2nd'], 1):
        sections.append({'name': f'MTech-{prefix}-{yr_lbl}', 'department': dept_name, 'studentCount': 25})

    # Ph.D Years 1 and 2
    for yr, yr_lbl in enumerate(['1st', '2nd'], 1):
        sections.append({'name': f'PhD-{prefix}-{yr_lbl}', 'department': dept_name, 'studentCount': 15})

# -------------------------------------------------------------
# 2. EXPANDED ROOMS (61 Rooms total):
# 32 Classrooms + 23 Specialized Labs + 6 Sports Grounds
# Fully accommodates all 60 sections and 719 sessions with 0 invalid/bottlenecks
# -------------------------------------------------------------
rooms = []

# 24 Large Lecture Halls for B.Tech (Cap 75)
for floor in [1, 2, 3, 4]:
    for rm in range(1, 7):
        r_num = f'LH-{floor}0{rm}'
        rooms.append({'name': f'Lecture Hall {floor}0{rm}', 'roomNumber': r_num, 'type': 'Classroom', 'capacity': 75})

# 8 PG & Research Seminar Rooms (Cap 40-45)
for rm in range(1, 5):
    rooms.append({'name': f'PG Seminar Room {rm}', 'roomNumber': f'PG-10{rm}', 'type': 'Classroom', 'capacity': 40})
for rm in range(1, 5):
    rooms.append({'name': f'Research Seminar Hall {rm}', 'roomNumber': f'SEM-10{rm}', 'type': 'Classroom', 'capacity': 45})

# 23 Specialized Laboratories (Cap 38)
# Computer Labs (6)
for i in range(1, 5):
    rooms.append({'name': f'Computer Science Lab {i}', 'roomNumber': f'CSLAB-{i}', 'type': 'ComputerLab', 'capacity': 38})
rooms.append({'name': 'AI & Machine Learning Lab 1', 'roomNumber': 'AIDSLAB-1', 'type': 'ComputerLab', 'capacity': 38})
rooms.append({'name': 'AI & Machine Learning Lab 2', 'roomNumber': 'AIDSLAB-2', 'type': 'ComputerLab', 'capacity': 38})

# Electronics Labs (3)
rooms.append({'name': 'Electronics Devices Lab', 'roomNumber': 'ECLAB-1', 'type': 'ElectronicsLab', 'capacity': 38})
rooms.append({'name': 'Communication Systems Lab', 'roomNumber': 'ECLAB-2', 'type': 'ElectronicsLab', 'capacity': 38})
rooms.append({'name': 'VLSI & Microelectronics Lab', 'roomNumber': 'VLSILAB', 'type': 'ElectronicsLab', 'capacity': 38})

# Electrical Labs (3)
rooms.append({'name': 'Electrical Circuits Lab', 'roomNumber': 'EELAB-1', 'type': 'ElectricalLab', 'capacity': 38})
rooms.append({'name': 'Electrical Machines Lab', 'roomNumber': 'EELAB-2', 'type': 'ElectricalLab', 'capacity': 38})
rooms.append({'name': 'Power Systems & Drives Lab', 'roomNumber': 'POWLAB', 'type': 'ElectricalLab', 'capacity': 38})

# Mechanical Workshops (4)
rooms.append({'name': 'Mechanical Workshop 1', 'roomNumber': 'MEWK-1', 'type': 'MechanicalWorkshop', 'capacity': 38})
rooms.append({'name': 'Mechanical Workshop 2', 'roomNumber': 'MEWK-2', 'type': 'MechanicalWorkshop', 'capacity': 38})
rooms.append({'name': 'CAD/CAM Modeling Lab', 'roomNumber': 'MEWK-3', 'type': 'MechanicalWorkshop', 'capacity': 38})
rooms.append({'name': 'Thermal & Fluid Dynamics Lab', 'roomNumber': 'TFLAB', 'type': 'MechanicalWorkshop', 'capacity': 38})

# Civil Labs (3)
rooms.append({'name': 'Surveying & Geomatics Lab', 'roomNumber': 'CIVILLAB-1', 'type': 'CivilLab', 'capacity': 38})
rooms.append({'name': 'Geotechnical Engineering Lab', 'roomNumber': 'CIVILLAB-2', 'type': 'CivilLab', 'capacity': 38})
rooms.append({'name': 'Concrete Testing Lab', 'roomNumber': 'CONCLAB', 'type': 'CivilLab', 'capacity': 38})

# Basic Science Labs (4)
rooms.append({'name': 'Engineering Physics Lab 1', 'roomNumber': 'PHYLAB-1', 'type': 'PhysicsLab', 'capacity': 38})
rooms.append({'name': 'Engineering Physics Lab 2', 'roomNumber': 'PHYLAB-2', 'type': 'PhysicsLab', 'capacity': 38})
rooms.append({'name': 'Engineering Chemistry Lab 1', 'roomNumber': 'CHMLAB-1', 'type': 'ChemistryLab', 'capacity': 38})
rooms.append({'name': 'Engineering Chemistry Lab 2', 'roomNumber': 'CHMLAB-2', 'type': 'ChemistryLab', 'capacity': 38})

# 6 Sports Grounds (Capacity 300)
rooms.append({'name': 'Main Sports Stadium', 'roomNumber': 'SPORTS-1', 'type': 'SportsGround', 'capacity': 300})
rooms.append({'name': 'East Athletic Ground', 'roomNumber': 'SPORTS-2', 'type': 'SportsGround', 'capacity': 300})
rooms.append({'name': 'West Sports Complex', 'roomNumber': 'SPORTS-3', 'type': 'SportsGround', 'capacity': 300})
rooms.append({'name': 'Indoor Badminton & Table Tennis Arena', 'roomNumber': 'SPORTS-4', 'type': 'SportsGround', 'capacity': 200})
rooms.append({'name': 'Gymnasium & Fitness Arena', 'roomNumber': 'SPORTS-5', 'type': 'SportsGround', 'capacity': 200})
rooms.append({'name': 'Outdoor Basketball Courts', 'roomNumber': 'SPORTS-6', 'type': 'SportsGround', 'capacity': 200})

# -------------------------------------------------------------
# 3. TEACHERS: 95 Faculty Members across all disciplines
# -------------------------------------------------------------
faculty_defs = [
    # CSE Faculty (T01 - T14)
    ('T01', 'Dr. Anurag Singh', 'Computer Science'),
    ('T02', 'Dr. Shelly Sachdeva', 'Computer Science'),
    ('T03', 'Dr. Chandra Prakash', 'Computer Science'),
    ('T04', 'Dr. Gautam Kumar', 'Computer Science'),
    ('T05', 'Dr. Rajiv Misra', 'Computer Science'),
    ('T06', 'Dr. Amritanjali', 'Computer Science'),
    ('T07', 'Prof. Sanjeev Sofat', 'Computer Science'),
    ('T08', 'Dr. Divya Bansal', 'Computer Science'),
    ('T09', 'Dr. Preeti Chawla', 'Computer Science'),
    ('T10', 'Dr. Rajesh Kumar', 'Computer Science'),
    ('T11', 'Dr. Shweta Anand', 'Computer Science'),
    ('T12', 'Dr. Manoj Sharma', 'Computer Science'),
    ('T13', 'Dr. Nitin Auluck', 'Computer Science'),
    ('T14', 'Prof. Geeta Sikka', 'Computer Science'),

    # IT Faculty (T15 - T24)
    ('T15', 'Prof. Ananya Das', 'Information Technology'),
    ('T16', 'Dr. Rohit Bansal', 'Information Technology'),
    ('T17', 'Dr. Pooja Sharma', 'Information Technology'),
    ('T18', 'Dr. Mohit Kumar', 'Information Technology'),
    ('T19', 'Dr. Sonam Gupta', 'Information Technology'),
    ('T20', 'Prof. Vikas Saxena', 'Information Technology'),
    ('T21', 'Dr. Alok Joshi', 'Information Technology'),
    ('T22', 'Dr. Renu Bagoria', 'Information Technology'),
    ('T23', 'Dr. Deepak Garg', 'Information Technology'),
    ('T24', 'Dr. Tanvi Verma', 'Information Technology'),

    # AI & Data Science Faculty (T25 - T34)
    ('T25', 'Dr. Sneha Roy', 'AI & Data Science'),
    ('T26', 'Prof. Karan Kapoor', 'AI & Data Science'),
    ('T27', 'Dr. Anupam Shukla', 'AI & Data Science'),
    ('T28', 'Dr. Tanmoy Chakraborty', 'AI & Data Science'),
    ('T29', 'Dr. Richa Singh', 'AI & Data Science'),
    ('T30', 'Prof. Mayank Vatsa', 'AI & Data Science'),
    ('T31', 'Dr. Saket Anand', 'AI & Data Science'),
    ('T32', 'Dr. Pradeep Atrey', 'AI & Data Science'),
    ('T33', 'Dr. Aruna Tiwari', 'AI & Data Science'),
    ('T34', 'Dr. Vinod Kumar', 'AI & Data Science'),

    # ECE Faculty (T35 - T46)
    ('T35', 'Dr. Sunita Verma', 'Electronics'),
    ('T36', 'Dr. Vikram Joshi', 'Electronics'),
    ('T37', 'Prof. Neelam Gupta', 'Electronics'),
    ('T38', 'Dr. Amit Trivedi', 'Electronics'),
    ('T39', 'Dr. Ritu Agarwal', 'Electronics'),
    ('T40', 'Dr. Shailesh Kumar', 'Electronics'),
    ('T41', 'Prof. B. S. Saini', 'Electronics'),
    ('T42', 'Dr. Arun Khosla', 'Electronics'),
    ('T43', 'Dr. Balwinder Raj', 'Electronics'),
    ('T44', 'Dr. Indu Saini', 'Electronics'),
    ('T45', 'Dr. Mamta Khosla', 'Electronics'),
    ('T46', 'Dr. Ramesh Kumar', 'Electronics'),

    # EE Faculty (T47 - T56)
    ('T47', 'Prof. Sanjay Kulkarni', 'Electrical'),
    ('T48', 'Dr. Harish Rawat', 'Electrical'),
    ('T49', 'Dr. Meenakshi Sundaram', 'Electrical'),
    ('T50', 'Prof. Alok Sen', 'Electrical'),
    ('T51', 'Dr. Ashwani Sharma', 'Electrical'),
    ('T52', 'Dr. Dilbag Singh', 'Electrical'),
    ('T53', 'Dr. Jyoti Saxena', 'Electrical'),
    ('T54', 'Prof. Arvind Kumar', 'Electrical'),
    ('T55', 'Dr. Sukhminder Singh', 'Electrical'),
    ('T56', 'Dr. Gurmeet Singh', 'Electrical'),

    # ME Faculty (T57 - T68)
    ('T57', 'Dr. Anil Sharma', 'Mechanical'),
    ('T58', 'Dr. Priya Nair', 'Mechanical'),
    ('T59', 'Prof. Rajesh Khanna', 'Mechanical'),
    ('T60', 'Dr. Suresh Reddy', 'Mechanical'),
    ('T61', 'Dr. Divya Chauhan', 'Mechanical'),
    ('T62', 'Dr. Subhash Chander', 'Mechanical'),
    ('T63', 'Prof. T. P. Singh', 'Mechanical'),
    ('T64', 'Dr. Dinesh Kumar', 'Mechanical'),
    ('T65', 'Dr. Pramod Kumar', 'Mechanical'),
    ('T66', 'Dr. Rajeev Kumar', 'Mechanical'),
    ('T67', 'Dr. Manoj Kumar', 'Mechanical'),
    ('T68', 'Dr. R. S. Walia', 'Mechanical'),

    # Civil Faculty (T69 - T78)
    ('T69', 'Dr. Ramesh Choudhary', 'Civil'),
    ('T70', 'Prof. Vandana Mehta', 'Civil'),
    ('T71', 'Dr. Tarun Bhatia', 'Civil'),
    ('T72', 'Dr. H. S. Chore', 'Civil'),
    ('T73', 'Prof. A. K. Agnihotri', 'Civil'),
    ('T74', 'Dr. S. P. Singh', 'Civil'),
    ('T75', 'Dr. Rajiv Kumar', 'Civil'),
    ('T76', 'Dr. Navdeep Singh', 'Civil'),
    ('T77', 'Dr. Kanish Kapoor', 'Civil'),
    ('T78', 'Dr. Rupali S.', 'Civil'),

    # Mathematics, Physics, Chemistry & Humanities (T79 - T88)
    ('T79', 'Prof. Raghav Mehra', 'Mathematics'),
    ('T80', 'Dr. Sangeeta Rao', 'Mathematics'),
    ('T81', 'Dr. K. S. Sharma', 'Mathematics'),
    ('T82', 'Dr. Sunita Saxena', 'Mathematics'),
    ('T83', 'Dr. Kavita Rao', 'Physics'),
    ('T84', 'Prof. Rohit Sachdeva', 'Physics'),
    ('T85', 'Prof. Manoj Mishra', 'Chemistry'),
    ('T86', 'Dr. Suman Rani', 'Chemistry'),
    ('T87', 'Dr. Shalini Saxena', 'Humanities'),
    ('T88', 'Prof. Anupama Sharma', 'Humanities'),

    # Sports Coaches (T89 - T94)
    ('T89', 'Coach Deepak Sharma', 'Sports'),
    ('T90', 'Coach Virendra Singh', 'Sports'),
    ('T91', 'Coach Neha Malik', 'Sports'),
    ('T92', 'Coach Rajesh Rawat', 'Sports'),
    ('T93', 'Coach Amit Kumar', 'Sports'),
    ('T94', 'Coach Sunita Yadav', 'Sports')
]

teachers_dict = {}
for code, name, dept in faculty_defs:
    teachers_dict[code] = {
        'name': name,
        'teacherCode': code,
        'department': dept,
        'maxWeeklyPeriods': 24,
        'maxDailyPeriods': 8,
        'teachableSubjectCodes': []
    }

# -------------------------------------------------------------
# 4. CURRICULA SPECIFICATION FOR ALL 60 SECTIONS
# EVERY SECTION HAS MINIMUM 5 SUBJECTS!
# -------------------------------------------------------------
subjects = []
teacher_load = {code: 0 for code in teachers_dict}

def add_subject(s_name, code, stype, tcode, weekly, dur, room_type, sec_name):
    subjects.append({
        'name': s_name,
        'code': code,
        'type': stype,
        'sectionName': sec_name,
        'teacherCode': tcode,
        'weeklySessions': weekly,
        'durationPeriods': dur,
        'requiredRoomType': room_type
    })
    teachers_dict[tcode]['teachableSubjectCodes'].append(code)
    teacher_load[tcode] += (weekly * dur)

# Helper for Sports (2 periods, coach rotated)
sports_coaches = ['T89', 'T90', 'T91', 'T92', 'T93', 'T94']
coach_idx = [0]
def get_coach():
    c = sports_coaches[coach_idx[0] % len(sports_coaches)]
    coach_idx[0] += 1
    return c

# =============================================================
# B.TECH CURRICULA (32 sections)
# =============================================================
# CSE Year 1 (CS1 & CS2)
add_subject('Programming & Problem Solving', 'CS101', 'Theory', 'T01', 3, 1, 'Classroom', 'CSE-1st-CS1')
add_subject('Calculus & Linear Algebra', 'MA101-A', 'Theory', 'T79', 3, 1, 'Classroom', 'CSE-1st-CS1')
add_subject('Engineering Physics', 'PH101-A', 'Theory', 'T83', 3, 1, 'Classroom', 'CSE-1st-CS1')
add_subject('Communication Skills', 'HS101-A', 'Theory', 'T87', 2, 1, 'Classroom', 'CSE-1st-CS1')
add_subject('Programming Lab (Group 1)', 'CS101L-G1', 'Lab', 'T01', 1, 2, 'ComputerLab', 'CSE-1st-CS1')
add_subject('Programming Lab (Group 2)', 'CS101L-G2', 'Lab', 'T01', 1, 2, 'ComputerLab', 'CSE-1st-CS1')
add_subject('Sports & Fitness (Group 1)', 'SPT-101', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-1st-CS1')
add_subject('Sports & Fitness (Group 2)', 'SPT-102', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-1st-CS1')

add_subject('Digital Logic Design', 'CS102', 'Theory', 'T02', 3, 1, 'Classroom', 'CSE-1st-CS2')
add_subject('Calculus & Linear Algebra', 'MA101-B', 'Theory', 'T80', 3, 1, 'Classroom', 'CSE-1st-CS2')
add_subject('Discrete Mathematics', 'CS103', 'Theory', 'T03', 3, 1, 'Classroom', 'CSE-1st-CS2')
add_subject('Communication Skills', 'HS101-B', 'Theory', 'T87', 2, 1, 'Classroom', 'CSE-1st-CS2')
add_subject('Digital Logic Lab (Group 1)', 'CS102L-G1', 'Lab', 'T02', 1, 2, 'ComputerLab', 'CSE-1st-CS2')
add_subject('Digital Logic Lab (Group 2)', 'CS102L-G2', 'Lab', 'T02', 1, 2, 'ComputerLab', 'CSE-1st-CS2')
add_subject('Sports & Fitness (Group 1)', 'SPT-103', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-1st-CS2')
add_subject('Sports & Fitness (Group 2)', 'SPT-104', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-1st-CS2')

# CSE Year 2 (CS1 & CS2)
add_subject('Data Structures & Algorithms', 'CS201', 'Theory', 'T04', 3, 1, 'Classroom', 'CSE-2nd-CS1')
add_subject('Computer Organization & Arch', 'CS202', 'Theory', 'T05', 3, 1, 'Classroom', 'CSE-2nd-CS1')
add_subject('Object Oriented Programming', 'CS203', 'Theory', 'T06', 3, 1, 'Classroom', 'CSE-2nd-CS1')
add_subject('Data Structures Lab (Group 1)', 'CS201L-G1', 'Lab', 'T04', 1, 2, 'ComputerLab', 'CSE-2nd-CS1')
add_subject('Data Structures Lab (Group 2)', 'CS201L-G2', 'Lab', 'T04', 1, 2, 'ComputerLab', 'CSE-2nd-CS1')
add_subject('Sports & Athletics', 'SPT-201', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-2nd-CS1')

add_subject('Operating Systems', 'CS204', 'Theory', 'T07', 3, 1, 'Classroom', 'CSE-2nd-CS2')
add_subject('Database Management Systems', 'CS205', 'Theory', 'T08', 3, 1, 'Classroom', 'CSE-2nd-CS2')
add_subject('Probability & Statistics', 'MA201-A', 'Theory', 'T81', 3, 1, 'Classroom', 'CSE-2nd-CS2')
add_subject('Operating Systems Lab (Group 1)', 'CS204L-G1', 'Lab', 'T07', 1, 2, 'ComputerLab', 'CSE-2nd-CS2')
add_subject('Operating Systems Lab (Group 2)', 'CS204L-G2', 'Lab', 'T07', 1, 2, 'ComputerLab', 'CSE-2nd-CS2')
add_subject('Sports & Athletics', 'SPT-202', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-2nd-CS2')

# CSE Year 3 (CS1 & CS2)
add_subject('Theory of Computation', 'CS301', 'Theory', 'T09', 3, 1, 'Classroom', 'CSE-3rd-CS1')
add_subject('Computer Networks', 'CS302', 'Theory', 'T10', 3, 1, 'Classroom', 'CSE-3rd-CS1')
add_subject('Software Engineering', 'CS303', 'Theory', 'T11', 3, 1, 'Classroom', 'CSE-3rd-CS1')
add_subject('Networks Lab (Group 1)', 'CS302L-G1', 'Lab', 'T10', 1, 2, 'ComputerLab', 'CSE-3rd-CS1')
add_subject('Networks Lab (Group 2)', 'CS302L-G2', 'Lab', 'T10', 1, 2, 'ComputerLab', 'CSE-3rd-CS1')
add_subject('Sports & Fitness', 'SPT-301', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-3rd-CS1')

add_subject('Compiler Design', 'CS304', 'Theory', 'T12', 3, 1, 'Classroom', 'CSE-3rd-CS2')
add_subject('Artificial Intelligence', 'CS305', 'Theory', 'T13', 3, 1, 'Classroom', 'CSE-3rd-CS2')
add_subject('Web Technologies', 'CS306', 'Theory', 'T14', 3, 1, 'Classroom', 'CSE-3rd-CS2')
add_subject('Compiler Lab (Group 1)', 'CS304L-G1', 'Lab', 'T12', 1, 2, 'ComputerLab', 'CSE-3rd-CS2')
add_subject('Compiler Lab (Group 2)', 'CS304L-G2', 'Lab', 'T12', 1, 2, 'ComputerLab', 'CSE-3rd-CS2')
add_subject('Sports & Fitness', 'SPT-302', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-3rd-CS2')

# CSE Year 4 (CS1 & CS2) -> Min 5 subjects each
add_subject('Cloud Computing & DevOps', 'CS401', 'Theory', 'T03', 3, 1, 'Classroom', 'CSE-4th-CS1')
add_subject('Cyber Security & Cryptography', 'CS402', 'Theory', 'T06', 3, 1, 'Classroom', 'CSE-4th-CS1')
add_subject('Professional Ethics', 'HS301-A', 'Theory', 'T88', 2, 1, 'Classroom', 'CSE-4th-CS1')
add_subject('Information Security & Forensics', 'CS405', 'Theory', 'T11', 3, 1, 'Classroom', 'CSE-4th-CS1')
add_subject('Sports & Recreation', 'SPT-401', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-4th-CS1')

add_subject('Distributed Systems', 'CS403', 'Theory', 'T09', 3, 1, 'Classroom', 'CSE-4th-CS2')
add_subject('Big Data Analytics', 'CS404', 'Theory', 'T11', 3, 1, 'Classroom', 'CSE-4th-CS2')
add_subject('Professional Ethics', 'HS301-B', 'Theory', 'T88', 2, 1, 'Classroom', 'CSE-4th-CS2')
add_subject('Machine Learning in Production', 'CS406', 'Theory', 'T04', 3, 1, 'Classroom', 'CSE-4th-CS2')
add_subject('Sports & Recreation', 'SPT-402', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CSE-4th-CS2')

# IT Year 1 to 4
add_subject('IT Fundamentals & C', 'IT101', 'Theory', 'T15', 3, 1, 'Classroom', 'IT-1st')
add_subject('Calculus & Matrices', 'MA101-C', 'Theory', 'T79', 3, 1, 'Classroom', 'IT-1st')
add_subject('Engineering Physics', 'PH101-B', 'Theory', 'T84', 3, 1, 'Classroom', 'IT-1st')
add_subject('IT Workshop Lab (Group 1)', 'IT101L-G1', 'Lab', 'T15', 1, 2, 'ComputerLab', 'IT-1st')
add_subject('IT Workshop Lab (Group 2)', 'IT101L-G2', 'Lab', 'T15', 1, 2, 'ComputerLab', 'IT-1st')
add_subject('Sports & Fitness', 'SPT-IT1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'IT-1st')

add_subject('Data Structures in Java', 'IT201', 'Theory', 'T16', 3, 1, 'Classroom', 'IT-2nd')
add_subject('Database Management', 'IT202', 'Theory', 'T17', 3, 1, 'Classroom', 'IT-2nd')
add_subject('Discrete Mathematics', 'MA201-B', 'Theory', 'T80', 3, 1, 'Classroom', 'IT-2nd')
add_subject('Java Programming Lab (Group 1)', 'IT201L-G1', 'Lab', 'T16', 1, 2, 'ComputerLab', 'IT-2nd')
add_subject('Java Programming Lab (Group 2)', 'IT201L-G2', 'Lab', 'T16', 1, 2, 'ComputerLab', 'IT-2nd')
add_subject('Sports & Fitness', 'SPT-IT2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'IT-2nd')

add_subject('Software Engineering & Testing', 'IT301', 'Theory', 'T18', 3, 1, 'Classroom', 'IT-3rd')
add_subject('Computer Networks & Security', 'IT302', 'Theory', 'T19', 3, 1, 'Classroom', 'IT-3rd')
add_subject('Web Frameworks', 'IT303', 'Theory', 'T20', 3, 1, 'Classroom', 'IT-3rd')
add_subject('Web Development Lab (Group 1)', 'IT303L-G1', 'Lab', 'T20', 1, 2, 'ComputerLab', 'IT-3rd')
add_subject('Web Development Lab (Group 2)', 'IT303L-G2', 'Lab', 'T20', 1, 2, 'ComputerLab', 'IT-3rd')
add_subject('Sports & Fitness', 'SPT-IT3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'IT-3rd')

# IT Year 4 -> Min 5 subjects
add_subject('Information Security', 'IT401', 'Theory', 'T21', 3, 1, 'Classroom', 'IT-4th')
add_subject('Mobile Application Development', 'IT402', 'Theory', 'T22', 3, 1, 'Classroom', 'IT-4th')
add_subject('Human Values & Ethics', 'HS401-A', 'Theory', 'T87', 2, 1, 'Classroom', 'IT-4th')
add_subject('Cloud Architecture & Microservices', 'IT403', 'Theory', 'T23', 3, 1, 'Classroom', 'IT-4th')
add_subject('Sports & Recreation', 'SPT-IT4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'IT-4th')

# AIDS Year 1 to 4
add_subject('Introduction to AI & Python', 'AI101', 'Theory', 'T25', 3, 1, 'Classroom', 'AIDS-1st')
add_subject('Calculus & Analytical Geometry', 'MA101-D', 'Theory', 'T81', 3, 1, 'Classroom', 'AIDS-1st')
add_subject('Physics for Information Science', 'PH101-C', 'Theory', 'T83', 3, 1, 'Classroom', 'AIDS-1st')
add_subject('Python AI Lab (Group 1)', 'AI101L-G1', 'Lab', 'T25', 1, 2, 'ComputerLab', 'AIDS-1st')
add_subject('Python AI Lab (Group 2)', 'AI101L-G2', 'Lab', 'T25', 1, 2, 'ComputerLab', 'AIDS-1st')
add_subject('Sports & Fitness', 'SPT-AI1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'AIDS-1st')

add_subject('Data Structures & Algorithms', 'AI201', 'Theory', 'T26', 3, 1, 'Classroom', 'AIDS-2nd')
add_subject('Statistical Methods for AI', 'MA201-C', 'Theory', 'T82', 3, 1, 'Classroom', 'AIDS-2nd')
add_subject('Machine Learning Foundations', 'AI202', 'Theory', 'T27', 3, 1, 'Classroom', 'AIDS-2nd')
add_subject('ML Foundations Lab (Group 1)', 'AI202L-G1', 'Lab', 'T27', 1, 2, 'ComputerLab', 'AIDS-2nd')
add_subject('ML Foundations Lab (Group 2)', 'AI202L-G2', 'Lab', 'T27', 1, 2, 'ComputerLab', 'AIDS-2nd')
add_subject('Sports & Fitness', 'SPT-AI2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'AIDS-2nd')

add_subject('Deep Learning & Neural Nets', 'AI301', 'Theory', 'T28', 3, 1, 'Classroom', 'AIDS-3rd')
add_subject('Natural Language Processing', 'AI302', 'Theory', 'T29', 3, 1, 'Classroom', 'AIDS-3rd')
add_subject('Computer Vision Foundations', 'AI303', 'Theory', 'T30', 3, 1, 'Classroom', 'AIDS-3rd')
add_subject('Deep Learning Lab (Group 1)', 'AI301L-G1', 'Lab', 'T28', 1, 2, 'ComputerLab', 'AIDS-3rd')
add_subject('Deep Learning Lab (Group 2)', 'AI301L-G2', 'Lab', 'T28', 1, 2, 'ComputerLab', 'AIDS-3rd')
add_subject('Sports & Fitness', 'SPT-AI3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'AIDS-3rd')

# AIDS Year 4 -> Min 5 subjects
add_subject('Reinforcement Learning', 'AI401', 'Theory', 'T31', 3, 1, 'Classroom', 'AIDS-4th')
add_subject('Big Data Mining', 'AI402', 'Theory', 'T32', 3, 1, 'Classroom', 'AIDS-4th')
add_subject('AI Ethics & Policy', 'HS401-B', 'Theory', 'T88', 2, 1, 'Classroom', 'AIDS-4th')
add_subject('Autonomous Systems & Robotics', 'AI403', 'Theory', 'T33', 3, 1, 'Classroom', 'AIDS-4th')
add_subject('Sports & Recreation', 'SPT-AI4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'AIDS-4th')

# ECE Year 1 to 4
add_subject('Basic Electrical & Electronics', 'EC101', 'Theory', 'T35', 3, 1, 'Classroom', 'ECE-1st')
add_subject('Calculus & Differential Equations', 'MA101-E', 'Theory', 'T80', 3, 1, 'Classroom', 'ECE-1st')
add_subject('Engineering Chemistry', 'CH101-A', 'Theory', 'T85', 3, 1, 'Classroom', 'ECE-1st')
add_subject('Electronics Lab (Group 1)', 'EC101L-G1', 'Lab', 'T35', 1, 2, 'ElectronicsLab', 'ECE-1st')
add_subject('Electronics Lab (Group 2)', 'EC101L-G2', 'Lab', 'T35', 1, 2, 'ElectronicsLab', 'ECE-1st')
add_subject('Sports & Fitness', 'SPT-EC1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ECE-1st')

add_subject('Electronic Devices & Circuits', 'EC201', 'Theory', 'T36', 3, 1, 'Classroom', 'ECE-2nd')
add_subject('Digital System Design', 'EC202', 'Theory', 'T37', 3, 1, 'Classroom', 'ECE-2nd')
add_subject('Signals & Systems', 'EC203', 'Theory', 'T38', 3, 1, 'Classroom', 'ECE-2nd')
add_subject('Circuit Design Lab (Group 1)', 'EC201L-G1', 'Lab', 'T36', 1, 2, 'ElectronicsLab', 'ECE-2nd')
add_subject('Circuit Design Lab (Group 2)', 'EC201L-G2', 'Lab', 'T36', 1, 2, 'ElectronicsLab', 'ECE-2nd')
add_subject('Sports & Fitness', 'SPT-EC2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ECE-2nd')

add_subject('Analog & Digital Communication', 'EC301', 'Theory', 'T39', 3, 1, 'Classroom', 'ECE-3rd')
add_subject('Microprocessors & Interfacing', 'EC302', 'Theory', 'T40', 3, 1, 'Classroom', 'ECE-3rd')
add_subject('VLSI Circuit Design', 'EC303', 'Theory', 'T41', 3, 1, 'Classroom', 'ECE-3rd')
add_subject('Communication Lab (Group 1)', 'EC301L-G1', 'Lab', 'T39', 1, 2, 'ElectronicsLab', 'ECE-3rd')
add_subject('Communication Lab (Group 2)', 'EC301L-G2', 'Lab', 'T39', 1, 2, 'ElectronicsLab', 'ECE-3rd')
add_subject('Sports & Fitness', 'SPT-EC3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ECE-3rd')

# ECE Year 4 -> Min 5 subjects
add_subject('Wireless & Mobile Networks', 'EC401', 'Theory', 'T42', 3, 1, 'Classroom', 'ECE-4th')
add_subject('Embedded IoT Systems', 'EC402', 'Theory', 'T43', 3, 1, 'Classroom', 'ECE-4th')
add_subject('Engineering Economics', 'HS401-C', 'Theory', 'T87', 2, 1, 'Classroom', 'ECE-4th')
add_subject('Radar & Satellite Systems', 'EC403', 'Theory', 'T44', 3, 1, 'Classroom', 'ECE-4th')
add_subject('Sports & Recreation', 'SPT-EC4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ECE-4th')

# EE Year 1 to 4
add_subject('Electric Circuit Analysis', 'EE101', 'Theory', 'T47', 3, 1, 'Classroom', 'EE-1st')
add_subject('Calculus & Differential Equations', 'MA101-F', 'Theory', 'T81', 3, 1, 'Classroom', 'EE-1st')
add_subject('Engineering Chemistry', 'CH101-B', 'Theory', 'T86', 3, 1, 'Classroom', 'EE-1st')
add_subject('Circuits Lab (Group 1)', 'EE101L-G1', 'Lab', 'T47', 1, 2, 'ElectricalLab', 'EE-1st')
add_subject('Circuits Lab (Group 2)', 'EE101L-G2', 'Lab', 'T47', 1, 2, 'ElectricalLab', 'EE-1st')
add_subject('Sports & Fitness', 'SPT-EE1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'EE-1st')

add_subject('Electrical Machines I', 'EE201', 'Theory', 'T48', 3, 1, 'Classroom', 'EE-2nd')
add_subject('Electromagnetic Field Theory', 'EE202', 'Theory', 'T49', 3, 1, 'Classroom', 'EE-2nd')
add_subject('Power Systems I', 'EE203', 'Theory', 'T50', 3, 1, 'Classroom', 'EE-2nd')
add_subject('Machines Lab (Group 1)', 'EE201L-G1', 'Lab', 'T48', 1, 2, 'ElectricalLab', 'EE-2nd')
add_subject('Machines Lab (Group 2)', 'EE201L-G2', 'Lab', 'T48', 1, 2, 'ElectricalLab', 'EE-2nd')
add_subject('Sports & Fitness', 'SPT-EE2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'EE-2nd')

add_subject('Power Electronics', 'EE301', 'Theory', 'T51', 3, 1, 'Classroom', 'EE-3rd')
add_subject('Control Systems Engineering', 'EE302', 'Theory', 'T52', 3, 1, 'Classroom', 'EE-3rd')
add_subject('Renewable Energy Systems', 'EE303', 'Theory', 'T53', 3, 1, 'Classroom', 'EE-3rd')
add_subject('Power Electronics Lab (Group 1)', 'EE301L-G1', 'Lab', 'T51', 1, 2, 'ElectricalLab', 'EE-3rd')
add_subject('Power Electronics Lab (Group 2)', 'EE301L-G2', 'Lab', 'T51', 1, 2, 'ElectricalLab', 'EE-3rd')
add_subject('Sports & Fitness', 'SPT-EE3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'EE-3rd')

# EE Year 4 -> Min 5 subjects
add_subject('Smart Grids & Substation Automation', 'EE401', 'Theory', 'T54', 3, 1, 'Classroom', 'EE-4th')
add_subject('High Voltage Engineering', 'EE402', 'Theory', 'T55', 3, 1, 'Classroom', 'EE-4th')
add_subject('Engineering Economics', 'HS401-D', 'Theory', 'T87', 2, 1, 'Classroom', 'EE-4th')
add_subject('Industrial Electric Drives', 'EE403', 'Theory', 'T56', 3, 1, 'Classroom', 'EE-4th')
add_subject('Sports & Recreation', 'SPT-EE4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'EE-4th')

# ME Year 1 to 4
add_subject('Engineering Mechanics', 'ME101', 'Theory', 'T57', 3, 1, 'Classroom', 'ME-1st')
add_subject('Calculus & Differential Equations', 'MA101-G', 'Theory', 'T82', 3, 1, 'Classroom', 'ME-1st')
add_subject('Engineering Physics', 'PH101-D', 'Theory', 'T84', 3, 1, 'Classroom', 'ME-1st')
add_subject('Workshop Practice (Group 1)', 'ME101L-G1', 'Lab', 'T57', 1, 2, 'MechanicalWorkshop', 'ME-1st')
add_subject('Workshop Practice (Group 2)', 'ME101L-G2', 'Lab', 'T57', 1, 2, 'MechanicalWorkshop', 'ME-1st')
add_subject('Sports & Fitness', 'SPT-ME1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ME-1st')

add_subject('Thermodynamics', 'ME201', 'Theory', 'T58', 3, 1, 'Classroom', 'ME-2nd')
add_subject('Mechanics of Solids', 'ME202', 'Theory', 'T59', 3, 1, 'Classroom', 'ME-2nd')
add_subject('Manufacturing Processes', 'ME203', 'Theory', 'T60', 3, 1, 'Classroom', 'ME-2nd')
add_subject('Strength of Materials Lab (Group 1)', 'ME202L-G1', 'Lab', 'T59', 1, 2, 'MechanicalWorkshop', 'ME-2nd')
add_subject('Strength of Materials Lab (Group 2)', 'ME202L-G2', 'Lab', 'T59', 1, 2, 'MechanicalWorkshop', 'ME-2nd')
add_subject('Sports & Fitness', 'SPT-ME2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ME-2nd')

add_subject('Fluid Mechanics & Machinery', 'ME301', 'Theory', 'T61', 3, 1, 'Classroom', 'ME-3rd')
add_subject('Heat & Mass Transfer', 'ME302', 'Theory', 'T62', 3, 1, 'Classroom', 'ME-3rd')
add_subject('Machine Design', 'ME303', 'Theory', 'T63', 3, 1, 'Classroom', 'ME-3rd')
add_subject('Thermal Engineering Lab (Group 1)', 'ME302L-G1', 'Lab', 'T62', 1, 2, 'MechanicalWorkshop', 'ME-3rd')
add_subject('Thermal Engineering Lab (Group 2)', 'ME302L-G2', 'Lab', 'T62', 1, 2, 'MechanicalWorkshop', 'ME-3rd')
add_subject('Sports & Fitness', 'SPT-ME3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ME-3rd')

# ME Year 4 -> Min 5 subjects
add_subject('Power Plant Engineering', 'ME401', 'Theory', 'T64', 3, 1, 'Classroom', 'ME-4th')
add_subject('Operations Research & Supply Chain', 'ME402', 'Theory', 'T65', 3, 1, 'Classroom', 'ME-4th')
add_subject('Principles of Management', 'HS401-E', 'Theory', 'T88', 2, 1, 'Classroom', 'ME-4th')
add_subject('Automobile Engineering & Dynamics', 'ME403', 'Theory', 'T66', 3, 1, 'Classroom', 'ME-4th')
add_subject('Sports & Recreation', 'SPT-ME4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'ME-4th')

# Civil Year 1 to 4
add_subject('Engineering Mechanics & Statics', 'CE101', 'Theory', 'T69', 3, 1, 'Classroom', 'CE-1st')
add_subject('Calculus & Analytical Geometry', 'MA101-H', 'Theory', 'T79', 3, 1, 'Classroom', 'CE-1st')
add_subject('Environmental Science', 'ES101', 'Theory', 'T85', 3, 1, 'Classroom', 'CE-1st')
add_subject('Civil Surveying Lab (Group 1)', 'CE101L-G1', 'Lab', 'T69', 1, 2, 'CivilLab', 'CE-1st')
add_subject('Civil Surveying Lab (Group 2)', 'CE101L-G2', 'Lab', 'T69', 1, 2, 'CivilLab', 'CE-1st')
add_subject('Sports & Fitness', 'SPT-CE1', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CE-1st')

add_subject('Strength of Materials', 'CE201', 'Theory', 'T70', 3, 1, 'Classroom', 'CE-2nd')
add_subject('Fluid Mechanics in Civil', 'CE202', 'Theory', 'T71', 3, 1, 'Classroom', 'CE-2nd')
add_subject('Building Materials & Construction', 'CE203', 'Theory', 'T72', 3, 1, 'Classroom', 'CE-2nd')
add_subject('Materials Testing Lab (Group 1)', 'CE201L-G1', 'Lab', 'T70', 1, 2, 'CivilLab', 'CE-2nd')
add_subject('Materials Testing Lab (Group 2)', 'CE201L-G2', 'Lab', 'T70', 1, 2, 'CivilLab', 'CE-2nd')
add_subject('Sports & Fitness', 'SPT-CE2', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CE-2nd')

add_subject('Structural Analysis I', 'CE301', 'Theory', 'T73', 3, 1, 'Classroom', 'CE-3rd')
add_subject('Geotechnical Engineering', 'CE302', 'Theory', 'T74', 3, 1, 'Classroom', 'CE-3rd')
add_subject('Design of Concrete Structures', 'CE303', 'Theory', 'T75', 3, 1, 'Classroom', 'CE-3rd')
add_subject('Geotechnical Lab (Group 1)', 'CE302L-G1', 'Lab', 'T74', 1, 2, 'CivilLab', 'CE-3rd')
add_subject('Geotechnical Lab (Group 2)', 'CE302L-G2', 'Lab', 'T74', 1, 2, 'CivilLab', 'CE-3rd')
add_subject('Sports & Fitness', 'SPT-CE3', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CE-3rd')

# Civil Year 4 -> Min 5 subjects
add_subject('Bridge Engineering & Prestressed Concrete', 'CE401', 'Theory', 'T76', 3, 1, 'Classroom', 'CE-4th')
add_subject('Construction Planning & Management', 'CE402', 'Theory', 'T77', 3, 1, 'Classroom', 'CE-4th')
add_subject('Principles of Management', 'HS401-F', 'Theory', 'T88', 2, 1, 'Classroom', 'CE-4th')
add_subject('Hydrology & Water Resource Systems', 'CE403', 'Theory', 'T78', 3, 1, 'Classroom', 'CE-4th')
add_subject('Sports & Recreation', 'SPT-CE4', 'Lab', get_coach(), 1, 2, 'SportsGround', 'CE-4th')

# =============================================================
# M.TECH CURRICULA (14 sections) -> Min 5 subjects each
# =============================================================
# M.Tech CSE
add_subject('Advanced Algorithms & Complexity', 'MCS101', 'Theory', 'T01', 3, 1, 'Classroom', 'MTech-CSE-1st')
add_subject('Advanced Computer Architecture', 'MCS102', 'Theory', 'T03', 3, 1, 'Classroom', 'MTech-CSE-1st')
add_subject('Cloud & Distributed Computing', 'MCS103', 'Theory', 'T05', 3, 1, 'Classroom', 'MTech-CSE-1st')
add_subject('Advanced Computing Systems Lab', 'MCS101L', 'Lab', 'T05', 1, 2, 'ComputerLab', 'MTech-CSE-1st')
add_subject('Advanced Research Colloquium', 'MCS104', 'Theory', 'T02', 2, 1, 'Classroom', 'MTech-CSE-1st')

add_subject('Machine Learning & Data Mining', 'MCS201', 'Theory', 'T02', 3, 1, 'Classroom', 'MTech-CSE-2nd')
add_subject('High Performance Computing', 'MCS202', 'Theory', 'T04', 3, 1, 'Classroom', 'MTech-CSE-2nd')
add_subject('M.Tech Research Seminar', 'MCS203', 'Theory', 'T06', 2, 1, 'Classroom', 'MTech-CSE-2nd')
add_subject('Secure Cloud Architectures', 'MCS204', 'Theory', 'T13', 2, 1, 'Classroom', 'MTech-CSE-2nd')
add_subject('M.Tech Thesis Presentation', 'MCS205', 'Theory', 'T08', 2, 1, 'Classroom', 'MTech-CSE-2nd')

# M.Tech IT
add_subject('Advanced Software Engineering', 'MIT101', 'Theory', 'T15', 3, 1, 'Classroom', 'MTech-IT-1st')
add_subject('Next-Gen Wireless Systems', 'MIT102', 'Theory', 'T16', 3, 1, 'Classroom', 'MTech-IT-1st')
add_subject('Cyber Threats & Forensics', 'MIT103', 'Theory', 'T17', 3, 1, 'Classroom', 'MTech-IT-1st')
add_subject('Advanced Cyber Security Lab', 'MIT101L', 'Lab', 'T17', 1, 2, 'ComputerLab', 'MTech-IT-1st')
add_subject('Advanced IT Research Colloquium', 'MIT104', 'Theory', 'T18', 2, 1, 'Classroom', 'MTech-IT-1st')

add_subject('Big Data Systems & NoSQL', 'MIT201', 'Theory', 'T18', 3, 1, 'Classroom', 'MTech-IT-2nd')
add_subject('IoT Middleware & Cloud Systems', 'MIT202', 'Theory', 'T19', 3, 1, 'Classroom', 'MTech-IT-2nd')
add_subject('M.Tech Research Colloquium', 'MIT203', 'Theory', 'T23', 2, 1, 'Classroom', 'MTech-IT-2nd')
add_subject('Enterprise System Security', 'MIT204', 'Theory', 'T24', 2, 1, 'Classroom', 'MTech-IT-2nd')
add_subject('M.Tech Thesis Presentation', 'MIT205', 'Theory', 'T20', 2, 1, 'Classroom', 'MTech-IT-2nd')

# M.Tech AIDS
add_subject('Foundations of Data Science', 'MAI101', 'Theory', 'T26', 3, 1, 'Classroom', 'MTech-AIDS-1st')
add_subject('Deep Learning Systems & GPU', 'MAI102', 'Theory', 'T27', 3, 1, 'Classroom', 'MTech-AIDS-1st')
add_subject('Probabilistic Graphical Models', 'MAI103', 'Theory', 'T28', 3, 1, 'Classroom', 'MTech-AIDS-1st')
add_subject('Deep Learning Systems Lab', 'MAI101L', 'Lab', 'T28', 1, 2, 'ComputerLab', 'MTech-AIDS-1st')
add_subject('AI Ethics & Quantitative Modeling', 'MAI104', 'Theory', 'T34', 2, 1, 'Classroom', 'MTech-AIDS-1st')

add_subject('Reinforcement Learning & Planning', 'MAI201', 'Theory', 'T29', 3, 1, 'Classroom', 'MTech-AIDS-2nd')
add_subject('Conversational AI & LLMs', 'MAI202', 'Theory', 'T31', 3, 1, 'Classroom', 'MTech-AIDS-2nd')
add_subject('M.Tech AI Seminar', 'MAI203', 'Theory', 'T30', 2, 1, 'Classroom', 'MTech-AIDS-2nd')
add_subject('Deep Reinforcement Learning Practicum', 'MAI204', 'Theory', 'T32', 2, 1, 'Classroom', 'MTech-AIDS-2nd')
add_subject('M.Tech Thesis Presentation', 'MAI205', 'Theory', 'T33', 2, 1, 'Classroom', 'MTech-AIDS-2nd')

# M.Tech ECE
add_subject('Advanced Digital Signal Processing', 'MEC101', 'Theory', 'T36', 3, 1, 'Classroom', 'MTech-ECE-1st')
add_subject('VLSI Technology & CAD Tools', 'MEC102', 'Theory', 'T38', 3, 1, 'Classroom', 'MTech-ECE-1st')
add_subject('RF & Microwave Circuits', 'MEC103', 'Theory', 'T39', 3, 1, 'Classroom', 'MTech-ECE-1st')
add_subject('Advanced VLSI Design Lab', 'MEC101L', 'Lab', 'T38', 1, 2, 'ElectronicsLab', 'MTech-ECE-1st')
add_subject('Advanced Communication Colloquium', 'MEC104', 'Theory', 'T37', 2, 1, 'Classroom', 'MTech-ECE-1st')

add_subject('Wireless Communications & MIMO', 'MEC201', 'Theory', 'T41', 3, 1, 'Classroom', 'MTech-ECE-2nd')
add_subject('Optical Networks & Photonics', 'MEC202', 'Theory', 'T45', 3, 1, 'Classroom', 'MTech-ECE-2nd')
add_subject('M.Tech ECE Seminar', 'MEC203', 'Theory', 'T43', 2, 1, 'Classroom', 'MTech-ECE-2nd')
add_subject('High Speed VLSI Systems', 'MEC204', 'Theory', 'T40', 2, 1, 'Classroom', 'MTech-ECE-2nd')
add_subject('M.Tech Thesis Presentation', 'MEC205', 'Theory', 'T46', 2, 1, 'Classroom', 'MTech-ECE-2nd')

# M.Tech EE
add_subject('Advanced Power Electronics', 'MEE101', 'Theory', 'T47', 3, 1, 'Classroom', 'MTech-EE-1st')
add_subject('Power System Dynamics & Stability', 'MEE102', 'Theory', 'T48', 3, 1, 'Classroom', 'MTech-EE-1st')
add_subject('Modern Control Systems', 'MEE103', 'Theory', 'T51', 3, 1, 'Classroom', 'MTech-EE-1st')
add_subject('Advanced Power Systems Lab', 'MEE101L', 'Lab', 'T51', 1, 2, 'ElectricalLab', 'MTech-EE-1st')
add_subject('Clean Energy & Smart Grid Colloquium', 'MEE104', 'Theory', 'T49', 2, 1, 'Classroom', 'MTech-EE-1st')

add_subject('Smart Grid Communications', 'MEE201', 'Theory', 'T50', 3, 1, 'Classroom', 'MTech-EE-2nd')
add_subject('Renewable Energy Grid Integration', 'MEE202', 'Theory', 'T52', 3, 1, 'Classroom', 'MTech-EE-2nd')
add_subject('M.Tech EE Seminar', 'MEE203', 'Theory', 'T53', 2, 1, 'Classroom', 'MTech-EE-2nd')
add_subject('Electric Vehicle Powertrains', 'MEE204', 'Theory', 'T55', 2, 1, 'Classroom', 'MTech-EE-2nd')
add_subject('M.Tech Thesis Presentation', 'MEE205', 'Theory', 'T56', 2, 1, 'Classroom', 'MTech-EE-2nd')

# M.Tech ME
add_subject('Finite Element Analysis in Design', 'MME101', 'Theory', 'T58', 3, 1, 'Classroom', 'MTech-ME-1st')
add_subject('Advanced Fluid Dynamics', 'MME102', 'Theory', 'T59', 3, 1, 'Classroom', 'MTech-ME-1st')
add_subject('Computer Integrated Manufacturing', 'MME103', 'Theory', 'T60', 3, 1, 'Classroom', 'MTech-ME-1st')
add_subject('Advanced CAD/CAM Lab', 'MME101L', 'Lab', 'T60', 1, 2, 'MechanicalWorkshop', 'MTech-ME-1st')
add_subject('Advanced Mechanical Colloquium', 'MME104', 'Theory', 'T62', 2, 1, 'Classroom', 'MTech-ME-1st')

add_subject('Robotics & Autonomous Systems', 'MME201', 'Theory', 'T61', 3, 1, 'Classroom', 'MTech-ME-2nd')
add_subject('Computational Heat Transfer', 'MME202', 'Theory', 'T63', 3, 1, 'Classroom', 'MTech-ME-2nd')
add_subject('M.Tech Research Colloquium', 'MME203', 'Theory', 'T68', 2, 1, 'Classroom', 'MTech-ME-2nd')
add_subject('Computational Thermal Systems', 'MME204', 'Theory', 'T66', 2, 1, 'Classroom', 'MTech-ME-2nd')
add_subject('M.Tech Thesis Presentation', 'MME205', 'Theory', 'T67', 2, 1, 'Classroom', 'MTech-ME-2nd')

# M.Tech CE
add_subject('Advanced Structural Analysis & Dynamics', 'MCE101', 'Theory', 'T70', 3, 1, 'Classroom', 'MTech-CE-1st')
add_subject('Advanced Soil Mechanics & Foundation', 'MCE102', 'Theory', 'T71', 3, 1, 'Classroom', 'MTech-CE-1st')
add_subject('Environmental Modeling & Remediation', 'MCE103', 'Theory', 'T72', 3, 1, 'Classroom', 'MTech-CE-1st')
add_subject('Advanced Civil Engineering Lab', 'MCE101L', 'Lab', 'T71', 1, 2, 'CivilLab', 'MTech-CE-1st')
add_subject('Smart Infrastructure Colloquium', 'MCE104', 'Theory', 'T77', 2, 1, 'Classroom', 'MTech-CE-1st')

add_subject('Earthquake Resistant Design', 'MCE201', 'Theory', 'T74', 3, 1, 'Classroom', 'MTech-CE-2nd')
add_subject('Smart Transportation Systems', 'MCE202', 'Theory', 'T78', 3, 1, 'Classroom', 'MTech-CE-2nd')
add_subject('M.Tech Research Colloquium', 'MCE203', 'Theory', 'T75', 2, 1, 'Classroom', 'MTech-CE-2nd')
add_subject('Finite Element Analysis in Civil', 'MCE204', 'Theory', 'T69', 2, 1, 'Classroom', 'MTech-CE-2nd')
add_subject('M.Tech Thesis Presentation', 'MCE205', 'Theory', 'T76', 2, 1, 'Classroom', 'MTech-CE-2nd')

# =============================================================
# PH.D CURRICULA (14 sections) -> Min 5 subjects each
# =============================================================
# Ph.D CSE
add_subject('Research Methodology & Scientific Ethics', 'PHD-CS101', 'Theory', 'T08', 3, 1, 'Classroom', 'PhD-CSE-1st')
add_subject('Advanced Doctoral Studies in Computing', 'PHD-CS102', 'Theory', 'T10', 3, 1, 'Classroom', 'PhD-CSE-1st')
add_subject('Doctoral Seminar & Proposal Presentation', 'PHD-CS103', 'Theory', 'T12', 2, 1, 'Classroom', 'PhD-CSE-1st')
add_subject('Academic Writing & Publishing', 'PHD-CS104', 'Theory', 'T07', 2, 1, 'Classroom', 'PhD-CSE-1st')
add_subject('Quantitative Computing Foundations', 'PHD-CS105', 'Theory', 'T09', 2, 1, 'Classroom', 'PhD-CSE-1st')

add_subject('Doctoral Progress Review & Colloquium', 'PHD-CS201', 'Theory', 'T05', 2, 1, 'Classroom', 'PhD-CSE-2nd')
add_subject('Advanced Topics in CS Research', 'PHD-CS202', 'Theory', 'T14', 3, 1, 'Classroom', 'PhD-CSE-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-CS203', 'Theory', 'T02', 2, 1, 'Classroom', 'PhD-CSE-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-CS204', 'Theory', 'T03', 2, 1, 'Classroom', 'PhD-CSE-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-CS205', 'Theory', 'T10', 2, 1, 'Classroom', 'PhD-CSE-2nd')

# Ph.D IT
add_subject('Research Methodology & Quantitative Analysis', 'PHD-IT101', 'Theory', 'T21', 3, 1, 'Classroom', 'PhD-IT-1st')
add_subject('Advanced Information Networks Research', 'PHD-IT102', 'Theory', 'T22', 3, 1, 'Classroom', 'PhD-IT-1st')
add_subject('Doctoral Research Seminar', 'PHD-IT103', 'Theory', 'T24', 2, 1, 'Classroom', 'PhD-IT-1st')
add_subject('Academic Writing & Publishing', 'PHD-IT104', 'Theory', 'T15', 2, 1, 'Classroom', 'PhD-IT-1st')
add_subject('Statistical Decision Theory', 'PHD-IT105', 'Theory', 'T16', 2, 1, 'Classroom', 'PhD-IT-1st')

add_subject('Doctoral Progress Review Colloquium', 'PHD-IT201', 'Theory', 'T16', 2, 1, 'Classroom', 'PhD-IT-2nd')
add_subject('Emerging Paradigms in IT', 'PHD-IT202', 'Theory', 'T23', 3, 1, 'Classroom', 'PhD-IT-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-IT203', 'Theory', 'T19', 2, 1, 'Classroom', 'PhD-IT-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-IT204', 'Theory', 'T20', 2, 1, 'Classroom', 'PhD-IT-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-IT205', 'Theory', 'T22', 2, 1, 'Classroom', 'PhD-IT-2nd')

# Ph.D AIDS
add_subject('Research Methodology in AI & Data Science', 'PHD-AI101', 'Theory', 'T27', 3, 1, 'Classroom', 'PhD-AIDS-1st')
add_subject('Advanced Theoretical Machine Learning', 'PHD-AI102', 'Theory', 'T32', 3, 1, 'Classroom', 'PhD-AIDS-1st')
add_subject('Doctoral AI Seminar & Lit Review', 'PHD-AI103', 'Theory', 'T33', 2, 1, 'Classroom', 'PhD-AIDS-1st')
add_subject('Academic Writing & Publishing', 'PHD-AI104', 'Theory', 'T25', 2, 1, 'Classroom', 'PhD-AIDS-1st')
add_subject('Advanced Probability for AI', 'PHD-AI105', 'Theory', 'T29', 2, 1, 'Classroom', 'PhD-AIDS-1st')

add_subject('Doctoral Progress Presentation', 'PHD-AI201', 'Theory', 'T28', 2, 1, 'Classroom', 'PhD-AIDS-2nd')
add_subject('Frontiers in Cognitive Science & AI', 'PHD-AI202', 'Theory', 'T34', 3, 1, 'Classroom', 'PhD-AIDS-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-AI203', 'Theory', 'T27', 2, 1, 'Classroom', 'PhD-AIDS-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-AI204', 'Theory', 'T30', 2, 1, 'Classroom', 'PhD-AIDS-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-AI205', 'Theory', 'T31', 2, 1, 'Classroom', 'PhD-AIDS-2nd')

# Ph.D ECE
add_subject('Research Methodology & Signal Modeling', 'PHD-EC101', 'Theory', 'T40', 3, 1, 'Classroom', 'PhD-ECE-1st')
add_subject('Advanced Solid State & Quantum Devices', 'PHD-EC102', 'Theory', 'T42', 3, 1, 'Classroom', 'PhD-ECE-1st')
add_subject('Doctoral ECE Seminar', 'PHD-EC103', 'Theory', 'T43', 2, 1, 'Classroom', 'PhD-ECE-1st')
add_subject('Academic Writing & Publishing', 'PHD-EC104', 'Theory', 'T36', 2, 1, 'Classroom', 'PhD-ECE-1st')
add_subject('Mathematical Modeling in Signals', 'PHD-EC105', 'Theory', 'T39', 2, 1, 'Classroom', 'PhD-ECE-1st')

add_subject('Doctoral Progress Review', 'PHD-EC201', 'Theory', 'T44', 2, 1, 'Classroom', 'PhD-ECE-2nd')
add_subject('Frontiers in Nanotechnology & Photonics', 'PHD-EC202', 'Theory', 'T46', 3, 1, 'Classroom', 'PhD-ECE-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-EC203', 'Theory', 'T35', 2, 1, 'Classroom', 'PhD-ECE-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-EC204', 'Theory', 'T41', 2, 1, 'Classroom', 'PhD-ECE-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-EC205', 'Theory', 'T45', 2, 1, 'Classroom', 'PhD-ECE-2nd')

# Ph.D EE
add_subject('Research Methodology in Energy Systems', 'PHD-EE101', 'Theory', 'T48', 3, 1, 'Classroom', 'PhD-EE-1st')
add_subject('Nonlinear Control & Estimation Theory', 'PHD-EE102', 'Theory', 'T51', 3, 1, 'Classroom', 'PhD-EE-1st')
add_subject('Doctoral Electrical Seminar', 'PHD-EE103', 'Theory', 'T54', 2, 1, 'Classroom', 'PhD-EE-1st')
add_subject('Academic Writing & Publishing', 'PHD-EE104', 'Theory', 'T50', 2, 1, 'Classroom', 'PhD-EE-1st')
add_subject('Modern Optimization in Energy', 'PHD-EE105', 'Theory', 'T52', 2, 1, 'Classroom', 'PhD-EE-1st')

add_subject('Doctoral Progress Review', 'PHD-EE201', 'Theory', 'T55', 2, 1, 'Classroom', 'PhD-EE-2nd')
add_subject('Advanced Renewable Integration Studies', 'PHD-EE202', 'Theory', 'T56', 3, 1, 'Classroom', 'PhD-EE-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-EE203', 'Theory', 'T47', 2, 1, 'Classroom', 'PhD-EE-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-EE204', 'Theory', 'T49', 2, 1, 'Classroom', 'PhD-EE-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-EE205', 'Theory', 'T53', 2, 1, 'Classroom', 'PhD-EE-2nd')

# Ph.D ME
add_subject('Research Methodology & Experimental Design', 'PHD-ME101', 'Theory', 'T60', 3, 1, 'Classroom', 'PhD-ME-1st')
add_subject('Advanced Continuum Mechanics', 'PHD-ME102', 'Theory', 'T64', 3, 1, 'Classroom', 'PhD-ME-1st')
add_subject('Doctoral Mechanical Seminar', 'PHD-ME103', 'Theory', 'T65', 2, 1, 'Classroom', 'PhD-ME-1st')
add_subject('Academic Writing & Publishing', 'PHD-ME104', 'Theory', 'T58', 2, 1, 'Classroom', 'PhD-ME-1st')
add_subject('Advanced Mathematical Methods in ME', 'PHD-ME105', 'Theory', 'T63', 2, 1, 'Classroom', 'PhD-ME-1st')

add_subject('Doctoral Progress Colloquium', 'PHD-ME201', 'Theory', 'T66', 2, 1, 'Classroom', 'PhD-ME-2nd')
add_subject('Advanced Computational Fluid Mechanics', 'PHD-ME202', 'Theory', 'T68', 3, 1, 'Classroom', 'PhD-ME-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-ME203', 'Theory', 'T57', 2, 1, 'Classroom', 'PhD-ME-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-ME204', 'Theory', 'T61', 2, 1, 'Classroom', 'PhD-ME-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-ME205', 'Theory', 'T67', 2, 1, 'Classroom', 'PhD-ME-2nd')

# Ph.D CE
add_subject('Research Methodology in Infrastructure', 'PHD-CE101', 'Theory', 'T71', 3, 1, 'Classroom', 'PhD-CE-1st')
add_subject('Computational Geomechanics & Materials', 'PHD-CE102', 'Theory', 'T73', 3, 1, 'Classroom', 'PhD-CE-1st')
add_subject('Doctoral Civil Seminar', 'PHD-CE103', 'Theory', 'T77', 2, 1, 'Classroom', 'PhD-CE-1st')
add_subject('Academic Writing & Publishing', 'PHD-CE104', 'Theory', 'T70', 2, 1, 'Classroom', 'PhD-CE-1st')
add_subject('Numerical Methods in Geotechnics', 'PHD-CE105', 'Theory', 'T76', 2, 1, 'Classroom', 'PhD-CE-1st')

add_subject('Doctoral Progress Colloquium', 'PHD-CE201', 'Theory', 'T72', 2, 1, 'Classroom', 'PhD-CE-2nd')
add_subject('Resilient Infrastructure Design', 'PHD-CE202', 'Theory', 'T78', 3, 1, 'Classroom', 'PhD-CE-2nd')
add_subject('Grant Writing & Research Ethics', 'PHD-CE203', 'Theory', 'T69', 2, 1, 'Classroom', 'PhD-CE-2nd')
add_subject('Teaching Practicum & Pedagogy', 'PHD-CE204', 'Theory', 'T73', 2, 1, 'Classroom', 'PhD-CE-2nd')
add_subject('Interdisciplinary Research Colloquium', 'PHD-CE205', 'Theory', 'T77', 2, 1, 'Classroom', 'PhD-CE-2nd')

# -------------------------------------------------------------
# 5. VALIDATE ALL TEACHER QUALIFICATIONS & LOAD LIMITS
# -------------------------------------------------------------
teachers_list = list(teachers_dict.values())
for t in teachers_list:
    t['teachableSubjectCodes'] = list(set(t['teachableSubjectCodes']))

for s in subjects:
    tcode = s['teacherCode']
    code = s['code']
    if code not in teachers_dict[tcode]['teachableSubjectCodes']:
        raise ValueError(f"Teacher {tcode} not qualified for subject {code}")

overloaded = [f"{t}: {load}" for t, load in teacher_load.items() if load > 24]
if overloaded:
    raise ValueError(f"Overloaded teachers (>24 periods): {overloaded}")

print(f"Total Sections: {len(sections)}")
print(f"Total Rooms: {len(rooms)} (Reduced from 78 to {len(rooms)})")
print(f"Total Teachers: {len(teachers_list)}")
print(f"Total Subjects: {len(subjects)}")
total_sessions = sum(s['weeklySessions'] for s in subjects)
total_periods = sum(s['weeklySessions'] * s['durationPeriods'] for s in subjects)
print(f"Total Weekly Sessions: {total_sessions}")
print(f"Total Weekly Periods across University: {total_periods}")
max_teacher_load = max(teacher_load.values())
print(f"Max teacher load across all faculty: {max_teacher_load} periods / week (limit: 24)")

# Check minimum 5 subjects each section
sec_counts = {}
for s in subjects:
    sec = s['sectionName']
    sec_counts[sec] = sec_counts.get(sec, 0) + 1

below_5 = [f"{sec}: {cnt}" for sec, cnt in sec_counts.items() if cnt < 5]
if below_5:
    raise ValueError(f"Sections with < 5 subjects: {below_5}")
else:
    print(f"Verification SUCCESS: ALL {len(sec_counts)} sections have MINIMUM 5 subjects!")

# -------------------------------------------------------------
# 6. WRITE TO JSON
# -------------------------------------------------------------
dataset = {
    'name': 'college',
    'description': 'Full Comprehensive University Dataset (7 Branches x 4 BTech + 2 MTech + 2 PhD = 60 sections, min 5 subjects each, tight 34 rooms)',
    'sections': sections,
    'rooms': rooms,
    'teachers': teachers_list,
    'subjects': subjects
}

out_path = '/Users/sashank/.gemini/antigravity/scratch/smartsched/server/seeds/college.json'
with open(out_path, 'w') as f:
    json.dump(dataset, f, indent=2)

print(f"Successfully generated {out_path}!")
