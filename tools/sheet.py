import sys
from PIL import Image
names=sys.argv[2:];ims=[Image.open('/tmp/s-%s.png'%n).resize((390,844)) for n in names]
W=Image.new('RGB',(390*len(ims)+10*(len(ims)-1),844),'black')
for i,im in enumerate(ims):W.paste(im,(i*400,0))
W.save(sys.argv[1])
