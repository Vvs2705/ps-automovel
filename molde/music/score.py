"""Trilha do molde, sintetizada em numpy (sem samples), a partir da trilha do EP01.
A semente (timeline.json, vinda do nome do vídeo ou de "semente" no cena.json) escolhe tom, andamento, progressão,
desenho do arpejo, timbre e bateria: dois vídeos não saem com a mesma música.
Seções: gancho (drone e pulso) → corpo (arpejo, baixo, bateria; escurece nas falas de alerta) → final (subida até o "clack" do nome, acorde aberto, cauda).
uso: python music/score.py saida/<nome>   (lê timeline.json, cena.json, events.json; escreve score.wav)"""

import json, os, sys
import numpy as np
from scipy.signal import butter, sosfilt
import soundfile as sf

D = sys.argv[1]
SR = 48000
J = lambda n: json.load(open(os.path.join(D, n), encoding="utf-8"))
TL, cena, EV = J("timeline.json"), J("cena.json"), J("events.json")["ev"]
DUR, O, vo, ids = TL["dur"], TL["outro"], TL["vo"], TL["ids"]
R = np.random.default_rng(TL["semente"])
rng = np.random.default_rng(TL["semente"] + 1)
N = int((DUR + 2) * SR)
OUT = np.zeros((N, 2))

# ---------- o que a semente escolhe ----------
UP = int(R.choice([0, 2, 3, 5, -2]))  # tom: Mi, Fá#, Sol, Lá, Ré (menor)
BPM = int(R.choice([104, 110, 116, 120, 124]))
PROG = [
    ["Em9", "Cmaj7", "G6", "D6"],
    ["Em9", "Am7", "Cmaj7", "B7"],
    ["Em9", "G6", "D6", "Cmaj7"],
    ["Em9", "Cmaj7", "Am7", "D6"],
][int(R.integers(4))]
ARP = [
    [0, 1, 2, 3, 4, 3, 2, 1],
    [0, 2, 1, 3, 2, 4, 3, 1],
    [0, 1, 2, 4, 3, 2, 1, 2],
    [4, 3, 2, 1, 0, 1, 2, 3],
][int(R.integers(4))]
STEP = int(R.choice([1, 2]))  # arpejo em semicolcheias ou colcheias
BRIGHT = float(R.uniform(0.75, 1.25))  # abertura do filtro
CLAP = bool(R.integers(2))
HAT16 = bool(R.integers(2))
BEAT = 60 / BPM
S16, BAR = BEAT / 4, BEAT * 4
CLACK = next((e["t"] for e in EV if e["type"] == "clack_lock"), O + 1.0)
BODY0 = (
    vo[ids[1]] if len(ids) > 1 else 2.0
)  # o groove entra na 2ª fala (depois do gancho)
falas = cena.get("falas", {})
body = [i for i in ids if i != TL["assina"]]
ALERT = [  # trechos das falas de alerta: a música escurece
    (vo[i] - 0.15, (vo[body[k + 1]] - 0.15) if k + 1 < len(body) else O - 0.45)
    for k, i in enumerate(body)
    if falas.get(i, {}).get("estado") == "alerta"
]


def alert(t):
    return any(a <= t < b for a, b in ALERT)


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


CH = {  # (baixo, pad, arpejo) em Mi menor; UP transpõe
    "Em9": (40, [55, 59, 62, 66], [64, 67, 71, 74, 78]),
    "Cmaj7": (36, [55, 59, 60, 64], [60, 64, 67, 71, 76]),
    "G6": (43, [55, 59, 62, 64], [62, 67, 71, 74, 76]),
    "D6": (38, [54, 57, 62, 64], [62, 64, 66, 69, 74]),
    "Am7": (45, [55, 57, 60, 64], [60, 64, 67, 69, 72]),
    "B7": (47, [54, 57, 59, 63], [59, 63, 66, 69, 71]),
}


def chord_at(t):
    b, pad, arp = CH[PROG[int(max(0, t - BODY0) // (2 * BAR)) % len(PROG)]]
    return b + UP, [m + UP for m in pad], [m + UP for m in arp]


def arp_note(m, at, cut, g, ln=0.2):
    n = int(ln * SR)
    x = saw(hz(m), n) * 0.6 + saw(hz(m) * 1.004, n) * 0.4
    x = hp(lp(x, cut) * env(n, 0.003, 0.09), 250)
    put(x, at, g, -0.25)
    put(x, at + 3 * S16, g * 0.35, 0.6)
    put(x, at + 6 * S16, g * 0.15, -0.6)  # eco pingue-pongue


def bass_note(m, at, ln, g, cut=420):
    n = int(ln * SR)
    x = saw(hz(m), n) + 0.5 * np.sign(
        np.sin(2 * np.pi * hz(m - 12) * np.arange(n) / SR)
    )
    put(lp(x, cut, 3) * env(n, 0.004, ln * 0.6, 0.03), at, g)


def kick(at, g=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    put(
        np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t / 0.035)) / SR)
        * np.exp(-t / 0.12),
        at,
        g,
    )


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
    if n <= 0:
        return
    t = np.arange(n) / SR
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, ln - t) / 0.5)
    for i, m in enumerate(ms):
        for d, p in ((-0.006, -wide), (0.006, wide)):
            put(lp(saw(hz(m) * (1 + d), n, ph=i * 0.17), cut) * e, at, g * 0.12, p)


