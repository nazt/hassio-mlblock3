const code = `
from Maix import GPIO, I2S,  FFT
import image, lcd, math ,sensor
from fpioa_manager import fm
import KPU as kpu
import time
from machine import Timer
from Maix import GPIO
from fpioa_manager import fm
from board import board_info

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_windowing((192,192))
sensor.skip_frames(time = 2000)
fm.register(board_info.BOOT_KEY, fm.fpioa.GPIO3, force=True)

key_input = GPIO(GPIO.GPIO3, GPIO.IN)

sample_rate = 5000
sample_points = 1024
fft_points = 512
hist_x_num = 128

fm.register(13,fm.fpioa.I2S0_IN_D0)
fm.register(14,fm.fpioa.I2S0_WS)
fm.register(15,fm.fpioa.I2S0_SCLK)

rx = I2S(I2S.DEVICE_0)
rx.channel_config(rx.CHANNEL_0, rx.RECEIVER, align_mode = I2S.STANDARD_MODE)
rx.set_sample_rate(sample_rate)
img = image.Image(size=(128,128))
#img=img.to_grayscale()
imgc = img
max_index_b = 0
max_index_b_b = 0
def on_timer(timer):
    global imgc
    global max_index_b
    global max_index_b_b
    tong1 = time.ticks()
    imgc = img.to_rainbow(1)
    lcd.display(imgc)
    imgxc = sensor.snapshot()
    imgc = imgc.resize(192,192)
    imgxc.draw_image(imgc, 0,0)
    del imgc

tim = Timer(Timer.TIMER0, Timer.CHANNEL0, mode=Timer.MODE_PERIODIC, period=300, unit=Timer.UNIT_MS, callback=on_timer, arg=on_timer, start=False, priority=1, div=0)


lcd.init()
lcd.rotation(2)
time.sleep(5)
#tim.start()
img = image.Image(size=(128,128))
conr =0
coooo =0
def hsv_to_rgb(h, s, v):
    if s == 0.0:
        return int(v), int(v), int(v)
    i = int(h*6.0) # XXX assume int() truncates!
    f = (h*6.0) - i
    p = v*(1.0 - s)
    q = v*(1.0 - s*f)
    t = v*(1.0 - s*(1.0-f))
    i = i%6
    if i == 0:
        return int(v), int(t), int(p)
    if i == 1:
        return int(q), int(v), int(p)
    if i == 2:
        return int(p), int(v), int(t)
    if i == 3:
        return int(p), int(q), int(v)
    if i == 4:
        return int(t), int(p), int(v)
    if i == 5:
        return int(v), int(p), int(q)
while True:
    audio = rx.record(sample_points)
    fft_res = FFT.run(audio.to_bytes(),fft_points)
    fft_amp = FFT.amplitude(fft_res)
    #img_tmp = img.cut(0,0,128,127)
    #img.draw_image(img_tmp, 0,1)
    #img.draw_image(img_tmp, 0,2)
    #img.draw_image(img_tmp, 0,3)
    print(b'\x4e\x61' + ",".join(map(str, fft_amp)))
    for i in range(0,fft_points):
         c = fft_amp[i]*5;
         ttt = hsv_to_rgb(int(c),255,int(c))
        #  print(ttt)
         progressPercent = i / fft_points;
         y = progressPercent * 128;
         a = img.draw_rectangle(0,128-int(y),1,1,ttt,1,True)
         #print(c,y)
        #ctx.rect(ctx.width - speed, ctx.height - y, speed, ctx.height / spectrum.length);
    img_tmp = img.cut(0,0,127,128)
    #img_tmp.copy(img, 0, 0, 128, 128, -1, 0, 128, 128);
    img.draw_image(img_tmp, 1,0)
    lcd.display(img)
    #img = img.draw_rectangle((x_shift, 240-hist_height , hist_width, hist_height),[255,255,255],2,True)
    #copy(cnv, 0, 0, width, height, -1, 0, width, height);
    coooo = 0

    #for i in range(hist_x_num):
        #img[i] = fft_amp[i]*5

    del img_tmp
    fft_amp.clear()
    time.sleep(0.016)
`;
const code_camera = `
import sensor, image, time, lcd
lcd.init(type=2)
sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)
while(True):
    img = sensor.snapshot()
    lcd.display(img)
`;

