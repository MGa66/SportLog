"""SportLog-Piktogramme: einheitlicher Stil, 64x64.
Körper hell (Linien), bewegtes Gewicht/Griffe orange, Geräte grau.
Seitenansicht: Blick nach rechts. Gleiche Gliederlängen für alle Figuren."""
import math

# ---------- Proportionen ----------
L_TORSO, L_THIGH, L_SHIN, L_UA, L_FA = 17, 12.5, 12.5, 9.5, 9
HEAD_R, NECK = 4.4, 2.6


def P(p): return f'{p[0]:.1f},{p[1]:.1f}'
def pt(p, ang, l): return (p[0] + l * math.cos(math.radians(ang)), p[1] + l * math.sin(math.radians(ang)))
def add(p, d): return (p[0] + d[0], p[1] + d[1])
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def ik(a, t, l1, l2, bend=1):
    """Gelenk zwischen a und t (zwei Glieder). bend = +1/-1 wählt die Seite."""
    dx, dy = t[0] - a[0], t[1] - a[1]
    d = math.hypot(dx, dy)
    base = math.atan2(dy, dx)
    if d >= l1 + l2 - 0.05:
        return lerp(a, t, l1 / (l1 + l2))
    d = max(d, abs(l1 - l2) + 0.05)
    A = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    ang = base + bend * A
    return (a[0] + l1 * math.cos(ang), a[1] + l1 * math.sin(ang))


# ---------- Grundformen ----------
def line(*pts, c='b'): return f'<polyline points="{" ".join(P(p) for p in pts)}" class="{c}"/>'
def circ(p, r, c): return f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{r}" class="{c}"/>'
def rect(x, y, w, h, c='eqf', rx=2): return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" class="{c}"/>'
def rrect_on(a, b, w, c='w'):
    """Abgerundetes Polster entlang der Strecke a-b."""
    return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" class="{c}pad" style="stroke-width:{w}"/>'


def plate(p, r=7.5):  # Langhantel von der Seite
    return circ(p, r, 'w') + circ(p, round(r * 0.28, 1), 'hole')


def db_end(p, r=4.6):  # Kurzhantel, Stirnseite
    return circ(p, r, 'w') + circ(p, round(r * 0.3, 1), 'hole')


def db_h(p, half=7.5):  # Kurzhantel waagerecht
    x, y = p
    return (f'<line x1="{x-half:.1f}" y1="{y:.1f}" x2="{x+half:.1f}" y2="{y:.1f}" class="wl"/>'
            + rect(x - half - 3.5, y - 5.5, 5, 11, 'w', 1.6) + rect(x + half - 1.5, y - 5.5, 5, 11, 'w', 1.6))


def db_v(p, half=7.5):  # Kurzhantel senkrecht
    x, y = p
    return (f'<line x1="{x:.1f}" y1="{y-half:.1f}" x2="{x:.1f}" y2="{y+half:.1f}" class="wl"/>'
            + rect(x - 5.5, y - half - 3.5, 11, 5, 'w', 1.6) + rect(x - 5.5, y + half - 1.5, 11, 5, 'w', 1.6))


def pulley(p): return circ(p, 2.6, 'pul')
def cable(a, b): return line(a, b, c='cb')
def ring(p, r=3.2): return circ(p, r, 'wring')            # D-Griff
def knob(p, r=3): return circ(p, r, 'w')                  # Griff/Stange von der Seite


def arrow(a, b, head=4):
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    l = pt(b, math.degrees(ang) + 150, head)
    r = pt(b, math.degrees(ang) - 150, head)
    return line(a, b, c='ar') + line(l, b, r, c='ar')


def arc_arrow(c, r, a0, a1, both=False, head=4):
    s, e = pt(c, a0, r), pt(c, a1, r)
    large = 1 if abs(a1 - a0) > 180 else 0
    sweep = 1 if a1 > a0 else 0
    out = f'<path d="M{P(s)} A{r} {r} 0 {large} {sweep} {P(e)}" class="ar"/>'
    def tip(p, ang_deg):
        tang = ang_deg + (90 if sweep else -90)
        return line(pt(p, tang + 150, head), p, pt(p, tang - 150, head), c='ar')
    out += tip(e, a1)
    if both:
        out += line(pt(s, a0 + (-90 if sweep else 90) + 150, head), s, pt(s, a0 + (-90 if sweep else 90) - 150, head), c='ar')
    return out


