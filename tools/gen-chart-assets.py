#!/usr/bin/env python3
"""Procedural textures for the chart-table look (numpy + PIL). Run: python3 tools/gen-chart-assets.py
Outputs img/chart/{table,chart,paper,leather}.webp. All noise is FFT-filtered white noise, so tiles wrap."""
import numpy as np, os
from PIL import Image, ImageFilter
rng=np.random.default_rng(7)
OUT=os.path.join(os.path.dirname(__file__),'..','img','chart');os.makedirs(OUT,exist_ok=True)
def noise(w,h,beta=2.0,sx=1.0,sy=1.0,seed=None):
    r=np.random.default_rng(seed) if seed is not None else rng
    f=np.fft.fft2(r.standard_normal((h,w)))
    fy=np.fft.fftfreq(h)[:,None]*sy;fx=np.fft.fftfreq(w)[None,:]*sx
    k=np.sqrt(fx**2+fy**2);k[0,0]=1
    f=f/(k**(beta/2));f[0,0]=0
    n=np.real(np.fft.ifft2(f));n=(n-n.mean())/(n.std()+1e-9);return n
def norm(n):return np.clip(n*0.25+0.5,0,1)
def save(a,name,q=80):
    a=np.clip(a,0,255).astype(np.uint8);Image.fromarray(a).save(os.path.join(OUT,name),'WEBP',quality=q,method=6)
    print(name,a.shape,os.path.getsize(os.path.join(OUT,name))//1024,'KB')
def mix(c1,c2,t):return np.array(c1)[None,None,:]*(1-t[...,None])+np.array(c2)[None,None,:]*t[...,None]
# ---- table: walnut planks ----
def table(W=520,H=1130):
    base=norm(noise(W,H,2.2,1.0,1.0))            # mottling
    grain=norm(noise(W,H,1.6,3.0,0.05))          # long vertical-ish streaks (fy small => stretched along y)
    fine=norm(noise(W,H,1.2,6.0,0.1))
    t=0.2*base+0.55*grain+0.25*fine
    t=np.clip((t-0.25)*1.8,0,1);img=mix((26,14,7),(104,62,32),t)
    ph=H//7
    for i in range(7):
        img[i*ph:(i+1)*ph,:,:]*=(0.8+0.3*rng.random())
        if i:img[i*ph-1:i*ph+1,:,:]*=0.3
    # leather patch bottom-left & lower right corner
    return img
# ---- leather ----
def leather(S=256):
    a=norm(noise(S,S,1.4,1.0,1.0));b=norm(noise(S,S,0.8,1.0,1.0))
    pebble=(a*0.5+b*0.5)
    # pebble relief via thresholded high freq
    img=mix((26,14,9),(66,38,22),pebble)
    return img
# ---- paper (cards/panels) ----
def paper(S=256):
    a=norm(noise(S,S,2.0));b=norm(noise(S,S,1.0));fib=norm(noise(S,S,1.5,4.0,0.2))
    t=0.5*a+0.3*b+0.2*fib
    return mix((244,228,190),(222,196,144),t)
# ---- chart (parchment map) ----
def voronoi_edges(W,H,n,seed,wrap=False):
    r=np.random.default_rng(seed);pts=r.random((n,2))*[W,H]
    ys,xs=np.mgrid[0:H,0:W].astype(np.float32)
    d1=np.full((H,W),1e9,np.float32);d2=np.full((H,W),1e9,np.float32)
    for px,py in pts:
        d=np.sqrt((xs-px)**2+(ys-py)**2)
        m=d<d1;d2=np.where(m,d1,np.minimum(d2,d));d1=np.where(m,d,d1)
    return d2-d1
def chart(W=560,H=860):
    mott=norm(noise(W,H,2.4));stain=norm(noise(W,H,3.0));fine=norm(noise(W,H,1.2))
    t=0.45*mott+0.3*stain+0.25*fine
    img=mix((236,214,164),(190,150,92),np.clip(t*1.1,0,1))
    # sea washes: faded teal in big blobs
    sea=noise(W,H,3.2,0.8,0.8);seaA=np.clip((sea-0.1)*1.6,0,1)
    img=img*(1-seaA[...,None]*0.38)+np.array([112,150,150])[None,None,:]*(seaA[...,None]*0.38)
    # land: threshold noise -> sand tint + ink coast
    land=noise(W,H,3.6,1.4,1.4);lm=land>0.75
    from PIL import ImageFilter as F
    lmask=Image.fromarray((np.clip((land-0.65)*6,0,1)*255).astype(np.uint8)).filter(F.GaussianBlur(1.2));la=np.asarray(lmask)/255.
    img=img*(1-la[...,None]*0.5)+np.array([226,196,134])[None,None,:]*(la[...,None]*0.5)
    # coast ink: band where land crosses 0.75
    coast=np.exp(-((land-0.75)/0.07)**2)
    img=img*(1-coast[...,None]*0.55)+np.array([70,44,22])[None,None,:]*(coast[...,None]*0.55)
    # shallow water contour lines
    cont=np.exp(-((land-0.45)/0.03)**2)
    img=img*(1-cont[...,None]*0.18)+np.array([90,110,100])[None,None,:]*(cont[...,None]*0.18)
    # cracks
    e=voronoi_edges(W,H,190,3);crack=np.clip(1-e/1.5,0,1)*(norm(noise(W,H,1.8,seed=11))>0.5)
    img=img*(1-crack[...,None]*0.3)+np.array([60,38,18])[None,None,:]*(crack[...,None]*0.3)
    e2=voronoi_edges(W,H,40,5);crack2=np.clip(1-e2/2.0,0,1)
    img=img*(1-crack2[...,None]*0.0)
    # fold lines
    for fx in (W//2,):img[:,fx-1:fx+1,:]*=0.9
    img[H//2-1:H//2+1,:,:]*=0.9
    # edge burn
    yy,xx=np.mgrid[0:H,0:W];dx=np.minimum(xx,W-1-xx)/W;dy=np.minimum(yy,H-1-yy)/H;ed=np.minimum(dx,dy)
    burn=np.clip(1-ed/0.11,0,1)**2*(0.5+0.5*norm(noise(W,H,2.0)))
    img=img*(1-burn[...,None]*0.65)+np.array([46,26,10])[None,None,:]*(burn[...,None]*0.65)
    # grain
    img+= (rng.standard_normal((H,W))*3)[...,None]
    return img
save(table(),'table.webp',74);save(leather(),'leather.webp',80);save(paper(),'paper.webp',80);save(chart(),'chart.webp',78)
