import json
import os

SEEDS_DIR = os.path.join(os.path.dirname(__file__), '../server/seeds')
os.makedirs(SEEDS_DIR, exist_ok=True)

# --------------------------------------------------------------------------
# PRESET 1: NIT Comprehensive (Engineering & Technology)
# --------------------------------------------------------------------------
def gen_nit_delhi():
    departments = [
        ('Computer Science', 'CSE', True),
        ('Information Technology', 'IT', False),
        ('AI & Data Science', 'AIDS', False),
        ('Electronics', 'ECE', False),
        ('Electrical', 'EE', False),
        ('Mechanical', 'ME', False),
        ('Civil', 'CE', False)
    ]
    
    sections = []
    for dept_name, prefix, has_double_btech in departments:
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

    # Branch-Dedicated Classrooms (Limited LTs: 6 per branch x 7 = 42 LTs)
    # Interleaved: CS1 & CS2 share LH-prefix-101..401, MTech 1st & 2nd share PG-prefix, PhD 1st & 2nd share SEM-prefix
    rooms = []
    for dept_name, prefix, _ in departments:
        # BTech Years 1 to 4 Lecture Theatres
        for yr in [1, 2, 3, 4]:
            rooms.append({
                'name': f'{dept_name} Lecture Hall {yr}01',
                'roomNumber': f'LH-{prefix}-{yr}01',
                'type': 'Classroom',
                'department': dept_name,
                'capacity': 75
            })
        # MTech Seminar Room
        rooms.append({
            'name': f'{dept_name} PG Seminar Room',
            'roomNumber': f'PG-{prefix}-101',
            'type': 'Classroom',
            'department': dept_name,
            'capacity': 45
        })
        # PhD Research Seminar Hall
        rooms.append({
            'name': f'{dept_name} PhD Research Hall',
            'roomNumber': f'SEM-{prefix}-PHD',
            'type': 'Classroom',
            'department': dept_name,
            'capacity': 35
        })

    # Specialized Labs (General/Shared across departments if subject requires it)
    for i in range(1, 4):
        rooms.append({'name': f'Computer Science Lab {i}', 'roomNumber': f'CSLAB-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'AI & Machine Learning Lab 1', 'roomNumber': 'AIDSLAB-1', 'type': 'ComputerLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'AI & Machine Learning Lab 2', 'roomNumber': 'AIDSLAB-2', 'type': 'ComputerLab', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Electronics Devices Lab', 'roomNumber': 'ECLAB-1', 'type': 'ElectronicsLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Communication Systems Lab', 'roomNumber': 'ECLAB-2', 'type': 'ElectronicsLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'VLSI & Microelectronics Lab', 'roomNumber': 'VLSILAB', 'type': 'ElectronicsLab', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Electrical Circuits Lab', 'roomNumber': 'EELAB-1', 'type': 'ElectricalLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Electrical Machines Lab', 'roomNumber': 'EELAB-2', 'type': 'ElectricalLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Power Systems & Drives Lab', 'roomNumber': 'POWLAB', 'type': 'ElectricalLab', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Mechanical Workshop 1', 'roomNumber': 'MEWK-1', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Mechanical Workshop 2', 'roomNumber': 'MEWK-2', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'CAD/CAM Modeling Lab', 'roomNumber': 'MEWK-3', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Thermal & Fluid Dynamics Lab', 'roomNumber': 'TFLAB', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Surveying & Geomatics Lab', 'roomNumber': 'CIVILLAB-1', 'type': 'CivilLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Geotechnical Engineering Lab', 'roomNumber': 'CIVILLAB-2', 'type': 'CivilLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Concrete Testing Lab', 'roomNumber': 'CONCLAB', 'type': 'CivilLab', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Engineering Physics Lab 1', 'roomNumber': 'PHYLAB-1', 'type': 'PhysicsLab', 'department': 'General', 'capacity': 38})
    rooms.append({'name': 'Engineering Chemistry Lab 1', 'roomNumber': 'CHMLAB-1', 'type': 'ChemistryLab', 'department': 'General', 'capacity': 38})

    rooms.append({'name': 'Main Sports Stadium', 'roomNumber': 'SPORTS-1', 'type': 'SportsGround', 'department': 'General', 'capacity': 300})
    rooms.append({'name': 'East Athletic Ground', 'roomNumber': 'SPORTS-2', 'type': 'SportsGround', 'department': 'General', 'capacity': 300})

    # Faculty Pool (94 teachers)
    teachers = []
    # Read faculty from existing college.json or generate
    with open(os.path.join(SEEDS_DIR, 'college.json'), 'r') as f:
        old_data = json.load(f)
    teachers = old_data.get('teachers', [])
    subjects = old_data.get('subjects', [])

    preset_1 = {
        'id': 'preset_1_nit_delhi',
        'title': 'NIT Comprehensive (Engineering & Tech)',
        'category': 'Engineering & Technology',
        'description': 'Full university dataset: 7 branches (CSE, IT, AIDS, ECE, EE, ME, CE) with branch-locked LTs and sub-section interleaving (CS1/CS2). Minimum 5 subjects per section.',
        'badge': f'{len(sections)} Sections • {len(rooms)} Rooms • {len(subjects)} Subjects',
        'sections': sections,
        'rooms': rooms,
        'teachers': teachers,
        'subjects': subjects
    }
    
    with open(os.path.join(SEEDS_DIR, 'preset_1_nit_delhi.json'), 'w') as f:
        json.dump(preset_1, f, indent=2)
    # Also update college.json so it matches
    with open(os.path.join(SEEDS_DIR, 'college.json'), 'w') as f:
        json.dump(preset_1, f, indent=2)
    print(f"NIT Comprehensive updated: {len(sections)} sections, {len(rooms)} rooms, {len(subjects)} subjects")

gen_nit_delhi()