FLOOR = '<line x1="5" y1="59.5" x2="59" y2="59.5" class="f"/>'


# ---------- Figur von der Seite ----------
class Fig:
    def __init__(self, hip, ta, *, head_da=0, hand=None, hbend=1, ua=None, fa=None,
                 ankle=None, kbend=-1, thigh=None, shin=None, foot=4.5, foot_ang=0, arm=True, legs=True):
        self.hip = hip
        self.sh = pt(hip, ta, L_TORSO)
        self.head = pt(self.sh, ta + head_da, NECK + HEAD_R)
        self.shp = pt(self.sh, ta + 180, 1.2)
        parts_l, parts_a = '', ''
        if legs:
            if ankle is not None:
                self.knee = ik(hip, ankle, L_THIGH, L_SHIN, kbend)
                self.ankle = ankle
            else:
                self.knee = pt(hip, thigh, L_THIGH)
                self.ankle = pt(self.knee, shin, L_SHIN)
            parts_l = line(hip, self.knee, self.ankle)
            if foot:
                parts_l += line(self.ankle, pt(self.ankle, foot_ang, foot), c='ft')
        if arm:
            if hand is not None:
                self.elbow = ik(self.shp, hand, L_UA, L_FA, hbend)
                self.hand = hand
            else:
                self.elbow = pt(self.shp, ua, L_UA)
                self.hand = pt(self.elbow, fa, L_FA)
            parts_a = line(self.shp, self.elbow, self.hand, c='ao') + line(self.shp, self.elbow, self.hand, c='a')
        self.legs_svg = parts_l
        self.body_svg = line(hip, self.sh) + circ(self.head, HEAD_R, 'h')
        self.arm_svg = parts_a

    @property
    def svg(self): return self.legs_svg + self.body_svg + self.arm_svg


def offset(a, b, d):
    """Strecke a-b um d senkrecht versetzt (positiv = rechts der Laufrichtung)."""
    ang = math.atan2(b[1] - a[1], b[0] - a[0]) + math.pi / 2
    dx, dy = d * math.cos(ang), d * math.sin(ang)
    return (a[0] + dx, a[1] + dy), (b[0] + dx, b[1] + dy)


# ---------- Figur von vorn ----------
class Front:
    def __init__(self, cx, hip_y, *, hands, hbend=(1, -1), seated=False, ankles=None, kbend=(1, -1),
                 elbows=None, sh_w=6.2, hip_w=3.2, arms=True, legpts=None):
        self.cx, self.hip_y = cx, hip_y
        sh_y = hip_y - L_TORSO
        self.sh_y = sh_y
        self.head = (cx, sh_y - NECK - HEAD_R)
        torso = (f'<path d="M{cx-sh_w-1.2:.1f} {sh_y:.1f} L{cx+sh_w+1.2:.1f} {sh_y:.1f} '
                 f'L{cx+hip_w+0.8:.1f} {hip_y:.1f} L{cx-hip_w-0.8:.1f} {hip_y:.1f} Z" class="tor"/>')
        legs = ''
        hips = [(cx - hip_w, hip_y), (cx + hip_w, hip_y)]
        if legpts is not None:
            for hp, (kn, an) in zip(hips, legpts):
                legs += line(hp, kn, an)
        elif seated:
            for s, hp in zip((-1, 1), hips):
                knee = (cx + s * 6.5, hip_y + 4)
                ank = (cx + s * 7, 56.5)
                legs += line(hp, knee, ank) + line(ank, (ank[0] + s * 3.5, ank[1]), c='ft')
        else:
            ankles = ankles or [(cx - 5, 56.5), (cx + 5, 56.5)]
            for s, hp, ank, kb in zip((-1, 1), hips, ankles, kbend):
                knee = ik(hp, ank, L_THIGH, L_SHIN, kb)
                legs += line(hp, knee, ank) + line(ank, (ank[0] + s * 3.5, ank[1]), c='ft')
        arm_svg = ''
        self.shoulders = [(cx - sh_w, sh_y + 1.2), (cx + sh_w, sh_y + 1.2)]
        self.elbows, self.hands = [], hands
        if arms:
            for i, (sp_, hd) in enumerate(zip(self.shoulders, hands)):
                el = elbows[i] if elbows else ik(sp_, hd, L_UA, L_FA, hbend[i])
                self.elbows.append(el)
                arm_svg += line(sp_, el, hd, c='ao') + line(sp_, el, hd, c='a')
        self.legs_svg, self.body_svg, self.arm_svg = legs, torso + circ(self.head, HEAD_R, 'h'), arm_svg

    @property
    def svg(self): return self.legs_svg + self.body_svg + self.arm_svg


