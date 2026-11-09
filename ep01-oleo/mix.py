"""Mix do EP01: efeitos sintetizados (events.json) + ambiente + voz + trilha, com ducking segurado sob a voz.
uso: python mix.py   (escreve mix.wav, 48 kHz estéreo)"""

import json, os
import numpy as np
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfilt
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
SR = 48000
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
EV = json.load(open(os.path.join(ROOT, "events.json")))["ev"]
DUR = TL["dur"]
N = int(DUR * SR)
rng = np.random.default_rng(5)


def bus():
    return np.zeros((N, 2))


SOFT, HITS, AMB = (
    bus(),
    bus(),
    bus(),
)  # foley macio (duck forte), batidas (duck leve), ambiente


def put(B, x, at, g=1.0, pan=0.0):
    s = int(round(at * SR))
    e = min(N, s + len(x))
    if s >= N or e <= 0:
        return
    if s < 0:
        x = x[-s:]
        s = 0
        e = min(N, len(x))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    B[s:e, 0] += x[: e - s] * g * l * 1.414
    B[s:e, 1] += x[: e - s] * g * r * 1.414


def flt(x, kind, f, o=2):
    return sosfilt(butter(o, f, kind, fs=SR, output="sos"), x)


def noise(d):
    return rng.standard_normal(int(round(d * SR)))


def tt(d):
    return np.arange(int(round(d * SR))) / SR


def ex(d, tau):
    return np.exp(-tt(d) / tau)


def sine(f, d, ph=0):
    return np.sin(2 * np.pi * f * tt(d) + ph)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- sons ----------
def click(p=1.0):
    d = 0.012
    return flt(noise(d), "high", 2500 * p) * ex(d, 0.002)


def thump(f=70, d=0.3):
    return np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-tt(d) / 0.02)) / SR) * ex(
        d, 0.07
    )


def metal(fs, d, tau):  # parciais inarmônicas de metal
    return sum(
        np.sin(2 * np.pi * f * tt(d) + i) * ex(d, tau / (1 + i * 0.4))
        for i, f in enumerate(fs)
    ) / len(fs)


def cat(*xs):  # soma sons de durações diferentes
    o = np.zeros(max(len(x) for x in xs))
    for x in xs:
        o[: len(x)] += x
    return o


def knock(v=1):
    return (
        cat(
            thump(85, 0.25) * 0.9,
            metal([1240, 1980, 2870], 0.18, 0.03) * 0.5,
            flt(noise(0.05), "band", [600, 2000]) * ex(0.05, 0.01) * 0.6,
        )
        * v
    )


def tink(v=1):
    return metal([2380, 3910, 5620, 7330], 0.9, 0.22) * v


def beep(m, d=0.06):
    return sine(hz(m), d) * np.minimum(1, tt(d) / 0.003) * ex(d, d / 2)


def lock(big=False):
    x = np.zeros(int(0.4 * SR))
    th = thump(60 if big else 75, 0.3) * (1.0 if big else 0.7)
    x[: len(th)] += th
    c = flt(noise(0.03), "band", [1500, 5000]) * ex(0.03, 0.006)
    x[: len(c)] += c * 0.8
    b1, b2 = beep(88), beep(95)
    s = int(0.05 * SR)
    x[s : s + len(b1)] += b1 * 0.25
    s = int(0.11 * SR)
    x[s : s + len(b2)] += b2 * 0.25
    return x


def confirm(v=1):
    x = np.zeros(int(0.7 * SR))
    for i, m in enumerate([88, 95, 102]):
        b = sine(hz(m), 0.6) * ex(0.6, 0.18) * np.minimum(1, tt(0.6) / 0.004)
        s = int(i * 0.035 * SR)
        x[s : s + len(b)] += b * 0.18
    return x * v


def blip(m):
    d = 0.09
    return (
        np.sin(
            2 * np.pi * hz(m) * tt(d)
            + 2 * np.sin(2 * np.pi * hz(m) * 2 * tt(d)) * ex(d, 0.02)
        )
        * ex(d, 0.03)
        * 0.4
    )


