import sys,time,glob
from PIL import Image
d=sys.argv[1];names=sys.argv[3:]
ims=[]
for n in names:
    f=glob.glob(f'{d}/{n}.png')
    if f:ims.append(Image.open(f[0]))
w=ims[0].width;h=ims[0].height
W=Image.new('RGB',((w+8)*len(ims)-8,h),'black')
for i,im in enumerate(ims):W.paste(im,(i*(w+8),0))
o=sys.argv[2]+str(int(time.time()*1000))+'.png';W.save(o);print(o)
