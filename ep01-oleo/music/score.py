"""Trilha original do EP01, sintetizada em numpy (sem samples). 120 BPM, Mi menor; o final sobe um tom (Fá# menor).
uso: python music/score.py   (lê timeline.json e events.json, escreve music/score.wav)"""

import json, os, sys
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 48000
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
EVJ = json.load(open(os.path.join(ROOT, "events.json")))
EV = EVJ["ev"]
DUR = TL["dur"]
S = TL["sec"]
BEAT = 60 / TL["bpm"]
S16 = BEAT / 4
BAR = BEAT * 4
TRAVA = next(e["t"] for e in EV if e["type"] == "seize_big")
CLACK = next(e["t"] for e in EV if e["type"] == "clack_lock")
N = int((DUR + 2) * SR)
OUT = np.zeros((N, 2))
rng = np.random.default_rng(11)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def put(x, at, g=1.0, pan=0.0):
    s = int(round(at * SR))
    e = min(N, s + len(x))
    if s >= N or e <= 0:
        return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    OUT[s:e, 0] += x[: e - s] * g * l * 1.414
    OUT[s:e, 1] += x[: e - s] * g * r * 1.414


def lp(x, f, o=2):
    return sosfilt(butter(o, min(f, SR * 0.45), "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, min(hi, SR * 0.45)], "band", fs=SR, output="sos"), x)


def saw(f, n, ph=0.0):  # dente-de-serra com polyBLEP
    dt = f / SR
    p = (ph + dt * np.arange(n)) % 1.0
    y = 2 * p - 1
    a = p < dt
    t = p[a] / dt
    y[a] -= 2 * t - t * t - 1
    b = p > 1 - dt
    t = (p[b] - 1) / dt
    y[b] -= t * t + 2 * t + 1
    return y


def env(n, a=0.004, tau=0.15, rel=0.02):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / tau)
    r = int(rel * SR)
    if r and n > r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def noise(n):
    return rng.standard_normal(n)


# ---------- harmonia ----------
CH = {  # (baixo, pad, arpejo)
    "Em9": (40, [55, 59, 62, 66], [64, 67, 71, 74, 78]),
    "Cmaj7": (36, [55, 59, 60, 64], [60, 64, 67, 71, 76]),
    "G6": (43, [55, 59, 62, 64], [62, 67, 71, 74, 76]),
    "D6": (38, [54, 57, 62, 64], [62, 64, 66, 69, 74]),
    "Am7": (45, [55, 57, 60, 64], [60, 64, 67, 69, 72]),
    "B7": (47, [54, 57, 59, 63], [59, 63, 66, 69, 71]),
}


def chord_at(t):
    if t >= S["fix"]:
        prog, t0, up = ["Em9", "Cmaj7", "G6", "D6"], S["fix"], 2
    elif t >= S["desgaste"]:
        prog, t0, up = ["Em9", "Cmaj7", "Am7", "B7"], S["desgaste"], 0
    elif t >= S["motor"]:
        prog, t0, up = ["Em9", "Cmaj7", "G6", "D6"], S["motor"], 0
    else:
        prog, t0, up = ["Em9", "Cmaj7"], S["intro"], 0
    b, pad, arp = CH[prog[int((t - t0) // (2 * BAR)) % len(prog)]]
    return b + up, [m + up for m in pad], [m + up for m in arp]


# ---------- instrumentos ----------
def arp_note(m, at, cut, g, ln=0.2):
    n = int(ln * SR)
    x = saw(hz(m), n) * 0.6 + saw(hz(m) * 1.004, n) * 0.4
    x = lp(x, cut) * env(n, 0.003, 0.09)
    x = hp(x, 250)
    put(x, at, g, -0.25)
    put(x, at + 3 * S16, g * 0.35, 0.6)
    put(x, at + 6 * S16, g * 0.15, -0.6)  # ping-pong


def bass_note(m, at, ln, g, cut=420):
    n = int(ln * SR)
    x = saw(hz(m), n) + 0.5 * np.sign(
        np.sin(2 * np.pi * hz(m - 12) * np.arange(n) / SR)
    )
    put(lp(x, cut, 3) * env(n, 0.004, ln * 0.6, 0.03), at, g)


def kick(at, g=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12), at, g)


def hat(at, g, ln=0.05):
    n = int(ln * SR)
    put(hp(noise(n), 7000) * env(n, 0.001, ln / 3), at, g, 0.3)


def clap(at, g):
    n = int(0.25 * SR)
    x = bp(noise(n), 900, 2600)
    e = np.zeros(n)
    for d in (0, 0.011, 0.022):
        s = int(d * SR)
        e[s:] += np.exp(-np.arange(n - s) / SR / (0.012 if d < 0.02 else 0.07))
    put(x * e * 0.6, at, g, -0.15)


def pad(ms, at, ln, g, cut=1400, att=0.4, wide=0.6):
    n = int(ln * SR)
    t = np.arange(n) / SR
    e = np.minimum(1, t / att) * np.minimum(1, (ln - t) / 0.5)
    for i, m in enumerate(ms):
        for d, p in ((-0.006, -wide), (0.006, wide)):
            put(lp(saw(hz(m) * (1 + d), n, ph=i * 0.17), cut) * e, at, g * 0.12, p)


def sub808(m, at, g=1.0, ln=1.8, glide=-7):
    n = int(ln * SR)
    t = np.arange(n) / SR
    f = hz(m) * 2 ** (glide / 12 * np.minimum(1, t / 0.6))
    x = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.7)
    put(x, at, g)


def riser(a, b, g):
    n = int((b - a) * SR)
    t = np.linspace(0, 1, n)
    x = noise(n)
    out = np.zeros(n)
    blk = 2400
    for i in range(0, n, blk):  # band-pass que sobe
        f = 400 + 6000 * t[i] ** 2
        out[i : i + blk] = bp(x[i : i + blk], f, f * 1.6)[: len(out[i : i + blk])]
    put(out * t**2, a, g)


def grid(a, b, step):
    k = np.ceil(a / step - 1e-9)
    out = []
    while k * step < b - 1e-9:
        out.append(round(k * step, 4))
        k += 1
    return out


# ---------- gancho (0–4): drone + pulsos, corta no travamento ----------
pad([40, 47, 52], 0.0, 4.0, 1.4, cut=500, att=0.6, wide=0.3)
for t in grid(0, 4.0, BEAT):
    put(
        lp(np.sin(2 * np.pi * 55 * np.arange(int(0.18 * SR)) / SR), 200)
        * env(int(0.18 * SR), 0.005, 0.06),
        t,
        0.5,
    )
# ---------- vinheta (4,5–10) ----------
riser(4.6, 7.0, 0.35)
for t in grid(4.5, 9.5, S16):
    b, pd, ar = chord_at(t)
    i = int(round((t - 4.5) / S16))
    cut = 600 + 3400 * min(1, (t - 4.5) / 2.5)
    arp_note(
        ar[[0, 1, 2, 3, 4, 3, 2, 1][i % 8]],
        t,
        cut,
        0.16 + 0.1 * min(1, (t - 4.5) / 2.5),
    )
for t in grid(7.0, 9.5, BEAT):
    kick(t, 0.8 if t >= 8.0 else 0.45)
for t in grid(7.0, 9.5, BEAT / 2):
    hat(t, 0.10 if (t / (BEAT / 2)) % 2 else 0.05)
pad([52, 55, 59, 62, 66], 7.0, 0.5, 1.4, cut=3000, att=0.005)  # stab no tink
sub808(40, 8.0, 0.9)
pad(
    [52, 59, 62, 66, 71, 74], 8.0, 1.6, 1.6, cut=4200, att=0.01, wide=0.9
)  # drop no nome
for t in grid(8.0, 9.5, BEAT / 2):
    bass_note(40, t, 0.22, 0.32)

# ---------- motor (10–22) / funções (22–34) / desgaste (34–50) ----------
for t in grid(S["motor"], S["silencio"], S16):
    b, pd, ar = chord_at(t)
    i = int(round((t - S["motor"]) / S16))
    beat_pos = i % 4
    if t < S["funcoes"]:
        step, cut, g = 1, 1800 + 1500 * min(1, (t - 10) / 6), 0.15
    elif t < S["desgaste"]:
        step, cut, g = 2, 2200, 0.13
    elif t < 41:
        step, cut, g = 2, 2200 - 1400 * (t - 34) / 7, 0.12
    elif t < 47:
        step, cut, g = 4, 800 - 300 * (t - 41) / 6, 0.11
    else:
        step = 0
    if step and i % step == 0:
        arp_note(ar[[0, 1, 2, 3, 4, 3, 2, 1][(i // step) % 8]], t, cut, g)
    if 15.6 < t < 19.6 and i % 2 == 0:
        arp_note(
            ar[[4, 3, 2, 1][(i // 2) % 4]] + 12, t, 3500, 0.07
        )  # camada do "3.000 rpm"
for t in grid(S["motor"], S["silencio"], BEAT / 2):
    b, pd, ar = chord_at(t)
    k = int(round((t - S["motor"]) / (BEAT / 2)))
    if t < S["funcoes"]:
        bass_note(b, t, 0.22, 0.30)
    elif t < S["desgaste"]:
        if k % 2 == 0:
            bass_note(b, t, 0.45, 0.30)
    elif t < 47:
        if k % (2 if t < 41 else 4) == 0:
            bass_note(b, t, 0.9 if t < 41 else 1.8, 0.30, cut=300)
for t in grid(S["motor"], S["funcoes"], BEAT):
    kick(t, 0.55 if int(round((t - 10) / BEAT)) % 2 == 0 else 0.3)
for t in grid(S["funcoes"], S["desgaste"], BAR):
    kick(t, 0.5)
for t in grid(14.0, S["desgaste"], BEAT / 2):
    hat(t, (0.08 if (round(t / (BEAT / 2))) % 2 else 0.04) * (0.7 if t > 22 else 1))
for t in grid(16.0, S["funcoes"], BEAT):
    if int(round(t / BEAT)) % 2 == 1:
        clap(t, 0.22)
for t in grid(S["funcoes"], S["desgaste"], BAR):
    clap(t + 2 * BEAT, 0.2)
for t0 in grid(S["motor"], S["silencio"], 2 * BAR):
    b, pd, ar = chord_at(t0 + 0.01)
    dark = t0 >= S["desgaste"]
    pad(
        pd,
        t0,
        min(2 * BAR, S["silencio"] - t0),
        0.9 if not dark else 0.8,
        cut=1600 if not dark else max(500, 1400 - (t0 - 34) * 60),
    )
pad(
    [28, 40, 47],
    S["desgaste"] + 2,
    S["silencio"] - S["desgaste"] - 2,
    0.8,
    cut=300,
    att=4.0,
    wide=0.2,
)  # grave que cresce
# ---------- virada (50,5–trava): só um cluster dissonante crescendo; corta seco no "trava" ----------
pad([40, 41, 46, 47], S["virada"], TRAVA - S["virada"], 1.4, cut=900, att=3.0, wide=0.8)
sub808(28, S["virada"], 0.9, ln=2.5, glide=-3)
# ---------- óleo novo (58–73,5) ----------
sub808(42, S["fix"], 1.0)
pad([54, 61, 64, 68, 73, 76], S["fix"], 2.0, 1.6, cut=4200, att=0.02, wide=0.9)
END_G = 73.5
for t in grid(S["fix"] + 0.5, END_G, S16):
    b, pd, ar = chord_at(t)
    i = int(round((t - S["fix"]) / S16))
    arp_note(
        ar[[0, 1, 2, 3, 4, 3, 2, 1][i % 8]], t, 2400 + 1200 * min(1, (t - 58) / 4), 0.14
    )
for t in grid(S["fix"] + 0.5, END_G, BEAT / 2):
    b, _, _ = chord_at(t)
    bass_note(b, t, 0.22, 0.30)
for t in grid(S["fix"] + 1.0, END_G, BEAT):
    kick(t, 0.55)
for t in grid(60.0, END_G, BEAT):
    if int(round(t / BEAT)) % 2 == 1:
        clap(t, 0.22)
for t in grid(S["fix"] + 1.0, END_G, S16):
    hat(t, 0.06 if int(round(t / S16)) % 2 else 0.03)
for t0 in grid(S["fix"], END_G, 2 * BAR):
    b, pd, ar = chord_at(t0 + 0.01)
    pad(pd, t0, min(2 * BAR, END_G - t0 + 0.3), 0.9, cut=2000)
# ---------- final (74–80): riser, stab no aperto, cauda ----------
riser(73.9, CLACK, 0.3)
for t in grid(74.0, CLACK, S16):
    b, pd, ar = chord_at(70)
    arp_note(
        ar[int(round((t - 74) / S16)) % 5],
        t,
        1500 + 2000 * (t - 74) / max(0.1, CLACK - 74),
        0.10,
    )
sub808(42, CLACK, 1.0, ln=2.5)
pad(
    [54, 61, 64, 68, 73, 76, 80],
    CLACK,
    DUR - CLACK + 0.5,
    1.3,
    cut=3800,
    att=0.01,
    wide=1.0,
)
for t in grid(CLACK, DUR - 1.0, BEAT / 2):
    i = int(round((t - CLACK) / (BEAT / 2)))
    arp_note(
        [66, 69, 73, 76, 80, 76, 73, 69][i % 8],
        t,
        2600 - 1600 * (t - CLACK) / (DUR - CLACK),
        0.12 * (1 - (t - CLACK) / (DUR - CLACK)),
    )
for t in grid(CLACK, DUR - 1.5, BAR):
    kick(t, 0.45)


# ---------- silêncios: 50,0–50,5 zero digital; do "trava" até 58 nada de música ----------
def zero(a, b, fade=0.01):
    s, e = int(a * SR), int(b * SR)
    f = int(fade * SR)
    OUT[max(0, s - f) : s] *= np.linspace(1, 0, min(f, s))[:, None]
    OUT[s:e] = 0


zero(4.0, 4.5)
zero(S["silencio"], S["virada"])
zero(TRAVA, S["fix"] - 0.005, fade=0.004)
OUT[:] = np.tanh(OUT * 0.9) * 0.9
fade = int(1.0 * SR)
e = int(DUR * SR)
OUT[e - fade : e] *= np.linspace(1, 0, fade)[:, None]
OUT[e:] = 0
sf.write(os.path.join(HERE, "score.wav"), OUT[: int(DUR * SR)].astype(np.float32), SR)
pk = np.abs(OUT).max()
print(
    f"score.wav {DUR:.1f}s pico {20 * np.log10(pk + 1e-9):.1f} dBFS trava={TRAVA} clack={CLACK}"
)
