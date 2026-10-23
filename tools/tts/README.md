# สร้างเสียงพากย์บทเรียน (ออฟไลน์ ใช้การ์ดจอ)

เครื่องมือนี้อ่านบทพูดของบทที่ "เสร็จแล้ว" แล้วสร้างไฟล์เสียง mp3 ด้วยโมเดล F5-TTS-THAI ในเครื่องเรา
ไม่ต้องต่ออินเทอร์เน็ตตอนสร้างเสียง ไฟล์เสียงจะไปอยู่ที่ `public/audio/<รหัสบท>/<รหัสฉาก>.mp3`

## ก่อนเริ่ม ต้องมีอะไรบ้าง
- การ์ดจอ NVIDIA (เครื่องนี้ใช้ได้แล้ว)
- โปรแกรม `ffmpeg` (เครื่องนี้ลงไว้แล้ว)
- โปรแกรม `uv` (เครื่องนี้ลงไว้แล้ว)

## ขั้นที่ 1: ติดตั้งครั้งแรก (ทำครั้งเดียว)
เปิด Git Bash ที่โฟลเดอร์โปรเจกต์ `C:\LnwNetwork` แล้วรันทีละบรรทัด

```bash
UV="$LOCALAPPDATA/Microsoft/WinGet/Links/uv.exe"
"$UV" venv --python "$APPDATA/uv/python/cpython-3.10.22-windows-x86_64-none/python.exe" tools/tts/.venv
"$UV" pip install --python tools/tts/.venv/Scripts/python.exe torch==2.3.0+cu118 torchaudio==2.3.0+cu118 f5-tts-th --extra-index-url https://download.pytorch.org/whl/cu118 --index-strategy unsafe-best-match
```

บรรทัดสุดท้ายโหลดหลาย GB ใช้เวลาประมาณ 10 นาที รอจนจบ

## ขั้นที่ 2: เช็คว่าไฟล์โมเดลอยู่ครบ
ต้องมี 4 ไฟล์ในโฟลเดอร์ `tools/tts/models/` และไฟล์เสียงต้นแบบ `tools/tts/ref/ref_gen_4.wav`

ถ้าไฟล์โมเดลหายไป ให้โหลดด้วย Chrome เอง (เพราะเครือข่ายนี้บล็อก huggingface.co ตอนรันโปรแกรม)
คลิกลิงก์ แล้วเอาไฟล์ไปวางใน `tools/tts/models/`

| ไฟล์ | ลิงก์ |
|---|---|
| `model_1000000.pt` | https://huggingface.co/VIZINTZOR/F5-TTS-THAI/resolve/main/model_1000000.pt |
| `vocab.txt` | https://huggingface.co/VIZINTZOR/F5-TTS-THAI/resolve/main/vocab.txt |
| `config.yaml` | https://huggingface.co/charactr/vocos-mel-24khz/resolve/main/config.yaml |
| `pytorch_model.bin` | https://huggingface.co/charactr/vocos-mel-24khz/resolve/main/pytorch_model.bin |

เช็คว่าโหลดมาไม่เสีย (ใน Git Bash):

```bash
sha256sum tools/tts/models/model_1000000.pt tools/tts/models/pytorch_model.bin
```

เลขที่ได้ต้องตรงกับนี้:
- `model_1000000.pt` = `304db1ac0ff1d0a92f3cc14951ee053e52e25ae13abfdb5dc339cdb9b3bebc62`
- `pytorch_model.bin` = `97ec976ad1fd67a33ab2682d29c0ac7df85234fae875aefcc5fb215681a91b2a`

## ขั้นที่ 3: ดึงบทพูดออกมาจากบทเรียน
```bash
npm run narration:export
```
จะได้ไฟล์ `tools/tts/narration.json` (มีเฉพาะบทที่ status เป็น `ready`)

## ขั้นที่ 4: สร้างไฟล์เสียง
```bash
PYTHONIOENCODING=utf-8 tools/tts/.venv/Scripts/python.exe -I tools/tts/gen_lessons.py tools/tts/narration.json public/audio
```
- ไฟล์ไหนมีเสียงอยู่แล้ว โปรแกรมจะข้าม (พิมพ์ `skip`)
- อยากสร้างใหม่ทับของเดิม ใส่ `--force` ต่อท้าย
- อยากทำแค่บทเดียว ใส่ `--only p0-l1` ต่อท้าย (เปลี่ยนเป็นรหัสบทที่ต้องการ)
- ครั้งแรกโหลดโมเดลช้าหน่อย แต่ละฉากใช้ไม่กี่วินาที

## คำอังกฤษอ่านผิด ทำยังไง
เปิด `tools/tts/gen_lessons.py` แล้วเพิ่มคำในตาราง `PRONOUNCE` เช่น `"switch": "สวิตช์"`
แล้วรันขั้นที่ 4 ใหม่พร้อม `--force`
