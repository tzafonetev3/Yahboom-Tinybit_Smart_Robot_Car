let alreadyInit = 0
const PWM_ADD = 0x01
const MOTOR = 0x02
const RGB = 0x01

//% weight=10 color=#006400 icon="\uf1b9" block="Tinybit"
//% groups='["Motors", "Distance Sensor", "Line Reader","Headlights"]'

namespace Tinybit {
    export enum Motors {
        //% blockId="LeftMotor" block="LeftMotor"
        LeftMotor = 0,
        //% blockId="RightMotor" block="RightMotor"
        RightMotor = 1,
        //% blockId="BothMotors" block="BothMotors"
        BothMotors = 2
    }
    export enum direction {
        forward = 1,
        backward = 2
    }

    export enum PingUnit {
        //% block="cm"
        Centimeters,
        //% block="μs"
        MicroSeconds
    }
    export enum Linesensor {
        //% blockId="Left line reader" block="Left line reader"
        LeftLineSensor = 13,
        //% blockId="Right line reader" block="Right line reader"
        RightLineSensor = 14
    }
    export enum LEDpin {
        //% blockId="Headlight Left" block="Headlight Left"
        HeadlightLeft = 8,
        //% blockId="Headlight Right" block="Headlight Right"
        HeadlightRight = 12
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
        buf[0] = RGB;
        buf[1] = red;
        buf[2] = green;
        buf[3] = blue;

        pins.i2cWriteBuffer(PWM_ADD, buf);
    }
    //% weight=100
    //% group="Motors"
    //% blockId=motor_MotorRun block="Set|%index|to|%Direction|at the speed|%speed" 
    //% speed.min=0 speed.max=100
    //% speed.defl=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% dir.fieldEditor="gridpicker" dir.fieldOptions.columns=2
    export function MotorRun(index: Motors, dir: direction, speed: number): void {
        speed = Math.round(speed * 2.55)
        let buf = pins.createBuffer(5);
        buf[0] = MOTOR;


        if (index == Motors.LeftMotor) {
            if (dir == direction.forward) {
                //buf[1] = 0;
                //buf[2] = 0;
                buf[3] = speed;
                //buf[4] = 0;
            }
            else if (dir == direction.backward) {
                //buf[1] = 0;
                //buf[2] = 0;
                //buf[3] = 0;
                buf[4] = speed;

            }

        }
        else if (index == Motors.RightMotor) {
            if (dir == direction.forward) {
                buf[1] = speed;
                //buf[2] = 0;
                //buf[3] = 0;
                //buf[4] = 0;
            }
            else if (dir == direction.backward) {
                //buf[1] = 0;
                buf[2] = speed;
                //buf[3] = 0;
                //buf[4] = 0;
            }
        }

        else if (index == Motors.BothMotors) {
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
        pins.i2cWriteBuffer(PWM_ADD, buf);

    }
    //% weight=98
    //% group="Motors"
    //% blockId=motor_motorStop block="Stop|%motors"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(5);
        buf[0] = MOTOR;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = 0;
        buf[4] = 0;

        pins.i2cWriteBuffer(PWM_ADD, buf);

    }

    //% group="Distance Sensor"
    //% blockId=mbit_ultrasonic_car block="distance sensor value in %unit"
    //% color="#006400"
    //% weight=98
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P16, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P16, 1);
        control.waitMicros(15);
        pins.digitalWritePin(DigitalPin.P16, 0);
        // read pulse
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp);

        let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, maxCmDistance * 42);
        let dr = Math.round(d / 42);
        console.log("Distance: " + dr);

        basic.pause(50)

        switch (unit) {
            case PingUnit.Centimeters: return dr;
            default: return dr;
        }

    }


    //% weight=89
    //% group="Line Reader"
    //% blockId=read_Linesensor block=" %Linesensor detects %type"
    //% Linesensor.fieldEditor="gridpicker" Linesensor.fieldOptions.columns=2 


    export function readlinereadervalue(Line: Linesensor, typeline: linevalue): boolean {
        let LeftLineSensorValue = pins.digitalReadPin(DigitalPin.P13)
        let RightLineSensorValue = pins.digitalReadPin(DigitalPin.P14)
        if (typeline == linevalue.white && LeftLineSensorValue == 0) {
            return true
        }
        else if (typeline == linevalue.black && LeftLineSensorValue == 1) {
            return true
        }
        if (typeline == linevalue.white && RightLineSensorValue == 0) {
            return true
        }
        else if (typeline == linevalue.black && RightLineSensorValue == 1) {
            return true
        }
        else {
            return false
        }
    }

    //% weight=87
    //% group="Headlights"
    //% blockId=writeLED block="Set|%led|to|%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LEDpin, ledswitch: LEDmode): void {
        if (led == LEDpin.HeadlightLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LEDpin.HeadlightRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return

        }
    }
    //% weight=10
    //% inlineInputMode=inline
    //% blockId=RGB block="Set headlights to Red:%r Green:%g Blue:%b"
    //% r.min=0 r.max=100
    //% g.min=0 g.max=100
    //% b.min=0 b.max=100
    //% group="Headlights"
    export function rgblight(r: number, g: number, b: number): void {
        //scaling since 255 wont mean anything to a teacher/student 
        //User sees a value of 100 while program sees the value 255
        let R = r * 2.55;
        let G = g * 2.55;
        let B = b * 2.55;
        if (R > 255)
            R = 255;
        if (G > 255)
            G = 255;
        if (B > 255)
            B = 255;

        setPwmRGB(R, G, B);

    }


}