def seat_front(cx, y, w=11): return line((cx - w, y), (cx + w, y), c='eq')
def back_front(cx, top, bottom, w=8): return rect(cx - w, top, 2 * w, bottom - top, 'eqf', 3)


# ---------- Nahaufnahme Oberkörper (Arme) ----------
def crop_arm(fa_ang, *, ua_ang=84, curl=True):
    """Kopf, Rumpf und Arm groß. Gibt (svg, hand, elbow) zurück."""
    head = (17.5, 9.5)
    sh = (22, 21.5)
    elbow = pt(sh, ua_ang, 15)
    hand = pt(elbow, fa_ang, 14)
    s = (circ(head, 6, 'h') + line((17.5, 17), (16.5, 66), c='bc')
         + line(sh, elbow, hand, c='aco') + line(sh, elbow, hand, c='ac') + circ(hand, 3.7, 'h'))
    return s, hand, elbow


# =====================================================================
ICONS = {}
def icon(key, name):
    def deco(fn):
        ICONS[key] = (name, fn())
        return fn
    return deco


# ---------------- Brust ----------------
@icon('bench', 'Bankdrücken')
def _():
    f = Fig((35, 40.5), 180, head_da=10, hand=(18.5, 21), ankle=(50, 56), kbend=1)
    bench = line((5, 45.2), (40, 45.2), c='eq') + line((9, 45), (9, 58), c='eqt') + line((36, 45), (36, 58), c='eqt')
    return bench + f.svg + plate((18.5, 16), 7.5)


def incline(weight):
    hip = (29, 43)
    f = Fig(hip, -125, head_da=5, hand=None, ua=-88, fa=-90, ankle=(48, 56), kbend=1)
    # Lehne parallel unter dem Rumpf
    a, b = offset(f.sh, hip, 4.6)
    back = line(pt(a, -125, 3), lerp(b, a, -0.12), c='eq')
    seat = line((b[0] - 1, b[1] + 1.5), (42, b[1] + 1.5), c='eq') + line((b[0] + 2, b[1] + 1.5), (b[0] + 2, 58), c='eqt') + line((40, b[1] + 1.5), (40, 58), c='eqt')
    hand = f.hand
    return back + seat, f, hand


@icon('incline_db', 'Schrägbankdrücken (Kurzhantel)')
def _():
    eq, f, hand = incline('db')
    return eq + f.svg + db_end((hand[0], hand[1] - 2.5), 4.8)


@icon('incline_smith', 'Schrägbankdrücken (geführt)')
def _():
    eq, f, hand = incline('bb')
    rail = line((hand[0], 2), (hand[0], 58), c='rail')
    return rail + eq + f.svg + plate((hand[0], hand[1] - 3.5), 6.8)


@icon('fly', 'Butterfly (Maschine)')
def _():
    cx = 32
    f = Front(cx, 43, hands=[(18, 15), (46, 15)], elbows=[(17.5, 26), (46.5, 26)], seated=True)
    pads = rrect_on((17.5, 13), (17.5, 29), 6) + rrect_on((46.5, 13), (46.5, 29), 6)
    arrows = arrow((6, 8), (14, 8)) + arrow((58, 8), (50, 8))
    return back_front(cx, 12, 45) + seat_front(cx, 45.5) + f.svg + pads + arrows


@icon('dips', 'Dips')
def _():
    cx = 32
    bars = line((16, 35), (16, 60), c='eqt') + line((48, 35), (48, 60), c='eqt') + circ((16, 35), 3, 'pul') + circ((48, 35), 3, 'pul')
    f = Front(cx, 33.5, hands=[(17, 32.5), (47, 32.5)], hbend=(1, -1),
              legpts=[((cx - 4.5, 45.5), (cx - 1.5, 54)), ((cx + 4.5, 45.5), (cx + 1.5, 54))])
    return bars + f.svg

