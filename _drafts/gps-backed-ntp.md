---
layout: post
title:  GPS Backed NTP Server
categories:
- Projects
- Linux
- Python
tags:
- linux
- python
---
This post covers all the nitty gritty details on how to configure a GPS backed NTP server (and a few stumbling blocks I found along the way).

<!--more-->

## Parts

* GPS Receiver (USB or Serial interface models are available)
* Raspberry Pi (flashed with your favorite linux distro)
* Free time! (debugging isn't cheep)

## Plug it in!

For me, using a USB interface made things super simple, I just plugged in my USB receiver and the linux OS handled it correctly.  To verify the raspberry pi is receiving the data from the USB receiver, I just tailed the system logs to see where the USB device was mounted `journalctl -b`, searched for a tty interface by typing `/ttyUSB` and `cat /dev/ttyUSB0`-ed the associated USB device to see if the GPS was producing anything.

```
# journalctl -b output
usbcore: registered new interface driver usbserial_generic
usbserial: USB Serial support registered for generic
usbcore: registered new interface driver cypress_m8
usbserial: USB Serial support registered for DeLorme Earthmate USB
usbserial: USB Serial support registered for HID->COM RS232 Adapter
usbserial: USB Serial support registered for Nokia CA-42 V2 Adapter
cypress_m8 1-1.2:1.0: DeLorme Earthmate USB converter detected
usb 1-1.2: DeLorme Earthmate USB converter now attached to ttyUSB0

# cat /dev/ttyUSB0
$GPVTG,0.0,T,1.6,M,0.0,N,0.1,K*48
$GPGSV,3,2,12,18,14,162,31,20,47,110,25,21,26,313,29,23,49,100,40*72
$GPGSV,3,3,12,24,25,047,00,27,08,247,00,31,17,196,25,32,63,280,32*76
$GPRMC,<time>,A,<lat>,<long>,0.0,0.0,<date>,<variation>*<checksum>
$GPVTG,0.0,T,1.6,M,0.0,N,0.0,K*49
$GPGSV,3,3,12,24,25,047,00,27,08,247,00,31,17,196,24,32,63,280,30*75
$GPGGA,<time>,<lat>,<long>,1,06,1.5,<altitude>,<geoid-height>,,*<checksum>
... and updates kept coming ...
```

Now, at the time, I had no idea what this data meant, but... after some quick googling, I found this is a standard GPS communication format called [NMEA](http://aprs.gids.nl/nmea/).  Each line is considered a "sentence", where the type of content is defined by the prefix `$<prefix>,` the content being the CSV content until the `*` after which is a checksum of the message to ensure nothing was garbled during transmission.  Then I just quickly wanted to verify I was retrieving semi-valid data, so looking through the NMEA spec, I found the `$GPRMC,` message which provides some UTC timing information.  By just `cat /dev/ttyUSB0 | grep 'GPRMC'`-ing, I was able to watch the update roll in and verify the UTC time was correct (it was not until later, that I noticed the date was wrong :cry:).  Now parsing all this data by hand, sounds terrible, so lets see if there are any tools out there that are designed to handle it!

## NTPD + NTP

After seeing the massive stream of NMEA data, I knew I was in business, but needed to get all the other software configured.  First part, was to get something to read the NMEA data from the GPS.  After a quick trip to Google, I landed on [gpsd](https://gpsd.gitlab.io/gpsd/), a service used to read NMEA data, and produce many consumable outputs for various other applications.  Additionally, I found [a](https://www.satsignal.eu/ntp/Raspberry-Pi-NTP.html) few [posts](http://www.unixwiz.net/techtips/raspberry-pi3-gps-time.html) on [how](https://github.com/rnorris/gpsd/blob/master/www/gpsd-time-service-howto.txt) to do exactly what I wanted to do, have GPS drive NTP... easy enough right?  NOT!

```sh
# Install GPSD + NTP
sudo apt-get install gpsd ntp

# Sample clients for GPSD
# MASSIVE package, but helped me diagnose stuff, removed after I got everything working
sudo apt-get install gpsd-clients

# Modify /etc/default/gpsd
DEVICES="/dev/ttyUSB0"
GPSD_OPTIONS="-n" # don't wait for client to connect; poll GPS immediately

# Add the GPS provider to /etc/ntp.conf
server 127.127.28.0 prefer
fudge 127.127.28.0 refid GPS

# Restart the services
sudo systemctl restart ntp
sudo systemctl restart gpsd

# Check out the GPS and NTP data (I pull these up often when diagnosing/monitoring)
$ cgps -s
┌───────────────────────────────────────────┐┌─────────────────────────────────┐
│    Time:       2001-04-01T18:57:47.000Z   ││PRN:   Elev:  Azim:  SNR:  Used: │
│    Latitude:    CENSORED                  ││  10    68    094    37      Y   │
│    Longitude:   CENSORED                  ││  11    20    295    28      Y   │
│    Altitude:   CENSORED                   ││  12    15    079    29      Y   │
│    Speed:      0.11 mph                   ││  20    34    123    32      Y   │
│    Heading:    0.0 deg (true)             ││  23    37    114    38      Y   │
│    Climb:      n/a                        ││  25    16    117    31      Y   │
│    Status:     3D FIX (0 secs)            ││  31    32    197    30      Y   │
│    Longitude Err:   +/- 30 ft             ││  32    70    316    27      Y   │
│    Latitude Err:    +/- 46 ft             ││   1    13    323    00      N   │
│    Altitude Err:    +/- 113 ft            ││  21    34    301    00      N   │
│    Course Err:      n/a                   ││  24    13    043    00      N   │
│    Speed Err:       +/- 64 mph            ││                                 │
│    Time offset:     -0.169                ││                                 │
│    Grid Square:     CENSOR                ││                                 │
└───────────────────────────────────────────┘└─────────────────────────────────┘

$ watch -n 1 ntpq -p
remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
*SHM(0)          .GPS.            0 l   15   16  377    0.000  -17.136  19.555
```

Things to note in the above output, first, the 127.127.X.Y server in NTP is a "shortcut" address that instructs NTP to look for different types of date providers as defined by the number in X, and Y defines some additional parameters based on the type.  28 stands for a shared memory driver, which can be seen by `ipcs -m`, and the Y of 0 or 1 means to create it with 600 permissions, while 2 and 3 create the shared memory object with 666 permissions.  The [Shared Memory Driver documentation](http://doc.ntp.org/4.2.8/drivers/driver28.html) was helpful while debugging some content later on.

Finally, the keen eyed among you may have noticed, it was showing a date 19.6 years in the past (2001 != 2020).  What the heck is up with that!  Well, turns out, my GPS receiver was manufactured in the last decade, and there is a specific field in the GPS data streem coming from satalites, denoting the "week".  Unfortunantly, the week is a 10 bit field in some implementation an rolls over every 1024 week, or approx 19.6 years.  Newer GPSs account for this sometimes, but mine... does not :cry:.  GPSD claims it uses the system date to accomidate for this by looking at the decade that the current clock is set, but for some reason, that didn't work for me, so... some hackery ensued.


## Decision time!

1. Code around the problem
  * Fix GPSD (requires C knowledge)
  * Hack NMEA data-stream (basic I/O processing)
2. Buy new hardware (expensive)
  * Hardware I have doesn't support PPS
  * Doesn't support this decade :cry:

<!-- TODO: convert to cost/benefit/time-frame analysis -->

Being a software engineer for some time now, I figured it would be easy enough to code around the problem.  I could dive into the source of GPSD, modify the date offset, recompile and be good to go.  One problem, I don't really know C, and I wanted to have something in minutes, not hours.  So, looking through the spec, I was able to find a classic, well defined input/output of NMEA, and found the field that needed to be modified.  Then, I could just write a simple NMEA parser, look for the one field that needed to be updated, update it and pass it along to GPSD.  Easy!

## Coding around the problem

So, just like the `cat /dev/ttyUSB0` I did earlier, I sought after getting the following to produce correctly dated output (where `fakegps` is a script).

```sh
cat /dev/ttyUSB0 | fakegps
```

### Fixing date
To start things out, I grabbed a few lines of content from `/dev/ttyUSB0` so I wasn't continually re-opening the device and had consistent data to read against.  Then, after looking through it, it turned out the `GPRMC` line needed to have it's date field modified.  I was able to verify that by using the [decoder from freenema.net](http://freenmea.net/decoder) to verify the date was incorrect, and after poking around the numbers, found that modifying the 9th CSV field (Date of fix) according to http://aprs.gids.nl/nmea/#rmc correctly fix the problem.

```py
import datetime
import os


DATEFMT = '%d%m%y'


def modify():
    for line in os.stdin:  # parse stdin, one line at a time

        # If it's not the line we are interested in, print it and get move on
        if not line.startswith('$GPRMC'):
            print(line, end='')  # input stream already include newline
            continue

        # Update DATE to account for offset
        parts = line.split(',')
        n = datetime.datetime.strptime(parts[9], DATEFMT)
        n += datetime.timedelta(days=7*1024)  # account for the week offset
        parts[9] = n.strftime(DATEFMT)
        line = ','.join(parts)

        # TODO: recompute checksum

        print(line, end='')  # input stream already include newline


modify()
```

### Fixing checksum
After running that through the freenmea.net/decoder, I knew we had the date part working!  On to fixing the checksum so GPSD wouldn't just discard the line.  In this case, after reading through some docs, turns out the checksum is a bytewise xor of all the characters between the `$` and the `*` characters of the sentence, and output as an uppercase-hex encoded number.

```python
        # Recompute checksum
        line = line[1:]   # crop off the $
        line = line[:line.index('*')]
        n = 0  # starting counter for the xor
        for a in line:
            n ^= ord(a)  # convert the string to an integer
        chksum = hex(n)  # outputs as 0xff
        chksum = chksum[2:]  # crop off the '0x'
        chksum = chksum.upper()  # uppercase to FF
        line = f'${line}*{chksum}\n'
```

There may be smaller ways to do that, but I couldn't see anything without imports, and I wanted to keep it simple!  At this point, the resulting data could be put into freenmea.net/decoder with the correct data AND vaild checksums!  Success!, SHIPIT!!! Well... not so fast...


### Connecting to GPSD
Now the real fun problems seem to come up.  And by real fun, I mean the intricate linux details.  While the script is able to produce valid NMEA data, it doesn't write to a file; better yet, this is a raspberry pi, and writing contantly to an SD card DRASTICALLY shortens SD cards lives (speaking from experience here).  BUT, linux and python have the concept of [Named Pipes](https://en.wikipedia.org/wiki/Named_pipe) where we can still pipe data around, but this time just writing to a memory slot (just like regular pipes), but interfaced with like a file, so gpsd can use it.  So... I added/modified the python script to startup the named pipe, and write to it!

```py
# omitted - existing imports
import errno


def modify(fifo):
    # same modify content, but replace `print`s with the following
    fifo.write(line)
    fifo.flush()


# Create a fifo file (ignore if it's already created)
path = '/tmp/ttyGPS0.fifo'
try:
    os.mkfifo(path)
except OSError as oe:
    if os.errno != errno.EExist:
        raise

modify(open(path, 'w'))
```

Then we just need to configure GPSD to look for the named pipe!

GPSD's configuration file is located at `/etc/default/gpsd` and I changed the lines that we configured before, to the following:

```sh
# contents of /etc/default/gpsd

# Disable USB Hotplugging support, since our script should be doing the work of managing USB connections
USBAUTO="false"

# Our NamedPipe from the fakegps script
DEVICES="/tmp/ttyGPS0.fifo"

# Other options passed to GPSD
# -n don't wait for a client to connect; poll GPS immediately
# -b bluetooth save (opens device in read-only mode)
GPSD_OPTIONS="-n -b"
```

And now, we just need to start everything up in the correct sequence, and lets see what happens...

```sh
cat /dev/ttyUSB0 | fakegps # start the named pipe manually (will automate later)
service restart gpsd # start the gpsd service
cgps -s # Try to read the GPS information

# * CRASH * BANG * FIZZLE *
service status gpsd
SER: /tmp/ttyGPS0.fifo already opened by another process
```

Chasing this error down, I found https://gitlab.com/gpsd/gpsd/-/blob/8c3efd058424cfaf4325cad438e262c82ca5c7d5/gpsd/serial.c#L608 or the following logic that essentially ensures that gpsd is the sole reader of a device.

```cpp
/*
 * Don't touch devices already opened by another process.
 */
if (fusercount(session->gpsdata.dev.path) > 1) {
  GPSD_LOG(LOG_ERROR, &session->context->errout,
     "SER: %s already opened by another process\n",
     session->gpsdata.dev.path);
  (void)close(session->gpsdata.gps_fd);
  session->gpsdata.gps_fd = UNALLOCATED_FD;
  return UNALLOCATED_FD;
}
```

Normally, this is a valid check, and I ran into the very issue it's trying to resolve, where I had two separate terminals listening to the same GPS device, and the messages would get split between the listeners.  After digging through the code, I found the implementation of `fusercount` and saw that it required root user access.  I was able to temporarily bypass this check by killing the service, and starting the GPSD manually. But I without modifying the init.d script, I was unable to figure out how to get gpsd to start with user permissions.  So, since we were hacking, I figured we could just put a spin-loop in the python logic to get us moving.

```py
# omitted - existing imports / modify function
import time

path = '/tmp/ttyGPS0.fifo'
try:
  os.mkfifo(path)
except OSError as oe:
  if os.errno != errno.EExist:
    raise

# HACK!!! Spin while waiting for GPSD to startup and do it's fusercount check!
while os.system('pidof gpsd > /dev/null'):
  time.sleep(1)

modify(open(path, 'w'))
```

Now, let's spin it up and try again!

```sh
cat /dev/ttyUSB0 | fakegps
service restart gpsd # start the gpsd service
cgps -s # SUCCESS!!!
┌───────────────────────────────────────────┐┌─────────────────────────────────┐
│    Time:       2020-11-11T04:26:51.000Z   ││PRN:   Elev:  Azim:  SNR:  Used: │
│    Latitude:    <CENSORED>                ││   1    39    116    33      Y   │
│    Longitude:   <CENSORED>                ││   7    62    148    30      Y   │
│    Altitude:   <CENSORED>                 ││  17    27    224    27      Y   │
│    Speed:      0.00 mph                   ││  21    37    073    33      Y   │
│    Heading:    0.0 deg (true)             ││  28    49    299    29      Y   │
│    Climb:      n/a                        ││  30    83    260    33      Y   │
│    Status:     3D FIX (0 secs)            ││   8    29    046    00      N   │
│    Longitude Err:   +/- 36 ft             ││  13    25    304    00      N   │
│    Latitude Err:    +/- 61 ft             ││  19    07    223    00      N   │
│    Altitude Err:    +/- 181 ft            ││                                 │
│    Course Err:      n/a                   ││                                 │
│    Speed Err:       +/- 83 mph            ││                                 │
│    Time offset:     -0.185                ││                                 │
│    Grid Square:     <CENSORED>            ││                                 │
└───────────────────────────────────────────┘└─────────────────────────────────┘
```

Sweet! We have the GPS client working and a bunch of random terminals running to support it! now let's see if we can get NTP to listen to it!


### Connecting to NTP

This part is pretty easy, because if you've been following along, NTP should already be configured correctly!

```sh
service restart ntp
ntpq -p
```

But, here is the meat of my `/etc/ntp.conf` and I'll explain below.

```
# GPS Data
server 127.127.28.0 minpoll 4 maxpoll 4 prefer
fudge 127.127.28.0 time1 -0.220 refid GPS

# interval of 5 ~= 32 seconds (hot ARP cache)
pool us.pool.ntp.org iburst minpoll 5 maxpoll 5
```

I will note a few interesting components of the NTP config file `/etc/ntp.conf`.  First, remember that weird `127.127.*.*` address?  The 28 tells NTP which type of [reference clock driver](http://doc.ntp.org/4.2.8/refclock.html) to use.  When running the gpsd command above manually, you can have NTP create the shared memory with 0666 permissions your user (the one running GPSD) can write to the root users owned shared memory block, created by NTP.  More information can be found on the [driver28 man page](http://doc.ntp.org/4.2.8/drivers/driver28.html). This page also contains the information about what the `time1` parameters and the format for the data in shared memory looks like (in case, you wanted to write to that directly and not use GPSD).

And, for the pool definition: first, I'm in the US, so pick some members from the US pool; and second, expecially on Raspberry PIs, ARP lookup table entries have a default time-to-live of 60 seconds; and the default for the poll interval is 64 seconds.  Meaning that each time server poll would require NEW ARP requests before actually retrieving time information.  Anyway, the phenomonon is documented well in the "ARP is the sound of your server choking" section of [GPSD Time Service HOWTO](https://github.com/rnorris/gpsd/blob/master/www/gpsd-time-service-howto.txt), but dropping the default to min/max poll of 5 should resolve that issue.


### Fixing `falseticker`
Now that everything can connect, I let it run for a while and it turned out NTP tries to be smart!  It detected that the python program wasn't really consistent and was having a hard time producing consistent timely results.  Once NTP detected it was getting inconsistent results, it would label the clock provider with an `x` which after [reading the docs](https://docs.ntpsec.org/latest/ntpspeak.html) means it's a `falseticker` or

> A timeserver identified as not reliable by statistical filtering

So I was thinking about it, and yes, nothing I'm doing here is really stable; obviously I'm working around quirks in gpsd; maybe I should can the whole project.  So, I took a small break and went to play 8-ball.

-- TIME PASSES --

After an evening playing billiards at the local pool hall, I remembered the python has internal buffers by default when opening a file for reading and writing!  The often un-used 3rd parameter for `open` tells python how to configure it's internal buffers and un-buffered reading/writing requires the files to be opened in binary mode.  This just means all our string processing needs to be able to deal with byte string `b'byte string'` instead of regular strings `'regular string'`.  Which required a few changes across teh script, but nothing too crazy.

```py

# omitted - imports / mkfifo logic

def modify(fifo, stream):
  for line in stream:
    if not line.startswith(b'$GPRMC'):
      fifo.write(line)
      continue

    # Update DATE to account for offset
    parts = line.split(b',')
    n = datetime.datetime.strptime(parts[9].decode(), DATEFMT)
    n += datetime.timedelta(days=7*1024)  # account for the week offset
    parts[9] = n.strftime(DATEFMT).encode()
    line = b','.join(parts)

    # Recompute checksum
    line = line[1:]   # crop off the $
    line = line[:line.index(b'*')]
    n = 0  # starting counter for the xor
    for a in line:
        n ^= a  # convert the string to an integer
    chksum = hex(n)  # outputs as 0xff
    chksum = chksum[2:]  # crop off the '0x'
    chksum = chksum.upper().encode()  # uppercase to FF

    fifo.write(b'$' + line + b'*' + chksum + b'\n')


with open('/tmp/ttyGPS0.fifo', 'wb', 0) as fifo:  # unbuffered
  with open('/dev/ttyUSB0', 'rb', 1) as stream:  # line buffered
    modify(fifo, stream)

```


### Surviving GPSD restarts
Now, the way the code works is fine, but it if gpsd restarts for any-reason, or if a listener of the socket joins and leaves again (like I did continually while verify the changes), this script currently just hard exits.  So, now to have the modify logic be able to restart and handle the case where the consumer of the fifo socket disappears and results in `BrokenPipeError`'s

```python
# omitted - imports / modify / mkfifo

# Continually listen for pipe readers and start writer
while True:

  # Spinloop for gpsd startup
  while os.system('pidof gpsd > /dev/null'):
    time.sleep(1)

  # Buffered opens
  with open(path, 'wb', 0) as fifo:
    print("Connected")
    with open('/dev/ttyUSB0', 'rb', 1) as stream:
      try:
        modify(fifo, stream)
      except BrokenPipeError: # gracefully catch the broken pipe
        print("Disconnected")  # log and pop out to while loop (closing with blocks)
```

And with that, I was able to have my `./fakegps` running in a terminal, and have another one starting and stoping the gpsd service at will w/o seeing failures.

```sh
service stop gpsd
service start gpsd
# repeat 1000s of times or until driver requires a coffee break
```

### Automate Startup of `fakegps`
Alright, now, time for the last bit... how do we get `fakegps` to start up when the system boots!  Well, there is a very old and outdated linux concept called rc.local.  Yes, it's out of date and replaced by systemd. Yes, there are better ways to do it, but... this is hacked up the wazu, whats just one more hack.

So, here is my `/etc/rc.local`.
```sh
#!/bin/sh -e
# /etc/rc.local

# Start fakegps (yes, there are more modern ways of doing this)
/opt/fakegps &

exit 0
```

Do a system restart a few times to verify, and GPSD doesn't want to start by itself, so, just have the python do it after the fifo creation.

```python
os.system('systemctl start gpsd')
```


## Future Work

* Remove GPSD and directly write to shared memory (can't be that hard)!
* Write logic in a respectable language (not python)
* Patch GPSD to support this properly
* Buy a modern GPS receiver (with PPS support!)


## Conclusion

None of what I have done with this python script is respectable.  Never use this in a production environment.  Buy a different GPS device and move on.  But, if you want to learn something by digging through code; see if you can get things that aren't supposed to work together, to work together, then maybe, try some hacking around.

For me, this NTP server is still running today, and is keeping time quite nicely.  The project was a nice break from the usual grind of things I've been doing lately, and was a decent weekend project where I learned a lot about NTP, GPSD and some linux things.  Hopefully this post finds you and your family well, and if nothing else was somewhat entertaining and maybe educational.

Oh, and if you wanted to use this monstrosity of code, w/o copy/pasting from a blog, here is the gist on github: https://gist.github.com/bign8/206283c1652d1475136a893d375177a6.