def sweep(f0, f1, d, g=0.3):
    f = f0 * (f1 / f0) ** (tt(d) / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt(d) / d) * g
    return (
        x
        + flt(noise(d), "band", [min(f0, f1) * 2, max(f0, f1) * 4])
        * np.sin(np.pi * tt(d) / d)
        * g
        * 0.5
    )


def whoosh(d=0.4):
    n = noise(d)
    e = np.sin(np.pi * np.minimum(1, tt(d) / d)) ** 2
    return flt(n, "band", [300, 3000]) * e * 0.5


def servo(d=0.4):
    f = 180 + 260 * tt(d) / d
    return (
        flt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), "low", 1400)
        * np.sin(np.pi * tt(d) / d)
        * 0.12
    )


def roll(d, v=1):
    x = np.zeros(int(d * SR) + 600)
    for k in range(int(d * 24)):
        c = click(1.6) * 0.25 * v
        s = int(k / 24 * SR)
        x[s : s + len(c)] += c
    return x


def ratchet(v=1):
    return cat(click(1.2) * 0.7, metal([3300, 4700], 0.05, 0.012) * 0.4) * v


def scrape(d):
    n = noise(d)
    x = flt(n, "band", [1800, 6500]) * (
        0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7.3 * tt(d)))
    )
    sq = (
        np.sin(2 * np.pi * np.cumsum(1850 + 120 * np.sin(2 * np.pi * 5 * tt(d))) / SR)
        * 0.25
    )
    return (x + sq) * np.minimum(1, tt(d) / 0.05) * 0.45


def crunch(v=1, d=0.8):
    return (
        cat(
            flt(noise(d), "low", 900) * ex(d, 0.15),
            metal([410, 980, 1670], d, 0.2) * 0.6,
            thump(45, d) * 0.8,
        )
        * v
    )


def bubbles(d, dens, low):
    x = flt(noise(d), "low", 300 if low else 600) * 0.05
    for i in range(int(d * dens)):
        a = rng.uniform(0, d - 0.1)
        f = rng.uniform(180, 420) * (0.6 if low else 1)
        b = (
            np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * tt(0.06) / 0.06)) / SR)
            * ex(0.06, 0.02)
            * 0.25
        )
        s = int(a * SR)
        x[s : s + len(b)] += b[: len(x) - s]
    return x


def grit(d):
    x = np.zeros(int(d * SR))
    idx = rng.integers(0, len(x), int(d * 220))
    x[idx] = rng.uniform(-1, 1, len(idx))
    return flt(x, "high", 3000) * 0.5


def glitch(d=0.125):
    n = noise(d)
    return np.round(flt(n, "band", [400, 6000]) * 3) / 3 * 0.35


def powerdown(d=1.1):
    f = 220 * (30 / 220) ** (tt(d) / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - tt(d) / d) * 0.35


def siren(d, v=1, env=((0, 1), (1, 1)), dop=((0, 1), (1, 1))):  # sirene eletrônica (wail) com doppler
    t = tt(d)
    u = t / d
    lfo = 0.5 - 0.5 * np.cos(2 * np.pi * t / 1.1)
    f = (680 + 700 * lfo) * np.interp(u, *zip(*dop))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = flt(np.tanh(2.2 * np.sin(ph)) + 0.15 * np.sin(2 * ph), "band", [350, 6000])
    fade = np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08)
    return x * np.interp(u, *zip(*env)) * fade * v * 0.25


def brake(d=0.55):  # chiado de pneu
    t = tt(d)
    f = 1900 * (1 + 0.02 * np.sin(2 * np.pi * 9 * t)) * (1 - 0.12 * t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * 0.5 + np.sin(2 * ph) * 0.15 + flt(noise(d), "band", [1500, 4500]) * 0.6
    return x * np.sin(np.pi * t / d) ** 0.6 * (1 - 0.3 * t / d) * 0.22


def hiss(d=0.55):  # freio a ar
    return flt(noise(d), "band", [2500, 9000]) * ex(d, 0.18) * 0.35


def rumble(d, v=1, f0=38, f1=38):  # motor do furgão
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / d) / SR
    x = flt(np.sign(np.sin(ph)) * 0.5 + 0.5 * np.sin(2 * ph), "low", 260) + flt(noise(d), "low", 300) * 0.6
    return x * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5) * v * 0.2