@icon('pushup', 'Liegestütze')
def _():
    ankle = (9, 55.5)
    a = -23
    hip = pt(ankle, a, L_THIGH + L_SHIN)
    f = Fig(hip, a, head_da=-4, hand=None, ua=88, fa=90, ankle=ankle, kbend=1, foot=3.5, foot_ang=120)
    return FLOOR + f.svg


# ---------------- Rücken ----------------
@icon('deadlift', 'Kreuzheben')
def _():
    f = Fig((23, 34), -32, head_da=-8, hand=(37, 47), ankle=(34, 56.5), kbend=-1)
    return FLOOR + f.svg + plate((37, 51), 8)


@icon('pullup', 'Klimmzüge')
def _():
    cx = 32
    bar = line((5, 6), (59, 6), c='eq')
    f = Front(cx, 37, hands=[(19, 6), (45, 6)], hbend=(1, -1), ankles=[(30, 57), (34, 57)], kbend=(-1, 1))
    return bar + f.svg


@icon('pulldown', 'Latzug')
def _():
    cx = 32
    f = Front(cx, 43, hands=[(15, 12), (49, 12)], hbend=(1, -1), seated=True)
    bar = line((8, 16), (13, 12), (51, 12), (56, 16), c='wl')
    pad = rect(20, 41.5, 24, 4.5, 'eqf', 2.2)
    return cable((32, 12), (32, 1)) + seat_front(cx, 46) + f.svg + pad + bar


@icon('pulldown_close', 'Latzug (enger Griff)')
def _():
    f = Fig((21, 41), -98, head_da=-6, hand=(31, 11), hbend=-1, thigh=0, shin=88)
    seat = line((11, 45), (30, 45), c='eq') + line((20, 45), (20, 59), c='eqt')
    pad = rrect_on((28.5, 35.8), (36.5, 35.8), 4.5, 'eq')
    handle = line((27.5, 14), (31, 9), (34.5, 14), c='wl')
    return cable((31, 9), (31, 1)) + seat + f.svg + pad + handle


@icon('bb_row', 'Langhantelrudern')
def _():
    f = Fig((18, 35), -14, head_da=-14, hand=(34, 46), ankle=(29, 56.5), kbend=-1)
    return FLOOR + f.svg + plate((34, 47.5), 7) + arrow((47, 52), (47, 36))


@icon('pullover', 'Überzüge (Kabel)')
def _():
    f = Fig((25, 36), -80, head_da=-4, hand=None, ua=28, fa=30, ankle=(27, 56.5), kbend=-1)
    h = f.hand
    return (FLOOR + cable(h, (57, 5)) + pulley((57, 5)) + f.svg + knob(h, 3)
            + arc_arrow(f.shp, 25, -25, 45))


@icon('cable_row', 'Kabelrudern')
def _():
    seat = line((5, 47), (26, 47), c='eq') + line((15, 47), (15, 59), c='eqt')
    plate_ = line((44, 40), (44, 56), c='eq')
    f = Fig((16, 43.5), -92, hand=(25, 36), hbend=1, ankle=(41.5, 46), kbend=-1, foot=4, foot_ang=-90)
    handle = line((24, 33), (29, 36), (24, 39), c='wl')
    return FLOOR + seat + plate_ + cable((29, 36), (58, 44)) + pulley((58, 44)) + f.svg + handle


@icon('tbar_row', 'T-Bar-Rudern (Brustpolster)')
def _():
    hip = (18, 36)
    f = Fig(hip, -36, head_da=-10, hand=(33, 47), ankle=(23, 56.5), kbend=-1)
    a, b = offset(f.sh, hip, -4.8)
    pad = rrect_on(lerp(a, b, 0.05), lerp(a, b, 0.55), 5.5, 'eq')
    post = line(lerp(a, b, 0.4), (30, 59), c='eqt')
    lever = line((33, 47), (52, 49.5), c='eqt')
    return FLOOR + post + f.svg + pad + lever + line((28.5, 47), (37.5, 47), c='wl') + plate((52, 49.5), 6.5)


