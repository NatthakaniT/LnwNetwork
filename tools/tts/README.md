# สร้างเสียงพากย์บทเรียน (ออฟไลน์ ใช้การ์ดจอ)

เครื่องมือนี้อ่านบทพูดของบทที่ "เสร็จแล้ว" แล้วสร้างไฟล์เสียง mp3 ด้วยโมเดล OmniVoice ในเครื่องเรา (โคลนจากเสียงเจ้าของโปรเจกต์)
ไม่ต้องต่ออินเทอร์เน็ตตอนสร้างเสียง ไฟล์เสียงจะไปอยู่ที่ `public/audio/<รหัสบท>/<รหัสฉาก>.mp3`

## ก่อนเริ่ม ต้องมีอะไรบ้าง
- การ์ดจอ NVIDIA แรม 4 GB ขึ้นไป (เครื่องนี้ใช้ได้แล้ว)
- โปรแกรม `ffmpeg` (เครื่องนี้ลงไว้แล้ว)
- โปรแกรม `uv` (เครื่องนี้ลงไว้แล้ว)

## ขั้นที่ 1: ติดตั้งครั้งแรก (ทำครั้งเดียว)
เปิด Git Bash ที่โฟลเดอร์โปรเจกต์ `C:\LnwNetwork` แล้วรันทีละบรรทัด

```bash
UV="$LOCALAPPDATA/Microsoft/WinGet/Links/uv.exe"
"$UV" venv --python "$APPDATA/uv/python/cpython-3.10.22-windows-x86_64-none/python.exe" tools/tts/.venv-omnivoice
"$UV" pip install --python tools/tts/.venv-omnivoice/Scripts/python.exe torch==2.8.0+cu128 torchaudio==2.8.0+cu128 omnivoice==0.2.1 soundfile --extra-index-url https://download.pytorch.org/whl/cu128 --index-strategy unsafe-best-match
```

บรรทัดสุดท้ายโหลดหลาย GB รอจนจบ

## ขั้นที่ 2: เช็คว่าไฟล์โมเดลและเสียงต้นแบบอยู่ครบ
- โมเดล: โฟลเดอร์ `tools/tts/models/omnivoice/` (โมเดล `k2-fsa/OmniVoice` จาก Hugging Face ขนาด 3.1 GB)
- เสียงต้นแบบ: `tools/tts/ref/my_voice.wav`
- ข้อความของเสียงต้นแบบ: `tools/tts/ref/my_voice.txt`

ทั้งหมดนี้ไม่เข้า git เสียงต้นแบบเป็นเสียงจริงของเจ้าของ จึงต้องเก็บสำรองเอง

## ขั้นที่ 3: ดึงบทพูดออกมาจากบทเรียน
```bash
npm run narration:export
```
จะได้ไฟล์ `tools/tts/narration.json` (มีเฉพาะบทที่ status เป็น `ready`)

## ขั้นที่ 4: สร้างไฟล์เสียง
```bash
PYTHONIOENCODING=utf-8 tools/tts/.venv-omnivoice/Scripts/python.exe -I tools/tts/gen_lessons.py tools/tts/narration.json public/audio
```
- ไฟล์ไหนมีเสียงอยู่แล้ว โปรแกรมจะข้าม (พิมพ์ `skip`)
- อยากสร้างใหม่ทับของเดิม ใส่ `--force` ต่อท้าย
- อยากทำแค่บทเดียว ใส่ `--only p0-l1` ต่อท้าย (เปลี่ยนเป็นรหัสบทที่ต้องการ)
- ครั้งแรกโหลดโมเดลช้าหน่อย เฉลี่ยฉากละประมาณ 36 วินาที (ทำทั้ง 161 ฉากใช้เวลาราว 96 นาที)

## คำอังกฤษอ่านผิด ทำยังไง
เปิด `tools/tts/gen_lessons.py` แล้วเพิ่มคำในตาราง `PRONOUNCE` เช่น `"switch": "สวิตช์"`
แล้วรันขั้นที่ 4 ใหม่พร้อม `--force`