def pop():
    return cat(sweep(300, 1400, 0.12, 0.4), click(0.8) * 0.5)


# ---------- ambiente: zumbido do projetor + ronco do motor ----------
crank = next(e for e in EV if e["type"] == "crank")
w = np.array(crank["w"])
th = np.cumsum(w) / crank["hz"]
tgrid = np.arange(N) / SR
theta = np.interp(tgrid, np.arange(len(th)) / crank["hz"], th)
for e in EV:
    t0 = e["t"]
    if e["type"] == "hum":
        d = e["to"] - t0
        x = (sine(40, d) * 0.5 + sine(80, d) * 0.3 + sine(120, d) * 0.15) * 0.05 + flt(
            noise(d), "low", 400
        ) * 0.012
        x *= np.minimum(1, tt(d) / 0.3) * np.minimum(1, (d - tt(d)) / 0.3)
        put(AMB, x, t0)
    elif e["type"] == "engine":
        s, en = int(t0 * SR), int(e["to"] * SR)
        d = (en - s) / SR
        ph = theta[s:en]
        puls = 0.5 + 0.5 * np.cos(2 * np.pi * ph) ** 8
        x = (
            flt(rng.standard_normal(en - s), "low", 160) * puls * 0.55
            + np.sin(2 * np.pi * np.cumsum(55 + 25 * w.mean()) / SR * 0) * 0
        )
        x += np.sin(2 * np.pi * 2 * ph) * 0.08 * puls
        x *= np.minimum(1, tt(d)[: len(x)] / 0.4) * np.minimum(
            1, (d - tt(d)[: len(x)]) / 0.15
        )
        put(AMB, x * e.get("v", 0.5), t0)

# ---------- efeitos ----------
for e in EV:
    t0, k, v = e["t"], e["type"], e.get("v", 1)
    if k == "knock":
        put(HITS, knock(v), t0, 0.9)
    elif k == "seize":
        put(HITS, crunch(0.8, 0.7), t0, 0.9)
    elif k == "seize_big":
        put(HITS, crunch(1.2, 1.4), t0, 1.0)
        put(HITS, tink(0.6), t0 + 0.02, 0.5, 0.3)
    elif k == "scan":
        put(SOFT, sweep(220, 880, e["d"], 0.22 * v), t0)
    elif k == "scan_down":
        put(SOFT, sweep(900, 200, e["d"], 0.2), t0)
    elif k == "ratchet":
        put(HITS, ratchet(v), t0, 0.6, 0.15)
    elif k == "pop":
        put(HITS, pop(), t0, 0.8)
    elif k == "whoosh":
        put(SOFT, whoosh(e["d"]), t0, 0.7)
    elif k == "tink":
        put(HITS, tink(v), t0, 0.9, -0.2)
    elif k == "roll":
        put(SOFT, roll(e["d"], v), t0, 0.8)
    elif k == "lock":
        put(HITS, lock(), t0, 0.9)
    elif k == "lock_big":
        put(HITS, lock(True), t0, 1.0)
    elif k == "confirm":
        put(HITS, confirm(v), t0, 0.9)
    elif k == "blip":
        put(SOFT, blip(76 + 3 * e.get("n", 0)), t0, 0.8)
    elif k == "chip":
        put(
            SOFT,
            blip([76, 79, 81, 83, 86][e.get("i", 0) % 5]),
            t0,
            0.9,
            -0.2 + 0.1 * e.get("i", 0),
        )
    elif k == "dock":
        put(SOFT, cat(servo(0.25), click(1.2) * 0.3), t0, 0.8)
    elif k == "loupe":
        put(SOFT, cat(servo(0.35), whoosh(0.45) * 0.6), t0)
        put(HITS, metal([3100, 4400], 0.5, 0.12) * 0.5, t0 + 0.3, 0.6)
    elif k == "loupe_big":
        put(
            HITS,
            cat(
                thump(38, 1.2) * 1.2, flt(noise(0.6), "low", 1200) * ex(0.6, 0.2) * 0.6
            ),
            t0,
            1.0,
        )
        put(SOFT, whoosh(0.6), t0 - 0.05, 0.8)
    elif k == "oil_bed":
        d = e["to"] - t0
        x = bubbles(d, 9, False) * np.linspace(0.6, 1.2, int(round(d * SR)))
        put(AMB, x, t0, 0.9)
    elif k == "grit":
        put(SOFT, grit(e["d"]) * np.sin(np.pi * tt(e["d"]) / e["d"]), t0, 0.5)
    elif k == "clog":
        put(HITS, cat(bubbles(0.8, 25, True) * 2, sweep(400, 160, 0.8, 0.15)), t0, 0.9)
    elif k == "scrape":
        put(HITS, scrape(e["to"] - t0), t0, 0.9)
    elif k == "glitch":
        put(HITS, glitch(), t0, 0.8)
    elif k == "powerdown":
        put(SOFT, powerdown(), t0, 1.0)
    elif k == "oil_fresh":
        put(
            AMB,
            bubbles(e["d"], 6, False) * np.sin(np.pi * tt(e["d"]) / e["d"]),
            t0,
            1.2,
        )
    elif k == "servo":
        put(SOFT, servo(e["d"]), t0, 1.0)
    elif k == "rev_up":
        d = e["d"]
        f = 70 + 330 * (tt(d) / d) ** 1.5
        put(
            SOFT,
            flt(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), "low", 900)
            * np.sin(np.pi * tt(d) / d)
            * 0.18,
            t0,
        )
    elif k == "siren":
        put(SOFT, siren(e["d"], v, e.get("env", [[0, 1], [1, 1]]), e.get("dop", [[0, 1], [1, 1]])), t0, 1.0, e.get("pan", 0))
    elif k == "brake":
        put(HITS, brake(e["d"]), t0, 0.8, 0.1)
    elif k == "hiss":
        put(HITS, hiss(), t0, 0.7)
    elif k == "rumble":
        put(AMB, rumble(e["d"], v, e.get("f0", 38), e.get("f1", 38)), t0, 1.0)
    elif k == "clack_lock":
        put(
            HITS,
            cat(
                metal([1600, 2550, 3800], 0.35, 0.05) * 1.2,
                thump(55, 0.4) * 1.1,
                click(0.7),
            ),
            t0,
            1.0,
        )
        put(HITS, confirm(1), t0 + 0.05, 0.9)

