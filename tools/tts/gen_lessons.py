"""Generate lesson narration mp3 files offline with the local F5-TTS-THAI model.

Usage:
  python -I tools/tts/gen_lessons.py tools/tts/narration.json public/audio [--force] [--only <lessonId>]

Output: <out_dir>/<lessonId>/<sceneId>.mp3 (existing files are skipped unless --force).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

os.environ.setdefault("PYTHONIOENCODING", "utf-8")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).resolve().parent
MODELS = HERE / "models"
REF_AUDIO = HERE / "ref" / "ref_gen_4.wav"
REF_TEXT = "เราอยากจะตื่นขึ้นมามั้ยคะ."

# English terms -> Thai reading, applied before synthesis (longest keys first, case-insensitive).
PRONOUNCE = {
    "IP address": "ไอพีแอดเดรส",
    "MAC address": "แม็คแอดเดรส",
    "default gateway": "ดีฟอลต์เกตเวย์",
    "end device": "เอ็นด์ดีไวซ์",
    "subnet mask": "ซับเน็ตมาสก์",
    "network": "เน็ตเวิร์ค",
    "Switch": "สวิตช์",
    "Router": "เราเตอร์",
    "Gateway": "เกตเวย์",
    "packet": "แพ็กเก็ต",
    "source": "ซอร์ส",
    "destination": "เดสทิเนชัน",
    "huggingface.co": "ฮักกิ้งเฟซ ดอท ซีโอ",
    "Chrome": "โครม",
    "server": "เซิร์ฟเวอร์",
    "cable": "เคเบิล",
    "Internet": "อินเทอร์เน็ต",
    "LAN": "แลน",
    "WAN": "แวน",
    "DNS": "ดีเอ็นเอส",
    "ARP": "เออาร์พี",
    "broadcast": "บรอดแคสต์",
    "unicast": "ยูนิแคสต์",
    "MAC": "แม็ค",
    "NIC": "นิค",
    "IPv4": "ไอพีเวอร์ชันสี่",
    "IP": "ไอพี",
    "OSI": "โอเอสไอ",
    "TCP/IP": "ทีซีพีไอพี",
    "TCP": "ทีซีพี",
    "port": "พอร์ต",
    "layer": "เลเยอร์",
    "model": "โมเดล",
    "de-encapsulation": "ดีเอ็นแคปซูเลชัน",
    "encapsulation": "เอ็นแคปซูเลชัน",
    "data": "ดาต้า",
    "Data Link": "ดาต้าลิงก์",
    "segment": "เซกเมนต์",
    "frame": "เฟรม",
    "bits": "บิต",
    "bit": "บิต",
    "byte": "ไบต์",
    "binary": "ไบนารี",
    "PDU": "พีดียู",
    "Application": "แอปพลิเคชัน",
    "Presentation": "พรีเซนเทชัน",
    "Session": "เซสชัน",
    "Transport": "ทรานสปอร์ต",
    "Physical": "ฟิสิคัล",
    "Network Access": "เน็ตเวิร์คแอคเซส",
    "Subnet": "ซับเน็ต",
    "CCNA": "ซีซีเอ็นเอ",
    "Cisco": "ซิสโก้",
    "GitHub Desktop": "กิตฮับเดสก์ท็อป",
    "GitHub": "กิตฮับ",
    "GitLab": "กิตแล็บ",
    "Git Bash": "กิตบาช",
    "Git": "กิต",
    "repository": "รีโพซิทอรี",
    "staging area": "สเตจจิ้งแอเรีย",
    "commit": "คอมมิต",
    "clone": "โคลน",
    "push": "พุช",
    "pull": "พูล",
    "remote": "รีโมต",
    "origin": "ออริจิน",
    "init": "อินิต",
    "add": "แอด",
    "status": "สเตตัส",
    "log": "ล็อก",
    "version control": "เวอร์ชันคอนโทรล",
    "command line": "คอมมานด์ไลน์",
    "Windows": "วินโดวส์",
}


def apply_pronounce(text: str) -> str:
    for key in sorted(PRONOUNCE, key=len, reverse=True):
        pattern = r"(?<![A-Za-z0-9])" + re.escape(key) + r"(?![A-Za-z0-9])"
        text = re.sub(pattern, PRONOUNCE[key], text, flags=re.IGNORECASE)
    return text


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("narration")
    ap.add_argument("out_dir")
    ap.add_argument("--force", action="store_true", help="regenerate existing mp3 files")
    ap.add_argument("--only", help="only this lessonId")
    args = ap.parse_args()

    items = json.loads(Path(args.narration).read_text(encoding="utf-8"))
    if args.only:
        items = [i for i in items if i["lessonId"] == args.only]
    out_dir = Path(args.out_dir)

    todo = []
    for it in items:
        target = out_dir / it["lessonId"] / f"{it['sceneId']}.mp3"
        if target.exists() and not args.force:
            print(f"skip   {it['lessonId']}/{it['sceneId']} (exists)", flush=True)
        else:
            todo.append((it, target))
    if not todo:
        print("nothing to do")
        return 0

    import soundfile as sf
    from f5_tts_th.utils_infer import (infer_process, load_model, load_vocoder,
                                       preprocess_ref_audio_text)

    # Same config as f5_tts_th.tts.TTS(model="v1"), but loading local files (huggingface is blocked).
    model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512,
                     text_mask_padding=False, conv_layers=4, pe_attn_head=1)
    model = load_model(model_cfg, str(MODELS / "model_1000000.pt"), mel_spec_type="vocos",
                       vocab_file=str(MODELS / "vocab.txt"))
    vocoder = load_vocoder("vocos", is_local=True, local_path=str(MODELS))
    ref_audio, ref_text = preprocess_ref_audio_text(str(REF_AUDIO), REF_TEXT)

    failures = 0
    for it, target in todo:
        label = f"{it['lessonId']}/{it['sceneId']}"
        try:
            text = apply_pronounce(it["text"])
            wav, _, _ = infer_process(ref_audio, ref_text, text, model, vocoder,
                                      mel_spec_type="vocos", nfe_step=32, speed=0.9,
                                      cfg_strength=2.0, set_max_chars=100, use_ipa=False)
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.TemporaryDirectory() as tmp:
                wav_path = Path(tmp) / "tmp.wav"
                sf.write(str(wav_path), wav, 24000)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav_path),
                                "-b:a", "96k", str(target)], check=True)
            print(f"done   {label} -> {target}", flush=True)
        except Exception as e:  # keep going so one bad scene doesn't lose the batch
            failures += 1
            print(f"FAILED {label}: {e}", flush=True)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