@icon('machine_row', 'Rudern (Maschine)')
def _():
    f = Fig((13, 43), -90, hand=(36, 30), hbend=1, ankle=(27, 56.5), kbend=-1)
    seat = line((5, 46.5), (22, 46.5), c='eq') + line((13, 46.5), (13, 59), c='eqt')
    pad = rect(20, 20, 5, 19, 'eqf', 2.5) + line((22.5, 39), (22.5, 50), c='eqt')
    handle = line((36.5, 25), (36.5, 35), c='wl')
    lever = line((36.5, 35), (44, 52), c='eqt') + circ((44, 52), 2.4, 'pul')
    return FLOOR + seat + f.svg + pad + lever + handle + arrow((54, 22), (44, 22))


# ---------------- Beine ----------------
@icon('squat', 'Kniebeugen')
def _():
    f = Fig((23, 40), -66, head_da=-10, arm=False, ankle=(36, 56.5), kbend=-1)
    return FLOOR + f.svg + plate((28.5, 23), 8)


@icon('legpress', 'Beinpresse (45°)')
def _():
    hip = (27, 47)
    f = Fig(hip, -152, head_da=8, hand=(31, 50), hbend=-1, ankle=(41, 31.5), kbend=-1, foot=0)
    a, b = offset(f.sh, hip, -4.8)
    back = line(lerp(a, b, -0.15), lerp(b, a, -0.12), c='eq')
    frame = line((26, 56), (37, 56), c='eqt') + line((31, 53.5), (31, 59), c='eqt')
    rail = line((36, 57), (62, 31), c='eqt')
    platform = line((38.5, 25), (49, 35.5), c='wl')
    plate_ = plate((52, 25), 5.5)
    return rail + back + frame + f.svg + platform + plate_ + FLOOR


@icon('hack', 'Hackenschmidt')
def _():
    hip = (30, 40)
    f = Fig(hip, -106, head_da=6, hand=(29, 23), hbend=1, ankle=(44, 54), kbend=-1, foot_ang=-8)
    a, b = offset(f.sh, hip, 4.8)
    rail = line(pt(b, 74, 14), pt(a, -106, 16), c='eqt')
    back = line(lerp(a, b, -0.2), lerp(b, a, -0.08), c='eq')
    platform = line((33, 59), (56, 54.5), c='eq')
    pad = rrect_on(pt(f.sh, 180 + 74, 1), pt(f.sh, 74 - 90, 5), 5.5)
    return rail + back + platform + f.svg + pad


@icon('legext', 'Beinstrecker (Maschine)')
def _():
    f = Fig((17, 40.5), -95, hand=(20, 44), hbend=-1, thigh=0, shin=28, foot=4, foot_ang=-62)
    seat = line((10, 44.5), (31, 44.5), c='eq') + rrect_on((9, 43), (6.5, 20), 4.5, 'eq') + line((22, 44.5), (22, 59), c='eqt')
    ank = f.ankle
    pad = circ(pt(ank, 118, 4.2), 3.8, 'w')
    return FLOOR + seat + f.svg + pad + arc_arrow(f.knee, 15, 34, -6)


@icon('legcurl', 'Beinbeuger (liegend)')
def _():
    bench = line((6, 41.5), (46, 41.5), c='eq') + line((10, 41.5), (10, 58), c='eqt') + line((42, 41.5), (42, 58), c='eqt')
    f = Fig((24, 37), 0, head_da=12, hand=(45, 45), hbend=-1, thigh=180, shin=-78, foot=4, foot_ang=-170)
    pad = circ(pt(f.ankle, 12, 4.4), 3.8, 'w')
    return FLOOR + bench + f.svg + pad + arc_arrow(f.knee, 17, -40, -95)


@icon('calf_seated', 'Wadenheben (sitzend)')
def _():
    f = Fig((14, 38.5), -90, hand=(25, 34), hbend=1, thigh=0, shin=86, foot=6.5, foot_ang=40)
    seat = line((6, 42), (24, 42), c='eq') + line((12, 42), (12, 59), c='eqt')
    block = rect(28, 53.5, 12, 6, 'eqf', 1.5)
    pad = rrect_on((20, 34), (30, 34), 5.5)
    return FLOOR + seat + block + f.svg + pad + arrow((44, 46), (44, 30))


