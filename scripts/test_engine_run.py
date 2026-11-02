import json
import subprocess
import time

with open('/Users/sashank/.gemini/antigravity/scratch/smartsched/server/seeds/college.json') as f:
    d = json.load(f)

# Build settings
settings = {
    "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "periods": [
        {"index": 0, "label": "P1", "start": "09:30", "end": "10:25", "isBreak": False},
        {"index": 1, "label": "P2", "start": "10:25", "end": "11:20", "isBreak": False},
        {"index": 2, "label": "P3", "start": "11:25", "end": "12:20", "isBreak": False},
        {"index": 3, "label": "P4", "start": "12:20", "end": "13:15", "isBreak": False},
        {"index": 4, "label": "Lunch Break", "start": "13:15", "end": "14:00", "isBreak": True},
        {"index": 5, "label": "P5", "start": "14:00", "end": "14:50", "isBreak": False},
        {"index": 6, "label": "P6", "start": "14:50", "end": "15:40", "isBreak": False},
        {"index": 7, "label": "P7", "start": "15:45", "end": "16:35", "isBreak": False},
        {"index": 8, "label": "P8", "start": "16:35", "end": "17:30", "isBreak": False}
    ],
    "dayTimings": [
        {"day": "Mon", "start": "09:30", "end": "17:30", "maxPeriodIndex": 9},
        {"day": "Tue", "start": "09:30", "end": "17:30", "maxPeriodIndex": 9},
        {"day": "Wed", "start": "09:30", "end": "15:30", "maxPeriodIndex": 6},
        {"day": "Thu", "start": "09:30", "end": "17:30", "maxPeriodIndex": 9},
        {"day": "Fri", "start": "09:30", "end": "17:30", "maxPeriodIndex": 9}
    ]
}

# Attach dummy _id to objects
for i, s in enumerate(d['sections']):
    s['_id'] = f"sec_{i}_{s['name']}"
for i, r in enumerate(d['rooms']):
    r['_id'] = f"rm_{i}_{r['roomNumber']}"
for i, t in enumerate(d['teachers']):
    t['_id'] = f"t_{i}_{t['teacherCode']}"
for i, sub in enumerate(d['subjects']):
    sub['_id'] = f"sub_{i}_{sub['code']}"
    # find sectionId and teacherId
    for sec in d['sections']:
        if sec['name'] == sub['sectionName']:
            sub['sectionId'] = sec['_id']
            break
    for tea in d['teachers']:
        if tea['teacherCode'] == sub['teacherCode']:
            sub['teacherId'] = tea['_id']
            break

engine_payload = {
    "mode": "schedule",
    "sections": d['sections'],
    "teachers": d['teachers'],
    "rooms": d['rooms'],
    "subjects": d['subjects'],
    "settings": settings
}

input_str = json.dumps(engine_payload)

algs = ['combined', 'greedy', 'backtracking', 'graph-coloring']
for alg in algs:
    bin_name = 'scheduler' if alg == 'greedy' else ('graph-coloring' if alg == 'graph-coloring' else alg)
    bin_path = f"/Users/sashank/.gemini/antigravity/scratch/smartsched/engine/bin/{bin_name}"
    
    t0 = time.time()
    proc = subprocess.run([bin_path], input=input_str, text=True, capture_output=True)
    t1 = time.time()
    
    if proc.returncode != 0:
        print(f"[{alg}] FAILED with code {proc.returncode}: {proc.stderr}")
        continue
    
    try:
        out = json.loads(proc.stdout)
        status = out.get('status', 'UNKNOWN')
        scheduled = out.get('scheduledSessions', 0)
        unscheduled = out.get('unscheduledSessions', 0)
        ms = round((t1 - t0) * 1000, 1)
        print(f"[{alg}] Status: {status} | Scheduled: {scheduled} | Unscheduled: {unscheduled} | Runtime: {ms}ms")
    except Exception as e:
        print(f"[{alg}] JSON parse error: {e}, stdout: {proc.stdout[:200]}")
