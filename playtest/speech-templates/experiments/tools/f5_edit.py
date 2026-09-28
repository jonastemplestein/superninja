"""Speech-template experiment, method E: neural speech editing with F5-TTS (F5TTS_v1_Base, flow matching, 24 kHz).

The master carrier ("Say pig slowly.") is edited in place: the filler's region is masked and regenerated for the target
text ("Say mat slowly."), conditioned on the rest of the take (the model's own speech_edit.py procedure: mel-domain
mask, 32 NFE, CFG 2). Jobs come from build.py (playtest/runs/speech-templates/f5_jobs.json).

Run (its own venv, `uv pip install f5-tts`, on Apple MPS):
  playtest/runs/speech-templates/.venv-f5/bin/python playtest/speech-templates/experiments/tools/f5_edit.py
"""
import json
import os
import sys
import time
from importlib.resources import files
from pathlib import Path

os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
import torch  # noqa: E402
import torch.nn.functional as F  # noqa: E402
import soundfile  # noqa: E402
import torchaudio  # noqa: E402
from cached_path import cached_path  # noqa: E402
from hydra.utils import get_class  # noqa: E402
from omegaconf import OmegaConf  # noqa: E402

from f5_tts.infer.utils_infer import load_checkpoint, load_vocoder  # noqa: E402
from f5_tts.model import CFM  # noqa: E402
from f5_tts.model.utils import get_tokenizer  # noqa: E402

ROOT = Path(__file__).resolve().parents[4]
RUNS = ROOT / "playtest/runs/speech-templates"
OUT = RUNS / "out/E_raw"
OUT.mkdir(parents=True, exist_ok=True)
device = "mps" if torch.backends.mps.is_available() else "cpu"
SEEDS = int(sys.argv[1]) if len(sys.argv) > 1 else 1

exp = "F5TTS_v1_Base"
cfg = OmegaConf.load(str(files("f5_tts").joinpath(f"configs/{exp}.yaml")))
cls = get_class(f"f5_tts.model.{cfg.model.backbone}")
ms = cfg.model.mel_spec
vocab, vsize = get_tokenizer(str(files("f5_tts").joinpath("infer/examples/vocab.txt")), "custom")
t_load = time.perf_counter()
model = CFM(transformer=cls(**cfg.model.arch, text_num_embeds=vsize, mel_dim=ms.n_mel_channels),
            mel_spec_kwargs=dict(n_fft=ms.n_fft, hop_length=ms.hop_length, win_length=ms.win_length,
                                 n_mel_channels=ms.n_mel_channels, target_sample_rate=ms.target_sample_rate,
                                 mel_spec_type=ms.mel_spec_type),
            odeint_kwargs=dict(method="euler"), vocab_char_map=vocab).to(device)
model = load_checkpoint(model, str(cached_path(f"hf://SWivid/F5-TTS/{exp}/model_1250000.safetensors")), device, use_ema=True)
vocoder = load_vocoder(vocoder_name=ms.mel_spec_type, is_local=False)
load_s = time.perf_counter() - t_load
sr, hop, nmel = ms.target_sample_rate, ms.hop_length, ms.n_mel_channels
target_rms = 0.1

jobs = json.loads((RUNS / "f5_jobs.json").read_text())
report = {"load_s": round(load_s, 1), "device": device, "jobs": []}
for j in jobs:
    data, a_sr = soundfile.read(j["audio"], dtype="float32", always_2d=True)  # torchaudio.load needs torchcodec + ffmpeg 4
    audio = torch.from_numpy(data.mean(1))[None, :]
    rms = torch.sqrt(torch.mean(audio ** 2))
    if rms < target_rms:
        audio = audio * target_rms / rms
    if a_sr != sr:
        audio = torchaudio.transforms.Resample(a_sr, sr)(audio)
    audio = audio.to(device)
    for seed in range(SEEDS):
        t0 = time.perf_counter()
        with torch.inference_mode():
            mel = model.mel_spec(audio).permute(0, 2, 1)
            off = 0
            cond = torch.zeros(1, 0, nmel, device=device)
            mask = torch.zeros(1, 0, dtype=torch.bool, device=device)
            new_regions = []
            for (a, b), d in zip(j["parts"], j["durs"]):
                sf, ef, df = round(a * sr / hop), round(b * sr / hop), round(d * sr / hop)
                start_out = cond.shape[1] + (sf - off)
                cond = torch.cat((cond, mel[:, off:sf, :], torch.zeros(1, df, nmel, device=device)), dim=1)
                mask = torch.cat((mask, torch.ones(1, sf - off, dtype=torch.bool, device=device),
                                  torch.zeros(1, df, dtype=torch.bool, device=device)), dim=-1)
                new_regions.append([start_out * hop / sr, (start_out + df) * hop / sr])
                off = ef
            cond = torch.cat((cond, mel[:, off:, :]), dim=1)
            mask = F.pad(mask, (0, cond.shape[1] - mask.shape[-1]), value=True)
            gen, _ = model.sample(cond=cond, text=[j["target"]], duration=cond.shape[1], steps=32, cfg_strength=2.0,
                                  sway_sampling_coef=-1.0, seed=1000 + seed, edit_mask=mask)
            wave = vocoder.decode(gen.to(torch.float32).permute(0, 2, 1)).cpu()
            if rms < target_rms:
                wave = wave * rms / target_rms
        secs = time.perf_counter() - t0
        path = OUT / f"{j['id']}_s{seed}.wav"
        soundfile.write(str(path), wave[0].numpy(), sr)
        report["jobs"].append(dict(id=j["id"], seed=seed, file=str(path.relative_to(ROOT)), seconds=round(secs, 2),
                                   regions=[[round(a, 3), round(b, 3)] for a, b in new_regions]))
        print(j["id"], seed, round(secs, 2), "s", flush=True)
(RUNS / "f5_report.json").write_text(json.dumps(report, indent=1))