const codev1 = `
from Maix import GPIO, I2S,  FFT
import image, lcd, math ,sensor
from fpioa_manager import fm
import KPU as kpu
import time
from machine import Timer
from Maix import GPIO
from fpioa_manager import fm
from board import board_info

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_windowing((192,192))
sensor.skip_frames(time = 2000)
fm.register(board_info.BOOT_KEY, fm.fpioa.GPIO3, force=True)

key_input = GPIO(GPIO.GPIO3, GPIO.IN)

sample_rate = 5000
sample_points = 1024
fft_points = 512
hist_x_num = 128

fm.register(13,fm.fpioa.I2S0_IN_D0)
fm.register(14,fm.fpioa.I2S0_WS)
fm.register(15,fm.fpioa.I2S0_SCLK)

rx = I2S(I2S.DEVICE_0)
rx.channel_config(rx.CHANNEL_0, rx.RECEIVER, align_mode = I2S.STANDARD_MODE)
rx.set_sample_rate(sample_rate)
img = image.Image(size=(128,128))
#img=img.to_grayscale()
imgc = img
max_index_b = 0
max_index_b_b = 0
def on_timer(timer):
    global imgc
    global max_index_b
    global max_index_b_b
    tong1 = time.ticks()
    imgc = img.to_rainbow(1)
    lcd.display(imgc)
    imgxc = sensor.snapshot()
    imgc = imgc.resize(192,192)
    imgxc.draw_image(imgc, 0,0)
    del imgc

tim = Timer(Timer.TIMER0, Timer.CHANNEL0, mode=Timer.MODE_PERIODIC, period=300, unit=Timer.UNIT_MS, callback=on_timer, arg=on_timer, start=False, priority=1, div=0)


lcd.init()
lcd.rotation(2)
#time.sleep(5)
#tim.start()
img = image.Image(size=(128,128))
conr =0
coooo =0
def hsv_to_rgb(h, s, v):
    if s == 0.0:
        return int(v), int(v), int(v)
    i = int(h*6.0) # XXX assume int() truncates!
    f = (h*6.0) - i
    p = v*(1.0 - s)
    q = v*(1.0 - s*f)
    t = v*(1.0 - s*(1.0-f))
    i = i%6
    if i == 0:
        return int(v), int(t), int(p)
    if i == 1:
        return int(q), int(v), int(p)
    if i == 2:
        return int(p), int(v), int(t)
    if i == 3:
        return int(p), int(q), int(v)
    if i == 4:
        return int(t), int(p), int(v)
    if i == 5:
        return int(v), int(p), int(q)
while True:
    audio = rx.record(sample_points)
    fft_res = FFT.run(audio.to_bytes(),fft_points)
    fft_amp = FFT.amplitude(fft_res)
    #img_tmp = img.cut(0,0,128,127)
    #img.draw_image(img_tmp, 0,1)
    #img.draw_image(img_tmp, 0,2)
    #img.draw_image(img_tmp, 0,3)
    print(",".join(map(str, fft_amp)))
    for i in range(0,fft_points):
         c = fft_amp[i]*5;
         ttt = hsv_to_rgb(int(c),255,int(c))
        #  print(ttt)
         progressPercent = i / fft_points;
         y = progressPercent * 128;
         a = img.draw_rectangle(0,128-int(y),1,1,ttt,1,True)
         #print(c,y)
        #ctx.rect(ctx.width - speed, ctx.height - y, speed, ctx.height / spectrum.length);
    img_tmp = img.cut(0,0,127,128)
    #img_tmp.copy(img, 0, 0, 128, 128, -1, 0, 128, 128);
    img.draw_image(img_tmp, 1,0)
    lcd.display(img)
    #img = img.draw_rectangle((x_shift, 240-hist_height , hist_width, hist_height),[255,255,255],2,True)
    #copy(cnv, 0, 0, width, height, -1, 0, width, height);
    coooo = 0

    #for i in range(hist_x_num):
        #img[i] = fft_amp[i]*5

    del img_tmp
    fft_amp.clear()
    time.sleep(0.016)
`;

