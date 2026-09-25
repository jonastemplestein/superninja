import sys, glob, math
from PIL import Image, ImageDraw
pat, out, cell = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv)>3 else 256
files = sorted(glob.glob(pat))
cols = min(8, len(files)); rows = math.ceil(len(files)/cols)
sheet = Image.new("RGB", (cols*cell, rows*(cell+18)), (235,235,235))
d = ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im = Image.open(f).convert("RGBA"); im.thumbnail((cell,cell))
    x,y = (i%cols)*cell, (i//cols)*(cell+18)
    bg = Image.new("RGBA", im.size, (235,235,235,255)); bg.alpha_composite(im)
    sheet.paste(bg.convert("RGB"), (x+(cell-im.width)//2, y+(cell-im.height)//2))
    d.text((x+4, y+cell+2), f.split("/")[-1][:34], fill=(0,0,0))
sheet.save(out); print(out, len(files))