def sub808(m, at, g=1.0, ln=1.8, glide=-7):
    n = int(ln * SR)
    t = np.arange(n) / SR
    f = hz(m) * 2 ** (glide / 12 * np.minimum(1, t / 0.6))
    put(np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 0.7), at, g)


def riser(a, b, g):
    n = int((b - a) * SR)
    if n <= 0:
        return
    t = np.linspace(0, 1, n)
    x, out, blk = noise(n), np.zeros(n), 2400
    for i in range(0, n, blk):  # passa-banda que sobe
        f = 400 + 6000 * t[i] ** 2
        out[i : i + blk] = bp(x[i : i + blk], f, f * 1.6)[: len(out[i : i + blk])]
    put(out * t**2, a, g)


def grid(a, b, step, t0=0.0):
    k = np.ceil((a - t0) / step - 1e-9)
    out = []
    while t0 + k * step < b - 1e-9:
        out.append(round(t0 + k * step, 4))
        k += 1
    return out


# ---------- gancho: drone + pulso; o groove entra na 2ª fala ----------
r0 = 40 + UP
pad([r0, r0 + 7, r0 + 12], 0.0, BODY0 + 0.3, 1.3, cut=500, att=0.4, wide=0.3)
for t in grid(0.2, BODY0, BEAT):
    n = int(0.18 * SR)
    put(
        lp(np.sin(2 * np.pi * hz(r0) * np.arange(n) / SR), 200) * env(n, 0.005, 0.06),
        t,
        0.5,
    )
riser(max(0, BODY0 - 1.6), BODY0, 0.25)
sub808(r0, BODY0, 0.9)
END = O - 0.3
# ---------- corpo ----------
for t in grid(BODY0, END, S16, BODY0):
    b, pd, ar = chord_at(t)
    i = int(round((t - BODY0) / S16))
    dark = alert(t)
    cut = (900 if dark else 1800 + 1200 * min(1, (t - BODY0) / 6)) * BRIGHT
    if i % (STEP * (2 if dark else 1)) == 0:
        arp_note(ar[ARP[(i // STEP) % 8]], t, cut, 0.12 if dark else 0.14)
for t in grid(BODY0, END, BEAT / 2, BODY0):
    b, _, _ = chord_at(t)
    k = int(round((t - BODY0) / (BEAT / 2)))
    if alert(t):
        if k % 4 == 0:
            bass_note(b, t, 0.9, 0.3, cut=300)
    else:
        bass_note(b, t, 0.22, 0.28)
for t in grid(BODY0, END, BEAT, BODY0):
    if not alert(t):
        kick(t, 0.5 if int(round((t - BODY0) / BEAT)) % 2 == 0 else 0.3)
    elif int(round((t - BODY0) / BEAT)) % 4 == 0:
        kick(t, 0.35)
for t in grid(BODY0 + 2 * BAR, END, S16 if HAT16 else BEAT / 2, BODY0):
    if not alert(t):
        hat(t, 0.05 if int(round((t - BODY0) / S16)) % 2 else 0.03)
if CLAP:
    for t in grid(BODY0 + 2 * BAR, END, BEAT, BODY0):
        if int(round((t - BODY0) / BEAT)) % 2 == 1 and not alert(t):
            clap(t, 0.2)
for t0 in grid(BODY0, END, 2 * BAR, BODY0):
    b, pd, ar = chord_at(t0 + 0.01)
    pad(
        pd,
        t0,
        min(2 * BAR, END - t0 + 0.3),
        0.85,
        cut=(700 if alert(t0) else 1600) * BRIGHT,
    )
for a, b in ALERT:  # cluster grave sob o alerta
    pad([r0 - 12, r0 - 11, r0 - 5], a, b - a, 1.0, cut=500, att=0.6, wide=0.6)
# ---------- final: subida até o nome, acorde aberto, cauda ----------
riser(O - 0.2, CLACK, 0.28)
for t in grid(O, CLACK, S16, O):
    _, _, ar = chord_at(BODY0)
    arp_note(
        ar[int(round((t - O) / S16)) % 5],
        t,
        1500 + 2000 * (t - O) / max(0.1, CLACK - O),
        0.1,
    )
sub808(r0 + 2, CLACK, 1.0, ln=2.5)
pad(
    [m + UP for m in (54, 61, 64, 68, 73, 76, 80)],
    CLACK,
    DUR - CLACK + 0.5,
    1.3,
    cut=3800,
    att=0.01,
    wide=1.0,
)
for t in grid(CLACK, DUR - 0.6, BEAT / 2, CLACK):
    i = int(round((t - CLACK) / (BEAT / 2)))
    u = (t - CLACK) / max(0.1, DUR - CLACK)
    arp_note(
        [66, 69, 73, 76, 80, 76, 73, 69][i % 8] + UP, t, 2600 - 1600 * u, 0.12 * (1 - u)
    )
kick(CLACK, 0.5)

OUT[:] = np.tanh(OUT * 0.9) * 0.9
fade, e = int(0.8 * SR), int(DUR * SR)
OUT[e - fade : e] *= np.linspace(1, 0, fade)[:, None]
OUT[e:] = 0
sf.write(os.path.join(D, "score.wav"), OUT[:e].astype(np.float32), SR)
pk = np.abs(OUT).max()
print(
    f"trilha: {DUR:.1f} s, tom {UP:+d}, {BPM} BPM, {'-'.join(PROG)}, pico {20 * np.log10(pk + 1e-9):.1f} dBFS"
)