const codev3 = `

from Maix import GPIO, I2S,  FFT
import image, lcd, math ,sensor
from fpioa_manager import fm
import KPU as kpu
import time
from machine import Timer
from Maix import GPIO
from fpioa_manager import fm
from board import board_info
import ulab as np
from machine import UART
repl = UART.repl_uart()

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.set_windowing((192,192))
sensor.skip_frames(time = 2000)

img = image.Image(size=(128,128))
sample_rate = 5000
sample_points = 1024
fft_points = 512
hist_x_num = 128

fm.register(13,fm.fpioa.I2S0_IN_D0)
fm.register(14,fm.fpioa.I2S0_WS)
fm.register(15,fm.fpioa.I2S0_SCLK)

rx = I2S(I2S.DEVICE_0)
rx.channel_config(rx.CHANNEL_0, rx.RECEIVER, align_mode = I2S.STANDARD_MODE)
rx.set_sample_rate(sample_rate)

imgc = img
max_index_b = 0
max_index_b_b = 0
def on_timer(timer):
    global imgc
    global max_index_b
    global max_index_b_b
    tong1 = time.ticks()
    imgc = img.to_rainbow(1)
    lcd.display(imgc)
    imgxc = sensor.snapshot()
    imgc = imgc.resize(192,192)
    imgxc.draw_image(imgc, 0,0)
    del imgc

def hsv_to_rgb(h, s, v):
    if s == 0.0:
        return int(v), int(v), int(v)
    i = int(h*6.0) # XXX assume int() truncates!
    f = (h*6.0) - i
    p = v*(1.0 - s)
    q = v*(1.0 - s*f)
    t = v*(1.0 - s*(1.0-f))
    i = i%6
    if i == 0:
        return int(v), int(t), int(p)
    if i == 1:
        return int(q), int(v), int(p)
    if i == 2:
        return int(p), int(v), int(t)
    if i == 3:
        return int(p), int(q), int(v)
    if i == 4:
        return int(t), int(p), int(v)
    if i == 5:
        return int(v), int(p), int(q)


tim = Timer(Timer.TIMER0, Timer.CHANNEL0, mode=Timer.MODE_PERIODIC, period=300, unit=Timer.UNIT_MS, callback=on_timer, arg=on_timer, start=False, priority=1, div=0)

lcd.init()
lcd.rotation(2)

#tim.start()

data_b = 0
h_hoe = 10000
codex_b= 0
fft_amp_b = None
#print("Hello")
while True:
    audio = rx.record(sample_points)
    fft_res = FFT.run(audio.to_bytes(),fft_points)
    fft_amp = FFT.amplitude(fft_res)
    codex = np.array(fft_amp)
    data = np.sum(codex * codex, axis=1)
    # if data < h_hoe and data_b > h_hoe :
    data_b  = data
    codex_b = codex
    fft_amp_b = bytearray(fft_amp)
    repl.write(b'Vx'+fft_amp_b)
    #lcd.display(img)
    #for i in range(0,fft_points):
         #c = fft_amp[i]*5;
         #ttt = hsv_to_rgb(int(c),255,int(c))
         #progressPercent = i / fft_points;
         #y = progressPercent * 128;
         #a = img.draw_rectangle(0,128-int(y),1,1,ttt,1,True)


    for i in range(0,fft_points):
         c = fft_amp[i]*5;
         ttt = hsv_to_rgb(int(c),255,int(c))
        #  print(ttt)
         progressPercent = i / fft_points;
         y = progressPercent * 128;
         a = img.draw_rectangle(0,128-int(y),1,1,ttt,1,True)
         #print(c,y)
        #ctx.rect(ctx.width - speed, ctx.height - y, speed, ctx.height / spectrum.length);
    img_tmp = img.cut(0,0,127,128)
    #img_tmp.copy(img, 0, 0, 128, 128, -1, 0, 128, 128);
    img.draw_image(img_tmp, 1,0)
    lcd.display(img)

    fft_amp.clear()
    time.sleep(0.016)

`;

module.exports = codev3;
