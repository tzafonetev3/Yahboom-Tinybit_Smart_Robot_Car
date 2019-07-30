//////////////////////////////////////////////////////////////
/*
Copyright 2019 GHIElectronics, LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
//////////////////////////////////////////////////////////////
//% weight=10 color=#006400 icon="\uf1b9" block="Tinybit"
//% groups='["Motors", "Distance Sensor", "Line Reader","Lights", "Music", "Microphone"]'

let SmartStrip: neopixel.Strip;

namespace Tinybit {
    const alreadyInit = 0
    const I2C_ADDRESS = 0x01
    const MOTOR = 0x02
    const LeftLineSensorValue = pins.digitalReadPin(DigitalPin.P13)
    const RightLineSensorValue = pins.digitalReadPin(DigitalPin.P14)

    export enum Motors {
        //% blockId="LeftMotor" block="LeftMotor"
        LeftMotor,
        //% blockId="RightMotor" block="RightMotor"
        RightMotor,
        //% blockId="BothMotors" block="BothMotors"
        BothMotors
    }

    export enum direction {
        forward,
        backward
    }

    export enum PingUnit {
        //% block="cm"
        Centimeters,
        //% block="μs"
        MicroSeconds
    }

    export enum Linesensor {
        //% blockId="Left line reader" block="Left line reader"
        LeftLineSensor,
        //% blockId="Right line reader" block="Right line reader"
        RightLineSensor
    }

    export enum LEDpin {
        //% blockId="Headlight Left" block="Headlight Left"
        HeadlightLeft,
        //% blockId="Headlight Right" block="Headlight Right"
        HeadlightRight
    }
    
    export enum LEDmode {
        //% blockId="ON" block="ON"
        ON = 0x01,
        //% blockId="OFF" block="OFF"
        OFF = 0x00
    }

    export enum linevalue {
        white,
        black
    }

    function setPwmRGB(red: number, green: number, blue: number): void {

        let buf = pins.createBuffer(4);
        buf[0] = I2C_ADDRESS;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;

        pins.i2cWriteBuffer(I2C_ADDRESS, buf);
    }

    //% weight=100
    //% group="Motors"
    //% blockId=motor_MotorRun block="Set|%index|to|%Direction|at the speed|%speed" 
    //% speed.min=0 speed.max=100
    //% speed.defl=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% dir.fieldEditor="gridpicker" dir.fieldOptions.columns=2
    export function ControlMotors(WhichMotor: Motors, dir: direction, speed: number): void {
        speed = Math.round(speed * 2.55);
        let buf = pins.createBuffer(5);

        buf[0] = MOTOR;

        if (WhichMotor == Motors.LeftMotor) {
            if (dir == direction.forward) {
                buf[3] = speed;
            }
            else if (dir == direction.backward) {
                buf[4] = speed;
            }
        }
        else if (WhichMotor == Motors.RightMotor) {
            if (dir == direction.forward) {
                buf[1] = speed;
            }
            else if (dir == direction.backward) {
                buf[2] = speed;
            }

        }
        else if (WhichMotor == Motors.BothMotors) {
            if (dir == direction.forward) {
                buf[1] = speed;
                buf[2] = 0;
                buf[3] = speed;
                buf[4] = 0;
            }
            else if (dir == direction.backward) {
                buf[1] = 0;
                buf[2] = speed;
                buf[3] = 0;
                buf[4] = speed;
            }

        }

        pins.i2cWriteBuffer(I2C_ADDRESS, buf);
    }

    //% weight=98
    //% group="Motors"
    //% blockId=motorStop block="Stop motors"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2
    export function motorStop(): void {
        let buf = pins.createBuffer(5);

        buf[0] = MOTOR;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = 0;
        buf[4] = 0;

        pins.i2cWriteBuffer(I2C_ADDRESS, buf);
    }

    //% group="Distance Sensor"
    //% blockId=ReadUltrasonicSensor block="distance sensor value in centimeters"
    //% color="#006400"
    //% weight=98
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function ReadUltrasonicSensor(): number {
        // send pulse
        pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P16, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P16, 1);
        control.waitMicros(15);
        pins.digitalWritePin(DigitalPin.P16, 0);

        // read pulse
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp);

        let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 21000);

        d = Math.round(d / 42);

        console.log("Distance: " + d);

        basic.pause(50)

        return d;
    }

    //% weight=89
    //% group="Line Reader"
    //% color="#006400"
    //% blockId=ReadLinereaderValue block=" %Linesensor detects %type"
    //% Linesensor.fieldEditor="gridpicker" Linesensor.fieldOptions.columns=2 
    export function ReadLinereaderValue(Line: Linesensor, typeline: linevalue): boolean {
        let pin = Line === Linesensor.LeftLineSensor ? DigitalPin.P13 : DigitalPin.P14

        if (pins.digitalReadPin(pin) === 0) {

            return typeline === linevalue.white;
        }
        else {

            return typeline === linevalue.black;
        }
        if (pins.digitalReadPin(pin) === 0) {

            return typeline === linevalue.white;
        }
        else {

            return typeline === linevalue.black;
        }
    }

    //% weight=10
    //% inlineInputMode=inline
    //% blockId=rgblight block="Set headlights to Red:%r Green:%g Blue:%b"
    //% r.min=0 r.max=100
    //% g.min=0 g.max=100
    //% b.min=0 b.max=100
    //% group="Lights"
    //% color="#006400"
    export function rgblight(r: number, g: number, b: number): void {
        //scaling since 255 wont mean anything to a teacher/student 
        //User sees a value of 100 while program sees the value 255
        r *= 2.55;
        g *= 2.55;
        b *= 2.55;

        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;

        setPwmRGB(r, g, b);
    }

    //% weight=5
    //% inlineInputMode=inline
    //% blockId=rgblightoff block="Turn off headlights"
    //% group="Lights"
    //% color="#006400"
    export function rgblightoff(): void {
        setPwmRGB(0, 0, 0)
    }

    //% blockId=RGB_Neopixel block="Smart Leds"
    //% weight=99
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% group="Lights"
    export function RGB_Neopixel(): neopixel.Strip {
        if (SmartStrip === null || SmartStrip === undefined) {
            SmartStrip = neopixel.create(DigitalPin.P12, 2, NeoPixelMode.RGB);
        }
        return SmartStrip;
    }

    //% blockId=Music_Car block="Play sound %index"
    //% weight=95
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% group="Music"
    export function Music_Car(melody: Melodies): void {
        music.beginMelody(music.builtInMelody(melody), MelodyOptions.Once);
    }

    //% blockId=Read_Voice_Sensor block="a noise is made"
    //% weight=60
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    //% group="Microphone"
    export function Read_Voice_Sensor(): boolean {
        //pins.setPull(DigitalPin.P1, PinPullMode.PullUp);
        let SoundValue = pins.analogReadPin(AnalogPin.P1);
        //Sound detected
        if (SoundValue > 100) {
            return true
        }
        else {
            return false
        }
    }
}