# Helper for other 6 presets
def build_dataset(dataset_id, title, category, description, badge, depts, room_spec, subjects_template, faculty_pool_generator):
    sections = []
    teachers = []
    rooms = []
    
    # 1. Sections
    for dept_name, prefix, years in depts:
        for yr_code, yr_lbl, std_count in years:
            sec_name = f"{prefix}-{yr_lbl}"
            sections.append({
                'name': sec_name,
                'department': dept_name,
                'studentCount': std_count
            })
            
    # 2. Rooms
    for r in room_spec:
        rooms.append(r)
        
    # 3. Faculty
    teachers = faculty_pool_generator()
        
    # 4. Subjects
    subjects = subjects_template(sections, teachers)
    
    data = {
        'id': dataset_id,
        'title': title,
        'category': category,
        'description': description,
        'badge': f"{len(sections)} Sections • {len(rooms)} Rooms • {len(subjects)} Subjects",
        'sections': sections,
        'rooms': rooms,
        'teachers': teachers,
        'subjects': subjects
    }
    
    with open(os.path.join(SEEDS_DIR, f"{dataset_id}.json"), 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Generated {dataset_id}: {len(sections)} sections, {len(rooms)} rooms, {len(teachers)} teachers, {len(subjects)} subjects")
    return data

# --------------------------------------------------------------------------
# PRESET 2: IIT Advanced Tech & Research
# --------------------------------------------------------------------------
def gen_iit():
    depts = [
        ('Computer Science & HPC', 'CSE', [('1st', '1st', 70), ('2nd', '2nd', 70), ('3rd', '3rd', 70), ('4th', '4th', 70), ('MTech1', 'MTech-1st', 30), ('MTech2', 'MTech-2nd', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('AI & Robotics', 'AIR', [('1st', '1st', 65), ('2nd', '2nd', 65), ('3rd', '3rd', 65), ('4th', '4th', 65), ('MTech1', 'MTech-1st', 25), ('MTech2', 'MTech-2nd', 25), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Microelectronics & VLSI', 'VLSI', [('1st', '1st', 65), ('2nd', '2nd', 65), ('3rd', '3rd', 65), ('4th', '4th', 65), ('MTech1', 'MTech-1st', 25), ('MTech2', 'MTech-2nd', 25), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Aerospace & Avionics', 'AERO', [('1st', '1st', 60), ('2nd', '2nd', 60), ('3rd', '3rd', 60), ('4th', '4th', 60), ('MTech1', 'MTech-1st', 25), ('MTech2', 'MTech-2nd', 25), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Materials Science & Nano', 'MAT', [('1st', '1st', 60), ('2nd', '2nd', 60), ('3rd', '3rd', 60), ('4th', '4th', 60), ('MTech1', 'MTech-1st', 20), ('MTech2', 'MTech-2nd', 20), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Quantum Systems & Physics', 'QUANT', [('1st', '1st', 55), ('2nd', '2nd', 55), ('3rd', '3rd', 55), ('4th', '4th', 55), ('MTech1', 'MTech-1st', 20), ('MTech2', 'MTech-2nd', 20), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Chemical & Bio-Engineering', 'CHEM', [('1st', '1st', 55), ('2nd', '2nd', 55), ('3rd', '3rd', 55), ('4th', '4th', 55), ('MTech1', 'MTech-1st', 20), ('MTech2', 'MTech-2nd', 20)])
    ]
    
    rooms = []
    # Branch-Dedicated Classrooms (Limited LTs: 5-6 per branch)
    for dept_name, prefix, _ in depts:
        for yr in [1, 2, 3, 4]:
            rooms.append({'name': f'{dept_name} Lecture Hall {yr}01', 'roomNumber': f'LT-{prefix}-{yr}01', 'type': 'Classroom', 'department': dept_name, 'capacity': 80})
        rooms.append({'name': f'{dept_name} PG Seminar Room', 'roomNumber': f'PG-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 45})
        rooms.append({'name': f'{dept_name} Research Hall', 'roomNumber': f'SEM-{prefix}-PHD', 'type': 'Classroom', 'department': dept_name, 'capacity': 35})

    # Labs (open across branches)
    for i in range(1, 5):
        rooms.append({'name': f'HPC Supercomputing Lab {i}', 'roomNumber': f'HPC-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 40})
    for i in range(1, 4):
        rooms.append({'name': f'Autonomous Robotics Lab {i}', 'roomNumber': f'ROBO-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 40})
    for i in range(1, 4):
        rooms.append({'name': f'VLSI Cleanroom Fab {i}', 'roomNumber': f'FAB-{i}', 'type': 'ElectronicsLab', 'department': 'General', 'capacity': 40})
    for i in range(1, 3):
        rooms.append({'name': f'Aerodynamics Wind Tunnel {i}', 'roomNumber': f'WIND-{i}', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 40})
    for i in range(1, 3):
        rooms.append({'name': f'Quantum Optics & Materials Lab {i}', 'roomNumber': f'QMAT-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 40})
        
    def gen_fac():
        fac = []
        names = ['H. K. Verma', 'S. Sen', 'A. Sengupta', 'V. Natarajan', 'P. Biswas', 'K. Ramamurthy', 'D. Chakravarty', 
                 'M. Banerjee', 'T. Roy', 'N. Balakrishnan', 'B. C. Rao', 'S. Mahapatra', 'R. Govindarajan', 'G. K. Ananthasuresh',
                 'S. S. Murthy', 'K. V. S. Hari', 'A. Chockalingam', 'Y. Narahari', 'U. Ramamurty', 'E. D. Jemmis', 'B. Bagchi',
                 'A. K. Shukla', 'S. Sampath', 'D. D. Sarma', 'A. K. Sood', 'S. Ramasesha', 'P. S. Anil Kumar', 'V. Venkataraman',
                 'R. Srikant', 'S. K. Sikdar', 'V. S. Borkar', 'S. P. Arun', 'K. V. Venkatesh', 'A. Q. Contractor', 'J. Vasi',
                 'C. Amarnath', 'D. N. Buragohain', 'S. L. Narayanamurthy', 'S. Suryanarayan', 'P. K. Kelkar', 'M. S. Ananth',
                 'P. R. Krishnaswamy', 'K. A. Damodaran', 'S. C. Rajvanshi', 'A. K. Mallik', 'G. Biswas', 'K. Muralidhar',
                 'P. K. Ghosh', 'S. G. Dhande', 'V. Eswaran', 'A. K. Sharma', 'B. K. Mathur', 'P. K. J. Mohapatra', 'S. C. Dutta Roy',
                 'K. Thyagarajan', 'B. P. Pal', 'A. K. Ghatak', 'M. S. Sodha', 'V. K. Tripathi', 'D. Subbarao', 'H. K. Sehgal',
                 'B. B. Tripathi', 'S. C. Kashyap', 'D. K. Pandya', 'L. K. Malhotra', 'V. D. Vankar', 'R. D. Tarey', 'S. K. Koul',
                 'B. Bhat', 'R. Bahl', 'A. Kumar', 'S. Prasad', 'H. M. Gupta', 'V. C. Prasad', 'K. S. P. Rao', 'M. L. Kothari',
                 'P. R. Bijwe', 'D. P. Kothari', 'K. S. S. Iyer', 'J. Nanda', 'S. S. Lamba', 'B. P. Singh', 'C. M. Bhatia',
                 'B. Singh', 'M. Veerachary', 'R. K. Mallik', 'S. D. Joshi', 'B. K. Dey']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Prof. {n}',
                'teacherCode': f'IIT-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Advanced Algorithms & Graph Theory', 'AAGT', 'Theory', 3, 1, 'Classroom'),
                ('Distributed Operating Systems', 'DOS', 'Theory', 3, 1, 'Classroom'),
                ('Deep Neural Architectures', 'DNA', 'Theory', 3, 1, 'Classroom'),
                ('Stochastic Process & Estimation', 'SPE', 'Theory', 3, 1, 'Classroom'),
                ('High-Performance Computing Lab', 'HPCL', 'Lab', 1, 2, 'ComputerLab')
            ]
            if 'AIR' in s_name:
                topics[4] = ('Kinematics & Robotics Simulation Lab', 'KRSL', 'Lab', 1, 2, 'Laboratory')
            elif 'VLSI' in s_name:
                topics[4] = ('Semiconductor Cadence Design Lab', 'SCDL', 'Lab', 1, 2, 'ElectronicsLab')
            elif 'AERO' in s_name:
                topics[4] = ('Flight Dynamics & Supersonic Lab', 'FDSL', 'Lab', 1, 2, 'MechanicalWorkshop')
            elif 'QUANT' in s_name:
                topics[4] = ('Quantum Cryptography & Laser Lab', 'QCLL', 'Lab', 1, 2, 'Laboratory')
            elif 'MAT' in s_name or 'CHEM' in s_name:
                topics[4] = ('Spectroscopy & Synthesis Lab', 'SSLAB', 'Lab', 1, 2, 'Laboratory')

            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"IIT-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_2_iit_tech',
        'IIT Advanced Tech & Research',
        'Engineering & Science',
        'Tier-1 Indian Institute of Technology dataset: High-Performance Computing, Robotics, VLSI Microelectronics, Aerospace, Quantum Systems, and Nano-materials with branch-locked lecture theatres.',
        '54 Sections • 55 Rooms • 270 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_iit()

# --------------------------------------------------------------------------
# PRESET 3: Central Multidisciplinary University (DU Style)
# --------------------------------------------------------------------------
def gen_du():
    depts = [
        ('Mathematical Sciences', 'MATH', [('1st', 'BSc-1st', 65), ('2nd', 'BSc-2nd', 65), ('3rd', 'BSc-3rd', 65), ('MSc1', 'MSc-1st', 35), ('MSc2', 'MSc-2nd', 35), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Computer Applications & IT', 'CA', [('1st', 'BCA-1st', 70), ('2nd', 'BCA-2nd', 70), ('3rd', 'BCA-3rd', 70), ('MCA1', 'MCA-1st', 45), ('MCA2', 'MCA-2nd', 45), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Physical Sciences', 'PHYS', [('1st', 'BSc-1st', 65), ('2nd', 'BSc-2nd', 65), ('3rd', 'BSc-3rd', 65), ('MSc1', 'MSc-1st', 30), ('MSc2', 'MSc-2nd', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Chemical Sciences', 'CHEM', [('1st', 'BSc-1st', 65), ('2nd', 'BSc-2nd', 65), ('3rd', 'BSc-3rd', 65), ('MSc1', 'MSc-1st', 30), ('MSc2', 'MSc-2nd', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Economics & Public Policy', 'ECON', [('1st', 'BA-1st', 75), ('2nd', 'BA-2nd', 75), ('3rd', 'BA-3rd', 75), ('MA1', 'MA-1st', 40), ('MA2', 'MA-2nd', 40), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Commerce & Financial Studies', 'COMM', [('1st', 'BCom-1st', 75), ('2nd', 'BCom-2nd', 75), ('3rd', 'BCom-3rd', 75), ('MCom1', 'MCom-1st', 45), ('MCom2', 'MCom-2nd', 45), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Humanities & English', 'ENG', [('1st', 'BA-1st', 70), ('2nd', 'BA-2nd', 70), ('3rd', 'BA-3rd', 70), ('MA1', 'MA-1st', 35), ('MA2', 'MA-2nd', 35), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)])
    ]
    
    rooms = []
    # Branch-Dedicated Classrooms
    for dept_name, prefix, _ in depts:
        rooms.append({'name': f'{dept_name} Undergrad Lecture Hall 1', 'roomNumber': f'CR-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 85})
        rooms.append({'name': f'{dept_name} Undergrad Lecture Hall 2', 'roomNumber': f'CR-{prefix}-201', 'type': 'Classroom', 'department': dept_name, 'capacity': 85})
        rooms.append({'name': f'{dept_name} PG Seminar Room', 'roomNumber': f'PG-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 45})
        rooms.append({'name': f'{dept_name} Research Hall', 'roomNumber': f'SEM-{prefix}-PHD', 'type': 'Classroom', 'department': dept_name, 'capacity': 35})

    # Labs
    for i in range(1, 5):
        rooms.append({'name': f'Central Computing Facility {i}', 'roomNumber': f'CCF-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Physics Optics Lab {i}', 'roomNumber': f'PHYLAB-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Chemistry Wet Analysis Lab {i}', 'roomNumber': f'CHMLAB-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Language Phonetics Lab {i}', 'roomNumber': f'LANGLAB-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})

    def gen_fac():
        fac = []
        names = ['Amartya Kumar', 'Romila Thapar', 'Deepak Nayyar', 'Kaushik Basu', 'Prabhat Patnaik', 'Jayati Ghosh', 
                 'Bipan Chandra', 'Andre Beteille', 'Upendra Baxi', 'Mushirul Hasan', 'Utsa Patnaik', 'Dipankar Gupta',
                 'Achin Vanaik', 'Zoya Hasan', 'G. K. Chadha', 'K. L. Sharma', 'R. S. Sharma', 'Tanika Sarkar',
                 'Sumit Sarkar', 'Neera Chandhoke', 'Sabyasachi Bhattacharya', 'Satish Saberwal', 'Radha Kumar', 'Madhu Kishwar',
                 'Raveesh Agarwal', 'Sunita Narain', 'Sudha Pai', 'G. P. Sharma', 'Harish Trivedi', 'Meenakshi Mukherjee',
                 'Alok Bhalla', 'Kavita Sharma', 'R. Raj Rao', 'Shormishtha Panja', 'Christel Devadawson', 'G. J. V. Prasad',
                 'Sukrita Paul Kumar', 'Anvita Abbi', 'P. K. Roy', 'B. K. Das', 'S. K. Tandon', 'V. Rajamani', 'H. Y. Mohan Ram',
                 'P. S. Ramakrishnan', 'C. R. Babu', 'K. S. Rao', 'Indira Nath', 'N. K. Ganguly', 'V. M. Katoch', 'S. K. Sarin',
                 'P. N. Tandon', 'M. G. K. Menon', 'Yash Pal', 'C. N. R. Rao', 'Govind Swarup', 'Obaid Siddiqi', 'Asis Datta',
                 'S. K. Sopory', 'Sudhir Kumar', 'R. P. Roy', 'A. K. Sharma', 'P. N. Mehra', 'V. Puri', 'B. M. Johri', 'R. N. Kapil',
                 'H. S. Srivastava', 'S. C. Maheshwari', 'N. S. Rangaswamy', 'K. R. Shivanna', 'C. B. L. Srivastava', 'U. S. Srivastava',
                 'P. N. Srivastava', 'A. S. Mukherjee', 'J. P. Thapliyal', 'M. S. Kanungo', 'B. I. Sundararaj', 'V. C. Shah',
                 'S. R. V. Rao', 'T. Sharma', 'S. C. Lakhotia', 'H. A. Ranganath', 'R. Gadagkar', 'M. K. Chandrashekaran', 'R. Sukumar']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Dr. {n}',
                'teacherCode': f'DU-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Classical Analysis & Foundations', 'CAF', 'Theory', 3, 1, 'Classroom'),
                ('Modern Empirical Methodology', 'MEM', 'Theory', 3, 1, 'Classroom'),
                ('Applied Computational Modeling', 'ACM', 'Theory', 3, 1, 'Classroom'),
                ('Interdisciplinary Seminar & Ethics', 'ISE', 'Theory', 3, 1, 'Classroom'),
                ('Practical Experimental Practicum', 'PEP', 'Lab', 1, 2, 'Laboratory')
            ]
            if 'CA' in s_name or 'COMM' in s_name:
                topics[4] = ('Business Analytics & Software Lab', 'BASL', 'Lab', 1, 2, 'ComputerLab')
            elif 'ENG' in s_name or 'ECON' in s_name:
                topics[4] = ('Phonetics & Data Workshop', 'PDW', 'Lab', 1, 2, 'Laboratory')

            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"DU-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_3_delhi_university',
        'Central Multidisciplinary University',
        'Sciences & Humanities',
        'Multi-faculty Central University: Mathematical Sciences, Computer Applications, Physical Sciences, Chemical Sciences, Economics, Commerce, and Humanities with dedicated faculty lecture halls.',
        '49 Sections • 45 Rooms • 245 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_du()

# --------------------------------------------------------------------------
# PRESET 4: AIIMS Medical & Healthcare Sciences
# --------------------------------------------------------------------------
def gen_aiims():
    depts = [
        ('Pre-Clinical Sciences (Anatomy/Physio)', 'MED-PRE', [('1st', 'MBBS-Phase1', 75), ('2nd', 'MBBS-Phase2', 75), ('MD1', 'MD-Physio-1st', 25), ('MD2', 'MD-Physio-2nd', 25), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Para-Clinical (Pathology/Microbio)', 'MED-PARA', [('1st', 'MBBS-Phase3A', 75), ('2nd', 'MBBS-Phase3B', 75), ('MD1', 'MD-Patho-1st', 25), ('MD2', 'MD-Patho-2nd', 25), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Clinical Medicine & Therapeutics', 'MED-CLIN', [('1st', 'MD-Med-1st', 35), ('2nd', 'MD-Med-2nd', 35), ('3rd', 'MD-Med-3rd', 35), ('DM1', 'DM-Cardio-1st', 15), ('DM2', 'DM-Cardio-2nd', 15), ('PhD1', 'PhD-1st', 15)]),
        ('Surgical Disciplines & Ortho', 'MED-SURG', [('1st', 'MS-Surg-1st', 35), ('2nd', 'MS-Surg-2nd', 35), ('3rd', 'MS-Surg-3rd', 35), ('MCh1', 'MCh-Neuro-1st', 15), ('MCh2', 'MCh-Neuro-2nd', 15), ('PhD1', 'PhD-1st', 15)]),
        ('Nursing & Critical Care', 'NURS', [('1st', 'BSc-Nurs-1st', 60), ('2nd', 'BSc-Nurs-2nd', 60), ('3rd', 'BSc-Nurs-3rd', 60), ('4th', 'BSc-Nurs-4th', 60), ('MSc1', 'MSc-Nurs-1st', 25), ('MSc2', 'MSc-Nurs-2nd', 25)]),
        ('Medical Biotech & Genomics', 'BIOTECH', [('1st', 'MSc-Biotech-1st', 35), ('2nd', 'MSc-Biotech-2nd', 35), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15), ('PhD3', 'PhD-3rd', 15)]),
        ('Community & Public Health', 'SPM', [('1st', 'MPH-1st', 40), ('2nd', 'MPH-2nd', 40), ('MD1', 'MD-SPM-1st', 20), ('MD2', 'MD-SPM-2nd', 20), ('PhD1', 'PhD-1st', 15)])
    ]
    
    rooms = []
    # Branch-Dedicated Medical Lecture Auditoriums
    for dept_name, prefix, _ in depts:
        rooms.append({'name': f'{dept_name} Lecture Auditorium 1', 'roomNumber': f'MEDLT-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 85})
        rooms.append({'name': f'{dept_name} Clinical Seminar Room', 'roomNumber': f'CSR-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 45})

    # Diagnostic & Clinical Labs
    for i in range(1, 5):
        rooms.append({'name': f'Anatomy Dissection Hall {i}', 'roomNumber': f'ANAT-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Pathology & Diagnostic Lab {i}', 'roomNumber': f'PATH-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Biochemistry Genomics Lab {i}', 'roomNumber': f'MOLAB-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Simulation & Skills Center {i}', 'roomNumber': f'SKILL-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})

    def gen_fac():
        fac = []
        names = ['P. Venugopal', 'Balram Bhargava', 'Randeep Guleria', 'M. C. Misra', 'P. K. Dave', 'S. K. Kacker', 
                 'Snehlata Deshmukh', 'K. K. Talwar', 'Anoop Misra', 'Devi Shetty', 'Naresh Trehan', 'Ashok Seth',
                 'Purshotam Lal', 'T. S. Kler', 'Upendra Kaul', 'S. C. Manchanda', 'Anita Saxena', 'V. K. Bahl',
                 'Ambareesh Satwik', 'Arvinder Singh Soin', 'Subhash Gupta', 'Mohamed Rela', 'Nageshwar Reddy', 'Samiran Nundy',
                 'Adarsh Chaudhary', 'Peush Sahni', 'T. K. Chattopadhyay', 'Rajesh Malhotra', 'Surya Bhan', 'Shekhar Agarwal',
                 'Pradeep Chowbey', 'B. K. Rao', 'Yatin Mehta', 'Farhad Kapadia', 'Rajesh Chawla', 'G. C. Khilnani',
                 'R. M. Dhamija', 'M. V. Padma', 'Kameshwar Prasad', 'Manjari Tripathi', 'P. Satishchandra', 'Sanitary Anand',
                 'B. N. Gangadhar', 'R. S. Murthy', 'Vikram Patel', 'Sanjeev Jain', 'Pratima Murthy', 'Chittaranjan Andrade',
                 'Alok Sarin', 'Sudhir Khandelwal', 'Mamta Sood', 'Rakesh Chadda', 'K. S. Jacob', 'Roy Abraham Kallivayalil',
                 'Indira Sharma', 'Ajit Avasthi', 'Savita Malhotra', 'Paramjit Singh', 'R. C. Jiloha', 'Nimesh Parikh',
                 'Sunil Sharma', 'Meera Varma', 'Geeta Kashyap', 'Pooja Tandon', 'Rashmi Sengupta', 'Deepika Khurana',
                 'Vandana Roy', 'Sangeeta Sharma', 'Urmila Gupta', 'Shashi Kant', 'Anand Krishnan', 'K. Anand', 'Baridalyne Nongkynrih']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Dr. {n} (MD)',
                'teacherCode': f'AIIMS-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Systemic Clinical Pathology & Diagnosis', 'SCPD', 'Theory', 3, 1, 'Classroom'),
                ('Pharmacotherapeutics & Regimens', 'PTR', 'Theory', 3, 1, 'Classroom'),
                ('Surgical Anatomy & Operative Procedures', 'SAOP', 'Theory', 3, 1, 'Classroom'),
                ('Epidemiology & Hospital Management', 'EHM', 'Theory', 3, 1, 'Classroom'),
                ('Bedside Clinical Demonstration & Practical', 'BCDP', 'Lab', 1, 2, 'Laboratory')
            ]
            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"MED-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_4_aiims_medical',
        'AIIMS Medical & Healthcare Sciences',
        'Medicine & Healthcare',
        'National Institute of Medical Sciences: Pre-Clinical, Para-Clinical, Clinical Medicine, Surgical Disciplines, Nursing, Medical Biotech, with branch-locked clinical demonstration auditoriums.',
        '41 Sections • 45 Rooms • 205 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_aiims()

# --------------------------------------------------------------------------
# PRESET 5: National Law University (NLU Legal Studies)
# --------------------------------------------------------------------------
def gen_nlu():
    depts = [
        ('Constitutional & Administrative Law', 'CONST', [('1st', 'BALLB-1st', 75), ('2nd', 'BALLB-2nd', 75), ('3rd', 'BALLB-3rd', 75), ('4th', 'BALLB-4th', 75), ('5th', 'BALLB-5th', 75), ('LLM1', 'LLM-Const-1st', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Corporate & Commercial Law', 'CORP', [('1st', 'BBALLB-1st', 75), ('2nd', 'BBALLB-2nd', 75), ('3rd', 'BBALLB-3rd', 75), ('4th', 'BBALLB-4th', 75), ('5th', 'BBALLB-5th', 75), ('LLM1', 'LLM-Corp-1st', 35), ('PhD1', 'PhD-1st', 15)]),
        ('Criminal Justice & Criminology', 'CRIM', [('1st', 'LLM-Crim-1st', 30), ('2nd', 'LLM-Crim-2nd', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15), ('Dip1', 'PG-Criminology', 40)]),
        ('Intellectual Property & Cyber Law', 'IPR', [('1st', 'LLM-IPR-1st', 35), ('2nd', 'LLM-IPR-2nd', 35), ('PhD1', 'PhD-1st', 15), ('Dip1', 'CyberLaw-PG', 45)]),
        ('International Law & Human Rights', 'INTL', [('1st', 'LLM-Intl-1st', 30), ('2nd', 'LLM-Intl-2nd', 30), ('PhD1', 'PhD-1st', 15), ('PhD2', 'PhD-2nd', 15)]),
        ('Dispute Resolution & Arbitration', 'ADR', [('1st', 'LLM-ADR-1st', 30), ('2nd', 'LLM-ADR-2nd', 30), ('PhD1', 'PhD-1st', 15), ('Dip1', 'Arbitration-PG', 40)])
    ]
    
    rooms = []
    # Branch-Dedicated Law Lecture Theatres
    for dept_name, prefix, _ in depts:
        rooms.append({'name': f'{dept_name} Lecture Hall 1', 'roomNumber': f'LAWLT-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 85})
        rooms.append({'name': f'{dept_name} Seminar Room', 'roomNumber': f'LSR-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 45})

    # Moot Courtrooms & Legal Clinics (open for all law batches)
    for i in range(1, 7):
        rooms.append({'name': f'High Court Moot Courtroom MC-{i}', 'roomNumber': f'MOOT-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Legal Aid & Mediation Clinic {i}', 'roomNumber': f'CLINIC-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Cyber Forensic Lab {i}', 'roomNumber': f'CYBER-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 45})

    def gen_fac():
        fac = []
        names = ['N. R. Madhava Menon', 'Upendra Baxi', 'Fali S. Nariman', 'Soli Sorabjee', 'Ram Jethmalani', 'K. K. Venugopal',
                 'Mukul Rohatgi', 'Abhishek Singhvi', 'Harish Salve', 'Gopal Subramanium', 'Rajeev Dhavan', 'Indira Jaising',
                 'Kapil Sibal', 'Prashant Bhushan', 'Arvind Datar', 'Dushyant Dave', 'C. S. Vaidyanathan', 'Rakesh Dwivedi',
                 'K. T. S. Tulsi', 'Salman Khurshid', 'P. Chidambaram', 'Maninder Singh', 'Tushar Mehta', 'Neeraj Kishan Kaul',
                 'Gourab Banerji', 'Parag Tripathi', 'Sanjay Hegde', 'Menaka Guruswamy', 'Karuna Nundy', 'Arundhati Katju',
                 'Vrinda Grover', 'Rebecca John', 'Geeta Luthra', 'Meenakshi Arora', 'Aishwarya Bhati', 'Vibha Datta Makhija',
                 'Pankaj Bhatnagar', 'Sudhir Krishnaswamy', 'Ranbir Singh', 'Faizan Mustafa', 'Poonam Saxena', 'Srikrishna Deva Rao',
                 'V. C. Vivekanandan', 'B. P. Panda', 'G. S. Bajpai', 'Manoj Kumar Sinha', 'Purvi Pokhariyal', 'B. C. Nirmal',
                 'Balraj Chauhan', 'K. I. Vibhute', 'T. V. Subba Rao', 'V. Kesava Rao', 'A. David Ambrose', 'K. Vidyullatha Reddy',
                 'N. L. Mitra', 'R. Venkata Rao', 'A. Lakshminath', 'Paramjit S. Jaswal', 'Nistha Jaswal', 'Rose Varghese',
                 'V. Nagaraj', 'K. P. S. Mahalwar', 'M. P. Singh', 'Gurdeep Singh', 'S. C. Raina', 'Amar Pal Singh']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Hon. Prof. {n}',
                'teacherCode': f'NLU-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Constitutional Law & Judicial Review', 'CLJR', 'Theory', 3, 1, 'Classroom'),
                ('Corporate Governance & Securities Regulation', 'CGSR', 'Theory', 3, 1, 'Classroom'),
                ('Code of Criminal Procedure & Evidence', 'CCPE', 'Theory', 3, 1, 'Classroom'),
                ('International Commercial Arbitration', 'ICA', 'Theory', 3, 1, 'Classroom'),
                ('Moot Court Advocacy & Drafting Clinic', 'MCAD', 'Lab', 1, 2, 'Laboratory')
            ]
            if 'CYBER' in s_name or 'IPR' in s_name:
                topics[4] = ('Cyber Law & Digital Evidence Workshop', 'CLDE', 'Lab', 1, 2, 'ComputerLab')

            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"LAW-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_5_nlu_law',
        'National Law University (Legal Studies)',
        'Law & Public Policy',
        'Premier National Law University dataset: B.A. LL.B (5-year), Constitutional, Corporate, Criminal, Cyber & International Law with branch-locked theatres and moot courtrooms.',
        '31 Sections • 35 Rooms • 155 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_nlu()

# --------------------------------------------------------------------------
# PRESET 6: Institute of Design & Architecture (NID/SPA Style)
# --------------------------------------------------------------------------
def gen_design():
    depts = [
        ('Architecture & Urban Design', 'ARCH', [('1st', 'BArch-1st', 50), ('2nd', 'BArch-2nd', 50), ('3rd', 'BArch-3rd', 50), ('4th', 'BArch-4th', 50), ('5th', 'BArch-5th', 50), ('MArch1', 'MArch-1st', 25), ('MArch2', 'MArch-2nd', 25), ('PhD1', 'PhD-1st', 15)]),
        ('Industrial & Product Design', 'PROD', [('1st', 'BDes-Prod-1st', 45), ('2nd', 'BDes-Prod-2nd', 45), ('3rd', 'BDes-Prod-3rd', 45), ('4th', 'BDes-Prod-4th', 45), ('MDes1', 'MDes-Prod-1st', 25), ('MDes2', 'MDes-Prod-2nd', 25), ('PhD1', 'PhD-1st', 15)]),
        ('Communication & Graphic Design', 'COMM', [('1st', 'BDes-Comm-1st', 45), ('2nd', 'BDes-Comm-2nd', 45), ('3rd', 'BDes-Comm-3rd', 45), ('4th', 'BDes-Comm-4th', 45), ('MDes1', 'MDes-Comm-1st', 25), ('MDes2', 'MDes-Comm-2nd', 25), ('PhD1', 'PhD-1st', 15)]),
        ('Interaction Design & UI/UX', 'UX', [('1st', 'BDes-UX-1st', 45), ('2nd', 'BDes-UX-2nd', 45), ('3rd', 'BDes-UX-3rd', 45), ('4th', 'BDes-UX-4th', 45), ('MDes1', 'MDes-UX-1st', 25), ('MDes2', 'MDes-UX-2nd', 25), ('PhD1', 'PhD-1st', 15)]),
        ('Textile & Material Innovation', 'TEXT', [('1st', 'BDes-Text-1st', 40), ('2nd', 'BDes-Text-2nd', 40), ('3rd', 'BDes-Text-3rd', 40), ('4th', 'BDes-Text-4th', 40), ('MDes1', 'MDes-Text-1st', 20), ('MDes2', 'MDes-Text-2nd', 20)])
    ]
    
    rooms = []
    # Branch-Dedicated Theory Theatres
    for dept_name, prefix, _ in depts:
        rooms.append({'name': f'{dept_name} Studio Theatre 1', 'roomNumber': f'DSLT-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 65})
        rooms.append({'name': f'{dept_name} Critique & Jury Pod', 'roomNumber': f'JURY-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 35})

    # Workshops & Studios (open for design disciplines)
    for i in range(1, 6):
        rooms.append({'name': f'Architectural Drafting Studio {i}', 'roomNumber': f'DRAFT-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Rapid 3D Prototyping CNC Lab {i}', 'roomNumber': f'PROTO-{i}', 'type': 'MechanicalWorkshop', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Digital Media UX Lab {i}', 'roomNumber': f'UXLAB-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Material & Ceramic Studio {i}', 'roomNumber': f'MATSTU-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})

    def gen_fac():
        fac = []
        names = ['B. V. Doshi', 'Charles Correa', 'Achyut Kanvinde', 'Raj Rewal', 'Laurie Baker', 'Hafiz Contractor',
                 'Brinda Somaya', 'Hafeez Contractor', 'Sheila Sri Prakash', 'Rahul Mehrotra', 'Sanjay Puri', 'Chitra Vishwanath',
                 'Prem Nath', 'Abhimanyu Dalal', 'K. T. Ravindran', 'Dean D\'Cruz', 'Sen Kapadia', 'Sujatha Shankar',
                 'Komal Mathur', 'Anupama Kundoo', 'Sunil Joshi', 'Sudhir Sharma', 'Pradyumna Vyas', 'Ashoke Chatterjee',
                 'H. Kumar Vyas', 'Vikas Satwalekar', 'Singanapalli Balaram', 'Mahendra Patel', 'I. S. Mathur', 'G. V. Sreekumar',
                 'Kirti Trivedi', 'U. A. Athavankar', 'A. G. Rao', 'Ravi Poovaiah', 'B. K. Chakravarthy', 'Nina Sabnani',
                 'Phani Tetali', 'Girish Dalvi', 'Manish Sharma', 'Jatin Bhatt', 'Sudhakar Nadkarni', 'Tarun Deep Girdher',
                 'Praveen Nahar', 'Tanishka Kachru', 'Shilpa Das', 'Sujith Kumar', 'Manoj Kothari', 'Naveen Rampal',
                 'Satish Gokhale', 'Michael Foley', 'Abhijit Bansod', 'Neil Foley', 'Alok Nandi', 'Sudhir John Horo',
                 'Gaurav Jain', 'Kavita Arvind', 'Ruchita Madhok', 'Lokesh Karekar', 'Sameer Kulavoor', 'Sujata Keshavan']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Prof. {n}',
                'teacherCode': f'NID-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Spatial Geometry & Form Studies', 'SGFS', 'Theory', 3, 1, 'Classroom'),
                ('History of Global Architecture & Design', 'HGAD', 'Theory', 3, 1, 'Classroom'),
                ('Building Services & Sustainable Envelopes', 'BSSE', 'Theory', 3, 1, 'Classroom'),
                ('Design Research Methodology & Semiotics', 'DRMS', 'Theory', 3, 1, 'Classroom'),
                ('Comprehensive Studio & Fabrication Practicum', 'CSFP', 'Lab', 1, 2, 'Laboratory')
            ]
            if 'UX' in s_name or 'COMM' in s_name:
                topics[4] = ('Digital Interface & Motion Design Lab', 'DIMD', 'Lab', 1, 2, 'ComputerLab')
            elif 'PROD' in s_name:
                topics[4] = ('Material Fabrication & CNC Prototyping', 'MFCP', 'Lab', 1, 2, 'MechanicalWorkshop')

            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"DES-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_6_nid_architecture',
        'Institute of Design & Architecture',
        'Architecture & Design',
        'Premier Institute of Architecture & Design: B.Arch (5-yr studio), Industrial Design, UI/UX, and Textile Innovation with branch-locked theatres and drafting studios.',
        '35 Sections • 35 Rooms • 175 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_design()

# --------------------------------------------------------------------------
# PRESET 7: Indian Institute of Management (IIM Business & Analytics)
# --------------------------------------------------------------------------
def gen_iim():
    depts = [
        ('Quantitative Finance & FinTech', 'FIN', [('1st', 'MBA-Core-1', 75), ('2nd', 'MBA-Core-2', 75), ('Fin1', 'MBA-Fin-Elective1', 45), ('Fin2', 'MBA-Fin-Elective2', 45), ('EMBA1', 'EMBA-Fin-1st', 35), ('PhD1', 'FPM-Fin-1st', 15), ('PhD2', 'FPM-Fin-2nd', 15)]),
        ('Marketing & Consumer Analytics', 'MKT', [('1st', 'MBA-Core-3', 75), ('2nd', 'MBA-Core-4', 75), ('Mkt1', 'MBA-Mkt-Elective1', 45), ('Mkt2', 'MBA-Mkt-Elective2', 45), ('EMBA1', 'EMBA-Mkt-1st', 35), ('PhD1', 'FPM-Mkt-1st', 15), ('PhD2', 'FPM-Mkt-2nd', 15)]),
        ('Operations & Supply Chain', 'OPS', [('Ops1', 'MBA-Ops-Elective1', 45), ('Ops2', 'MBA-Ops-Elective2', 45), ('EMBA1', 'EMBA-Ops-1st', 35), ('PhD1', 'FPM-Ops-1st', 15), ('PhD2', 'FPM-Ops-2nd', 15)]),
        ('Strategic Management', 'STRAT', [('Strat1', 'MBA-Strat-Elective1', 45), ('Strat2', 'MBA-Strat-Elective2', 45), ('EMBA1', 'EMBA-Strat-1st', 35), ('PhD1', 'FPM-Strat-1st', 15), ('PhD2', 'FPM-Strat-2nd', 15)]),
        ('Information Systems & AI', 'IS', [('IS1', 'MBA-IS-Elective1', 45), ('IS2', 'MBA-IS-Elective2', 45), ('EMBA1', 'EMBA-IS-1st', 35), ('PhD1', 'FPM-IS-1st', 15), ('PhD2', 'FPM-IS-2nd', 15)]),
        ('Organizational Behavior & HR', 'OBHR', [('HR1', 'MBA-HR-Elective1', 40), ('HR2', 'MBA-HR-Elective2', 40), ('EMBA1', 'EMBA-HR-1st', 30), ('PhD1', 'FPM-HR-1st', 15)])
    ]
    
    rooms = []
    # Branch-Dedicated Case Amphitheaters
    for dept_name, prefix, _ in depts:
        rooms.append({'name': f'{dept_name} Case Amphitheater', 'roomNumber': f'AMPH-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 85})
        rooms.append({'name': f'{dept_name} Executive Suite', 'roomNumber': f'EXEC-{prefix}-101', 'type': 'Classroom', 'department': dept_name, 'capacity': 45})

    # Bloomberg Labs & Simulation Rooms
    for i in range(1, 5):
        rooms.append({'name': f'Bloomberg Financial Markets Lab {i}', 'roomNumber': f'BLOOM-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 45})
    for i in range(1, 4):
        rooms.append({'name': f'Analytics & AI Simulation Lab {i}', 'roomNumber': f'BIZLAB-{i}', 'type': 'ComputerLab', 'department': 'General', 'capacity': 45})
    for i in range(1, 3):
        rooms.append({'name': f'Behavioral Research Lab {i}', 'roomNumber': f'BEHLAB-{i}', 'type': 'Laboratory', 'department': 'General', 'capacity': 45})

    def gen_fac():
        fac = []
        names = ['Raghuram Rajan', 'C. K. Prahalad', 'Pankaj Ghemawat', 'Vijay Govindarajan', 'Jagdish Bhagwati', 'Dipak Jain',
                 'Soumitra Dutta', 'Sunil Chopra', 'Tarun Khanna', 'Nitin Nohria', 'Srikant Datar', 'V. G. Narayanan',
                 'Krishna Palepu', 'Ashish Nanda', 'Ananth Raman', 'Rohit Deshpande', 'Das Narayandas', 'Sunil Gupta',
                 'Bharat Anand', 'Youngme Moon', 'Felix Oberholzer-Gee', 'Guhan Subramanian', 'Deepak Malhotra', 'Francesca Gino',
                 'Amy Edmondson', 'Ranjay Gulati', 'Jan Rivkin', 'Gary Pisano', 'Willy Shih', 'Dennis Campbell',
                 'Suraj Srinivasan', 'V. Kasturi Rangan', 'John Quelch', 'Rajiv Lal', 'Gail McGovern', 'Luc Wathieu',
                 'Bakul Dholakia', 'Samir Barua', 'I. M. Pandey', 'Prasanna Chandra', 'Y. K. Bhushan', 'Abad Ahmad',
                 'B. S. Sahay', 'Debashis Chatterjee', 'Himanshu Rai', 'Rishikesha Krishnan', 'Ajit Rangnekar', 'Rajendra Srivastava',
                 'M. Balasubramaniam', 'Janat Shah', 'Pawan Kumar Singh', 'Mahadeo Jaiswal', 'Sanjay Patro', 'Gita Bajaj',
                 'Vandana Sharma', 'Sunil Unny Guptan', 'Abhoy K. Ojha', 'B. Mahadevan', 'G. Raghuram', 'Trilochan Sastry',
                 'Anurag Saxena', 'Kunal Basu', 'Subhashish Gupta', 'Rupa Chanda', 'Charan Singh', 'Pulak Ghosh']
        for i, n in enumerate(names, 1):
            fac.append({
                'name': f'Prof. {n}',
                'teacherCode': f'IIM-FAC-{i:03d}',
                'teachableSubjectCodes': [],
                'maxWeeklyPeriods': 18
            })
        return fac

    def sub_gen(secs, facs):
        subs = []
        c_idx = 1
        for s_idx, sec in enumerate(secs):
            s_name = sec['name']
            topics = [
                ('Corporate Valuation & M&A Strategy', 'CVMA', 'Theory', 3, 1, 'Classroom'),
                ('Omnichannel Marketing & Brand Equity', 'OMBE', 'Theory', 3, 1, 'Classroom'),
                ('Global Supply Chain Optimization', 'GSCO', 'Theory', 3, 1, 'Classroom'),
                ('Competitive Advantage & Platform Dynamics', 'CAPD', 'Theory', 3, 1, 'Classroom'),
                ('Financial Modeling & Bloomberg Lab', 'FMBL', 'Lab', 1, 2, 'ComputerLab')
            ]
            if 'HR' in s_name or 'OBHR' in s_name:
                topics[4] = ('Executive Leadership & Group Dynamics Lab', 'ELGD', 'Lab', 1, 2, 'Laboratory')

            for t_title, t_code, t_type, weekly, dur, r_type in topics:
                f_obj = facs[(s_idx * 5 + len(subs)) % len(facs)]
                code = f"IIM-{t_code}-{c_idx}"
                c_idx += 1
                f_obj['teachableSubjectCodes'].append(code)
                subs.append({
                    'name': f"{t_title} ({s_name})",
                    'code': code,
                    'type': t_type,
                    'sectionName': s_name,
                    'teacherCode': f_obj['teacherCode'],
                    'weeklySessions': weekly,
                    'durationPeriods': dur,
                    'requiredRoomType': r_type
                })
        return subs

    return build_dataset(
        'preset_7_iim_management',
        'Indian Institute of Management (Business & Analytics)',
        'Management & Business',
        'Premier IIM Business School: MBA Core, Quantitative Finance, Marketing Analytics, Operations, with tiered case amphitheaters and Bloomberg trading labs.',
        '33 Sections • 35 Rooms • 165 Subjects',
        depts, rooms, sub_gen, gen_fac
    )

gen_iim()
print("\nAll 7 presets updated with branch-locked LTs and sub-section interleaving!")