@icon('calf_standing', 'Wadenheben (stehend)')
def _():
    hip, knee, ank = (27, 2), (27.8, 22), (28.5, 42)
    toe = pt(ank, 42, 9)
    calf = f'<ellipse cx="0" cy="0" rx="4.2" ry="8" class="h" transform="translate({knee[0]-3.2:.1f} {knee[1]+8.5:.1f}) rotate(-4)"/>'
    legs = calf + line((26.6, -4), hip, knee, ank, c='bc') + line(ank, toe, c='ftc')
    block = rect(31, 50, 24, 9.5, 'eqf', 2)
    return '<line x1="5" y1="60" x2="59" y2="60" class="f"/>' + block + legs + arrow((48, 42), (48, 24))

@icon('ohp_db', 'Schulterdrücken (Kurzhantel)')
def _():
    cx = 32
    f = Front(cx, 45, hands=[(18, 12), (46, 12)], hbend=(1, -1), seated=True)
    return back_front(cx, 14, 47) + seat_front(cx, 47.5) + f.svg + db_h((18, 10.5), 5.5) + db_h((46, 10.5), 5.5)


@icon('ohp_smith', 'Schulterdrücken (geführt)')
def _():
    cx = 32
    f = Front(cx, 45, hands=[(19, 13), (45, 13)], hbend=(1, -1), seated=True)
    rails = line((10, 2), (10, 60), c='rail') + line((54, 2), (54, 60), c='rail')
    bar = line((4, 13), (60, 13), c='wl') + rect(4, 6.5, 5, 13, 'w', 1.6) + rect(55, 6.5, 5, 13, 'w', 1.6)
    return rails + seat_front(cx, 47.5) + f.svg + bar


@icon('ohp_machine', 'Schulterdrücken (Maschine)')
def _():
    cx = 32
    f = Front(cx, 45, hands=[(18, 13), (46, 13)], hbend=(1, -1), seated=True)
    levers = line((18, 17), (8, 40), c='eqt') + line((46, 17), (56, 40), c='eqt') + circ((8, 40), 2.4, 'pul') + circ((56, 40), 2.4, 'pul')
    handles = line((18, 8.5), (18, 17.5), c='wl') + line((46, 8.5), (46, 17.5), c='wl')
    return back_front(cx, 14, 47) + seat_front(cx, 47.5) + levers + f.svg + handles + arrow((32, 8), (32, 1.5))


@icon('lateral_db', 'Seitheben (Kurzhantel)')
def _():
    cx = 32
    f = Front(cx, 31.5, hands=[(10, 15), (54, 15)], hbend=(-1, 1))
    return FLOOR + f.svg + db_end((9, 15), 4.2) + db_end((55, 15), 4.2) + arrow((9, 28), (9, 22)) + arrow((55, 28), (55, 22))


@icon('lateral_cable', 'Seitheben (Kabel)')
def _():
    cx = 30
    f = Front(cx, 31.5, hands=[(10, 13), (36.5, 32)], hbend=(-1, 1))
    return FLOOR + cable((10, 13), (54, 56)) + pulley((54, 56)) + f.svg + ring((10, 13), 3.2)


@icon('lateral_machine', 'Seitheben (Maschine)')
def _():
    cx = 32
    f = Front(cx, 45, hands=[(14.5, 34), (49.5, 34)], elbows=[(15, 26), (49, 26)], seated=True)
    pads = rrect_on((17, 23), (25, 24), 5.5) + rrect_on((47, 23), (39, 24), 5.5)
    return back_front(cx, 16, 47) + seat_front(cx, 47.5) + f.svg + pads + arrow((12, 18), (12, 10)) + arrow((52, 18), (52, 10))


@icon('facepull', 'Face Pulls')
def _():
    f = Fig((24, 33), -92, head_da=0, hand=(40, 13), hbend=-1, ankle=(23, 56.5), kbend=-1)
    rope = line((44, 13), (40, 10), c='wl') + line((44, 13), (40, 16), c='wl')
    return FLOOR + cable((44, 13), (58, 13)) + pulley((58, 13)) + f.svg + rope + arrow((48, 5), (36, 5))


@icon('reverse_fly', 'Reverse Butterfly')
def _():
    cx = 32
    f = Front(cx, 45, hands=[(11, 26), (53, 26)], hbend=(1, -1), seated=True)
    handles = line((11, 21), (11, 31), c='wl') + line((53, 21), (53, 31), c='wl')
    return back_front(cx, 18, 47) + seat_front(cx, 47.5) + f.svg + handles + arrow((14, 15), (5, 15)) + arrow((50, 15), (59, 15))


