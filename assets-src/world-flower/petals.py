# World Flower reference diagrams: the 44 chart petals (src/content/flower.ts CHART_PETALS) as teardrops
# (round outer end, point at the golden heart), vowels on the inner ring and consonants on the outer ring,
# each ring sorted by hue so the flower reads as a rainbow. Used as colour/structure refs for image generation.
# Usage: python3 assets-src/world-flower/petals.py
import re, colorsys, math
from PIL import Image, ImageDraw, ImageFilter
src = open("src/content/flower.ts").read()
chart = re.findall(r'\{ p: "(\w+)",.*?colour: "(#[0-9a-f]{6})"', src)
# the chart's /or/ petal is ink-dark (#2b1d14); in paintings it reads as a hole, so art refs use deep bronze
ART = "--art" in __import__("sys").argv
if ART: chart = [(p, "#7a4a24" if c == "#2b1d14" else c) for p, c in chart]
VOWELS = {"ae","ee","oy","ie","oe","uu","er","ar","ou","oo","ue","or","air","e","u","o","i","eer","a","schwa"}
def hue(c):
    r,g,b = (int(c[i:i+2],16)/255 for i in (1,3,5)); h,s,v = colorsys.rgb_to_hsv(r,g,b)
    return h if s > .25 and v > .25 else 2  # greys/browns last
inner = sorted([c for c in chart if c[0] in VOWELS], key=lambda c: hue(c[1]))
outer = sorted([c for c in chart if c[0] not in VOWELS], key=lambda c: hue(c[1]))
print(len(chart), len(inner), len(outer))
print("inner", [p for p,_ in inner]); print("outer", [p for p,_ in outer])

def teardrop(w, h, n=60):
    # point at y=+h/2 (towards the heart), round end at the top
    r = w/2; cy = -h/2 + r; pts = []
    for i in range(n+1):  # round top arc from left to right
        a = math.pi + math.pi*i/n; pts.append((r*math.cos(a), cy + r*math.sin(a)))
    def bez(p0,p1,p2,p3,t): return tuple((1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d for a,b,c,d in zip(p0,p1,p2,p3))
    for i in range(1,n+1): pts.append(bez((r,cy),(r,h*.06),(w*.12,h*.28),(0,h/2),i/n))
    for i in range(1,n+1): pts.append(bez((0,h/2),(-w*.12,h*.28),(-r,h*.06),(-r,cy),i/n))
    return pts

def draw(size, lit, out, bg=(247,238,221)):
    S = size*2; im = Image.new("RGB", (S,S), bg); d = ImageDraw.Draw(im); c = S/2
    glow = Image.new("RGB", (S,S), bg); gd = ImageDraw.Draw(glow)
    gd.ellipse([c-S*.42,c-S*.42,c+S*.42,c+S*.42], fill=(255,226,150)); glow = glow.filter(ImageFilter.GaussianBlur(S*.06))
    im = Image.blend(im, glow, .8 if lit else .0); d = ImageDraw.Draw(im)
    for ring, r0, L, W, off in ((outer, .30, .19, .085, 360/48), (inner, .12, .17, .075, 0)):
        for i,(p,col) in enumerate(ring):
            a = math.radians(i*360/len(ring) + off)
            on = lit(p) if callable(lit) else lit
            pts = teardrop(W*S, L*S)
            # rotate so the point faces the centre: petal sits at radius r0+L/2 along angle a
            R = (r0 + L/2)*S; out_pts = []
            for x,y in pts:
                # local: round end at -y (outwards), point at +y (inwards). Map local -y to direction a.
                ux, uy = math.sin(a), -math.cos(a)    # outward unit (a=0 -> up)
                vx, vy = math.cos(a), math.sin(a)     # perpendicular
                out_pts.append((c + ux*(R - y) + vx*x, c + uy*(R - y) + vy*x))
            fill = col if on else "#8f8a86"
            d.polygon(out_pts, fill=fill, outline="#2b1d14", width=max(3, S//260))
    hr = S*.105
    d.ellipse([c-hr,c-hr,c+hr,c+hr], fill="#ffc53d" if lit else "#9b8f7a", outline="#2b1d14", width=max(4,S//200))
    im.resize((size,size), Image.LANCZOS).save(out)
    print("wrote", out)

suffix = "_art" if ART else ""
draw(1024, True, f"assets-src/world-flower/ref_petal_wheel{suffix}.png")
draw(1024, False, f"assets-src/world-flower/ref_petal_wheel_dark{suffix}.png")
few = {"a","s","t","m","i","p","n","ee","sh"}
draw(1024, lambda p: p in few, f"assets-src/world-flower/ref_petal_wheel_partial{suffix}.png")