# ---------- voz ----------
VOX = np.zeros(N)
for lid, t0 in TL["vo"].items():
    y, sr = sf.read(os.path.join(ROOT, "voices", lid + ".wav"))
    assert sr == SR
    y = flt(y, "high", 90)
    s = int(t0 * SR)
    e = min(N, s + len(y))
    VOX[s:e] += y[: e - s]
VOX = VOX / (np.abs(VOX).max() + 1e-9) * 0.7

# ---------- ducking segurado (sem bombear entre palavras) ----------
lvl = maximum_filter1d(np.abs(VOX), size=int(0.5 * SR))
lvl = uniform_filter1d(lvl, size=int(0.08 * SR))
on = np.clip(lvl / 0.05, 0, 1)


def duck(db):
    return (1 - on * (1 - 10 ** (-db / 20)))[:, None]


mus, msr = sf.read(os.path.join(ROOT, "music", "score.wav"))
mus = mus[:N]
if len(mus) < N:
    mus = np.vstack([mus, np.zeros((N - len(mus), 2))])
MIX = (
    mus * 0.62 * duck(15)
    + SOFT * 0.7 * duck(12)
    + HITS * 0.8 * duck(5)
    + AMB * 0.9 * duck(6)
)
MIX += np.stack([VOX, VOX], 1)
# silêncio digital: 50,0–50,5 s
for e in EV:
    if e["type"] == "silence":
        a, b = int(e["t"] * SR), int(e["to"] * SR)
        f = int(0.01 * SR)
        MIX[a - f : a] *= np.linspace(1, 0, f)[:, None]
        MIX[a:b] = 0
MIX = MIX / (np.abs(MIX).max() + 1e-9) * 0.89
sf.write(os.path.join(ROOT, "mix.wav"), MIX.astype(np.float32), SR)
print("mix.wav", round(N / SR, 2), "s")