# ---------------- Arme ----------------
@icon('curl', 'Bizepscurls (Kurzhantel)')
def _():
    s, hand, _ = crop_arm(-38)
    return s + db_h(hand, 6)


@icon('curl_sz', 'Bizepscurls (SZ-Stange)')
def _():
    s, hand, _ = crop_arm(-38)
    x, y = hand
    bar = line((x - 10, y), (x - 5, y), (x - 2.5, y - 3), (x + 2.5, y + 3), (x + 5, y), (x + 10, y), c='wl')
    plates = rect(x - 14.5, y - 6.5, 5, 13, 'w', 1.6) + rect(x + 9.5, y - 6.5, 5, 13, 'w', 1.6)
    return s + bar + plates


@icon('hammer', 'Hammercurls')
def _():
    s, hand, _ = crop_arm(-38)
    return s + db_v(hand, 6)


@icon('curl_overhand', 'Obergriff-Curls (Kabel)')
def _():
    s, hand, _ = crop_arm(-30)
    x, y = hand
    bar = line((x - 7, y + 3.2), (x + 7, y + 3.2), c='wl')
    return cable((x, y + 3.2), (x + 6, 61)) + pulley((x + 6, 60.5)) + s + bar


@icon('curl_bentover', 'Bizepscurls (vorgebeugt)')
def _():
    f = Fig((20, 33), -36, head_da=-12, hand=None, ua=92, fa=-4, ankle=(26, 56.5), kbend=-1)
    return FLOOR + f.svg + db_h(f.hand, 5.5)


def push(handle):
    s, hand, elbow = crop_arm(48, ua_ang=88)
    x, y = hand
    top = (x, 1)
    if handle == 'rope':
        h = line((x, y - 4.5), (x - 3.5, y + 3.5), c='wl') + line((x, y - 4.5), (x + 3.5, y + 3.5), c='wl')
        cab = cable((x, y - 4.5), top)
    elif handle == 'bar':
        h = line((x - 7.5, y), (x + 7.5, y), c='wl')
        cab = cable((x, y), top)
    else:
        h = ring((x, y - 1), 3.6)
        cab = cable((x, y - 4.6), top)
    return cab + pulley(top) + s + h + arrow((52, 34), (52, 50))


@icon('tri_rope', 'Trizepsdrücken (Seil)')
def _(): return push('rope')


@icon('tri_bar', 'Trizepsdrücken (Stange)')
def _(): return push('bar')


@icon('tri_single', 'Trizepsdrücken (einarmig)')
def _(): return push('ring')


@icon('frenchpress', 'French Press (liegend)')
def _():
    f = Fig((35, 40.5), 180, head_da=10, hand=None, ua=-97, fa=-172, ankle=(50, 56), kbend=1)
    bench = line((5, 45.2), (40, 45.2), c='eq') + line((9, 45), (9, 58), c='eqt') + line((36, 45), (36, 58), c='eqt')
    return bench + f.svg + plate(pt(f.hand, -90, 1.5), 5.5) + arc_arrow(f.elbow, 12.5, -160, -112)


# ---------------- Bauch ----------------
@icon('toes2bar', "Toes to Bar")
def _():
    bar = line((14, 6.5), (50, 6.5), c='eq')
    f = Fig((27, 41), -101, head_da=0, hand=(32, 7.5), hbend=-1, thigh=-52, shin=-52, foot=3.5, foot_ang=-120)
    return bar + f.svg + arrow((52, 24), (46, 13))

@icon('abmachine', 'Bauchmaschine')
def _():
    f = Fig((16, 42), -56, head_da=30, hand=None, ua=60, fa=-20, ankle=(30, 56.5), kbend=-1)
    seat = line((7, 45.5), (25, 45.5), c='eq') + line((14, 45.5), (14, 59), c='eqt')
    padc = pt(f.sh, 34, 4.5)
    pad = rrect_on(pt(padc, -56, 4), pt(padc, 124, 4), 6)
    lever = line(padc, (37, 8), c='eqt') + circ((37, 8), 2.4, 'pul')
    return FLOOR + seat + lever + f.svg + pad + arc_arrow((16, 42), 33, -62, -22)

