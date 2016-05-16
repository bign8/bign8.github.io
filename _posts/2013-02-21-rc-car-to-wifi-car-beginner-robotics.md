---
layout: post
title: RC car to WiFi Car (Beginner Robotics)
categories:
- Robotics
tags: []
---
When I was a senior in high school we (classmates) were asked to come up with a senior project.  Having always wanted to dabble with robotics and control systems I proposed the idea project of building a WiFi controllable RC car.  Our idea was simple enough, take an RC car, rip all the "guts" out, load with our custom build hardware and software.

Using a toy car as our base we soon found a multitude of problems at the time, most of which resulted from a budget of $0.

<!--more-->

First off, steering was controlled with a servo where driving was controlled with a continuous rotation motor.  Having a basic stamp micro-controller from years before, I was easily able to interface with the stepper motor, leaving the problem of powering the driving motor.  After several failed attempts at driving the motor straight from the micro-controller (remember, I was young), It was decided that further research would be necessary.  Stumbling across Pulse Width Modulation (PWM) was an eye-opener of a find, by using a MOFSET, we could turn the motor on and off fast enough that the output would appear to have adjustable motor speed (note: it may have been a wise idea to add a low-pass filter, but I didn't know better at the time).  This solved the problem of actually controlling the car with our micro-controller, but how were we going to control the micro-controller.

Ideally, we would have purchased a WiFi enabled Arduino or something similar, but we were poor so we made by with what we had.  Knowing serial was the only interface with the micro-controller (that we knew of) our only option was to mount a laptop to the base.  Finding an old laptop, that we stripped of everything (keyboard/trackpad/screen), we were able to have WiFi access to the laptop over its own wireless card and be able to control the micro-controller.

Finally, I wrote an extremely simple control system that used a web server on the laptop to serve a webpage that provided the driver with steering and speed options.  By clicking an option, the webpage would fire an executable (via PHP) that would communicate with the basic stamp over the serial connection.

Currently this project sits in a box in my basement.  With luck, the next time I go home I will be able to better document this and provide photos/screenshots/videos of the robot in action.
