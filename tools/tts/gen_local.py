import sys, soundfile as sf
from f5_tts_th.utils_infer import load_model, load_vocoder, infer_process, preprocess_ref_audio_text

base, models = sys.argv[1], sys.argv[2]
text = ("คอมพิวเตอร์ทุกเครื่อง ต้องมีเลขประจำตัวนะครับ "
        "เหมือนบ้านทุกหลัง ที่ต้องมีบ้านเลขที่ "
        "ลองนึกดูนะ ถ้าบ้านเราไม่มีเลขที่ บุรุษไปรษณีย์ก็งงเลย ว่าจะเอาจดหมายไปส่งที่ไหน "
        "ในโลกของเน็ตเวิร์ค เราเรียกเลขนี้ว่า ไอพีแอดเดรส")
refs = {
    1: "ได้รับข่าวคราวของเราที่จะหาที่มันเป็นไปที่จะจัดขึ้น.",
    2: "ฉันเดินทางไปเที่ยวที่จังหวัดเชียงใหม่ในช่วงฤดูหนาวเพื่อสัมผัสอากาศเย็นสบาย.",
    3: "กู้ดอาฟเต้อนูนไนท์ทูมีทยู.",
    4: "เราอยากจะตื่นขึ้นมามั้ยคะ.",
}
# Same config as f5_tts_th.tts.TTS(model="v1"), but loading files the user downloaded.
model_cfg = dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512,
                 text_mask_padding=False, conv_layers=4, pe_attn_head=1)
model = load_model(model_cfg, f"{models}/model_1000000.pt", mel_spec_type="vocos",
                   vocab_file=f"{models}/vocab.txt")
vocoder = load_vocoder("vocos", is_local=True, local_path=models)
for i, ref_text in refs.items():
    ref_audio, rt = preprocess_ref_audio_text(f"{base}/ref/ref_gen_{i}.wav", ref_text)
    wav, _, _ = infer_process(ref_audio, rt, text, model, vocoder, mel_spec_type="vocos",
                              nfe_step=32, speed=0.9, cfg_strength=2.0, set_max_chars=100,
                              use_ipa=False)
    sf.write(f"{base}/out/voice_{i}.wav", wav, 24000)
    print("done", i, flush=True)