@icon('wipers', 'Scheibenwischer')
def _():
    cx = 30
    bar = line((5, 6), (59, 6), c='eq')
    f = Front(cx, 38, hands=[(21, 6), (39, 6)], hbend=(1, -1), arms=True, ankles=[(29, 40), (31, 40)])
    legs = line((cx - 1.5, 38), (50, 24.5), c='b') + line((cx + 2, 40.5), (52.5, 28.5), c='b')
    ghost = line((cx + 1.5, 38), (10, 24.5), c='gh') + line((cx - 2, 40.5), (7.5, 28.5), c='gh')
    return bar + ghost + f.body_svg + f.arm_svg + legs + arc_arrow((cx, 30), 25, 155, 25, both=True)


CSS = '''
.b{fill:none;stroke:var(--body);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.a{fill:none;stroke:var(--body);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.ft{fill:none;stroke:var(--body);stroke-width:3.6;stroke-linecap:round}
.h{fill:var(--body)}
.tor{fill:var(--body);stroke:var(--body);stroke-width:2.5;stroke-linejoin:round}
.gh{fill:none;stroke:var(--body);stroke-width:5;stroke-linecap:round;opacity:.22}
.bc{fill:none;stroke:var(--body);stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.ac{fill:none;stroke:var(--body);stroke-width:5.6;stroke-linecap:round;stroke-linejoin:round}
.ftc{fill:none;stroke:var(--body);stroke-width:5;stroke-linecap:round}
.w{fill:var(--str);stroke:var(--ring);stroke-width:2.2}
.wpad{stroke:var(--str);stroke-linecap:round}
.eqpad{stroke:var(--eq);stroke-linecap:round}
.hole{fill:var(--ring)}
.wl{fill:none;stroke:var(--str);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.wring{fill:none;stroke:var(--str);stroke-width:2.6}
.eq{fill:none;stroke:var(--eq);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.eqt{fill:none;stroke:var(--eq);stroke-width:2.4;stroke-linecap:round}
.eqf{fill:var(--eq)}
.rail{stroke:var(--eq);stroke-width:2;stroke-linecap:round;opacity:.8}
.ao,.aco{fill:none;stroke:var(--ring);stroke-linecap:round;stroke-linejoin:round}
.ao{stroke-width:6.6}.aco{stroke-width:8.8}
.cb{fill:none;stroke:var(--eq);stroke-width:1.7}
.pul{fill:var(--eq)}
.f{stroke:var(--line);stroke-width:2;stroke-linecap:round}
.ar{fill:none;stroke:var(--str);stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
'''

if __name__ == '__main__':
    import json, sys
    svg = lambda body: f'<svg viewBox="0 0 64 64" aria-hidden="true">{body}</svg>'
    cards = ''.join(f'''<figure><div class="big">{svg(v)}</div><div class="row"><span class="badge">{svg(v)}</span><b>{n}</b></div></figure>'''
                    for k, (n, v) in ICONS.items())
    open(sys.argv[1] if len(sys.argv) > 1 else 'review.html', 'w').write(f'''<!doctype html><meta charset="utf-8"><style>
:root{{--bg:#0d0f12;--s1:#16191e;--line:#2a2f38;--tx:#eef1f5;--eq:#68717f;--str:#ff9150;--body:#eef1f5;--ring:#16191e}}
body{{margin:0;background:var(--bg);color:var(--tx);font:13px system-ui,sans-serif;padding:16px}}
.grid{{display:grid;grid-template-columns:repeat(6,170px);gap:10px}}
figure{{margin:0;background:var(--s1);border:1px solid var(--line);border-radius:14px;padding:10px}}
.big svg{{width:148px;height:148px;display:block;background:#1b1f25;border-radius:10px}}
.row{{display:flex;gap:8px;align-items:center;margin-top:8px}} .row b{{font-size:12px;line-height:1.2}}
.badge{{width:42px;height:42px;border-radius:13px;background:#2b211c;display:grid;place-items:center;flex:none;--ring:#2b211c}}
.badge svg{{width:36px;height:36px}}
{CSS}</style><div class="grid">{cards}</div>''')
    json.dump({k: v for k, (n, v) in ICONS.items()}, open('icons.json', 'w'))
    print(len(ICONS), 'icons')
