![Pine64 Ox64 64-bit RISC-V SBC (Bouffalo Lab BL808)](https://lupyuen.github.io/images/ox64-sbc.jpg)

# Apache NuttX RTOS for Pine64 Ox64 64-bit RISC-V SBC (Bouffalo Lab BL808)

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

_What's this BL808?_ [(Datasheet)](https://github.com/bouffalolab/bl_docs/blob/main/BL808_DS/en/BL808_DS_1.2_en.pdf) [(Reference Manual)](https://github.com/bouffalolab/bl_docs/blob/main/BL808_RM/en/BL808_RM_en_1.3.pdf)

BL808 is a complex creature with 3 (Asymmetric) RISC-V Cores (linked via IPC)...

1.  D0 Core: [T-Head C906 64-bit RV64IMAFCV](https://www.t-head.cn/product/c906?lang=en) (480 MHz)

    (Multimedia Core with MIPI CSI / DSI, Neural Proc Unit)

    (Memory Mgmt Unit is Sv39, 128/256/512 TLB table entry. Same as Star64?)

1.  M0 Core: [T-Head E907 32-bit RV32IMAFCP](https://www.t-head.cn/product/e907?lang=en) (320 MHz)

    (Wireless + Peripherals Core with WiFi, BLE, BT, Zigbee, Audio)

1.  LP Core: [T-Head E902 32-bit RV32E[M]C](https://www.t-head.cn/product/e902?lang=en) (150 MHz)

    (Low Power Core)

    [(Upcoming BL606 looks similar, minus the Low Power Core)](https://en.bouffalolab.com/product/?type=detail&id=16)

![Bouffalo Lab BL808 is a complex creature with 3 (Asymmetric) RISC-V Cores](https://lupyuen.github.io/images/ox64-cores.jpg)

[Pine64 Ox64](https://wiki.pine64.org/wiki/Ox64) is the dev board for BL808C.

(BL808C supports MIPI CSI Cameras but not MIPI DSI Displays. Maybe someday we'll see BL808D for MIPI DSI Displays)

_Is Ox64 BL808 an SBC? Or an MCU Board?_

Technically Ox64 BL808 boots 64-bit RISC-V Linux (via MicroSD), so it feels like an SBC...

- ["Booting Linux on the Pine64 Ox64 SBC"](https://adventurist.me/posts/00317)

- [OpenBouffalo Wiki](https://openbouffalo.org/index.php/Main_Page)

- [Linux Image + OpenSBI + U-Boot Bootloader for BL808](https://github.com/openbouffalo/buildroot_bouffalo)

  [(Newer version?)](https://github.com/bouffalolab/buildroot_bouffalo)

  [(OpenSBI is the BIOS for RISC-V SBCs)](https://lupyuen.github.io/articles/sbi)

- USB-C Port for Camera Module (Dual-Lane MIPI CSI)

  (USB-C is not for Flashing!)

- USB 2.0 support for USB OTG

  (On-The-Go = USB Host + USB Device)

But Ox64 BL808 also feels like an MCU Board...

- Form Factor is similar to MCU Board

- Limited Memory: 64 MB of RAM, [128 Megabits](https://pine64.com/product/128mb-ox64-sbc-available-on-december-2-2022/) (16 MB) of Flash Memory

- M0 Wireless Core is 32-bit RISC-V MCU

- UART Pins need a USB Serial Adapter for Flashing and Console I/O

- Powered by Micro USB Port

  (Micro USB is not for Flashing either!)

- Super Affordable: [$8 for a 64-bit RISC-V Board!](https://pine64.com/product/128mb-ox64-sbc-available-on-december-2-2022/)

_Ox64 BL808 sounds a little tiny for 64-bit Linux?_

Yeah 64-bit Linux runs with Limited RAM on the D0 Multimedia Core. But most Peripherals are hosted on the M0 Wireless Core: WiFi, BLE, BT, Zigbee, Audio, ...

So we flash M0 with a simple 32-bit RISC-V Firmware, to forward the Peripheral Interrupts from M0 to D0 Linux.

Here are the binaries loaded into D0 Multimedia Core and M0 Wireless Core, from [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo)...

* __d0_lowload_bl808_d0.bin__: This is a very basic bootloader that loads opensbi, the kernel and dts files into ram

* __m0_lowload_bl808_m0.bin__: This firmware runs on M0 and forwards interupts to the D0 for several peripherals

* __bl808-firmware.bin__: An image containing OpenSBI, Uboot and uboot dtb files. 

* __sdcard-*.tar.xz__: A tarball containing the rootfs for the image to be flashed to the SD card

Perhaps Ox64 BL808 might run more efficiently with a tiny 64-bit RTOS.

_Why Apache NuttX RTOS?_

It might be interesting to run Apache NuttX RTOS on both the D0 Multimedia Core and the M0 Wireless Core. Then D0 and M0 can talk over OpenAMP (Asymmetric Multi-Processing).

Let's explore...

# Flashing UART vs Serial Console

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

![Flashing UART vs Serial Console](https://lupyuen.github.io/images/ox64-pinout.jpg)

_We need to handle TWO UART Ports on Ox64?_

Yeah don't confuse the 2 UART Ports on Ox64! Let's give the UART Ports distinctive names [(like Migi & Dali)](https://en.wikipedia.org/wiki/Migi_%26_Dali)...

1.  __Ox64 Flashing UART__: Used for Flashing Ox64

    + Flashing UART TX is __GPIO 14__ (Physical Pin 1)
    + Flashing UART RX is __GPIO 15__ (Physical Pin 2)
    + Remember to connect GND
    + Baud Rate for Normal Mode: 2,000,000 (2 Mbps)
    + Baud Rate for Flashing Mode: 230,400 (230.4 kbps)
    + BL808 UART0 is controlled by the M0 Wireless Core (OpenBouffalo Firmware)

1.  __Ox64 Serial Console__: Used for Linux Serial Console (plus OpenSBI and U-Boot Bootloader)

    + Serial Console TX is __GPIO 16__ (Physical Pin 32)
    + Serial Console RX is __GPIO 17__ (Physical Pin 31)
    + Remember to connect GND
    + Baud Rate: 2,000,000 (2 Mbps)
    + BL808 UART3 is controlled by the D0 Multimedia Core (Linux + OpenSBI + U-Boot)
    + Output is totally blank if OpenBouffalo Firmware [wasn't flashed correctly](https://github.com/openbouffalo/buildroot_bouffalo/issues/60), or if OpenSBI / U-Boot / Linux couldn't boot

NEITHER UART Port is accessible over USB-C or Micro USB. So yeah it's totally counterintuitive.

(Maybe someone can create a Stackable HAT or Breadboard, that will expose the 2 UART Ports as USB Dongles? Or a UART Switcher?)

[(__For Pre-Production Ox64:__ Physical Pins are different, but GPIOs above are correct)](https://lupyuen.github.io/images/ox64-sd.jpg)

_Why 2 Baud Rates for Flashing UART?_

When we power up Ox64 in __Normal Mode__: (Boot Button NOT pressed)

- Flashing UART Port will show us the OpenBouffalo Firmware running on M0 Wireless Core

- This M0 Firmware will forward Peripheral Interrupts to D0 Multimedia Core

- M0 Firmware is hardcoded for 2 Mbps

- Not really fun to watch. But we use this for testing our 2 Mbps USB Serial Adapter.

When we power up Ox64 in __Flashing Mode__: (Boot Button pressed)

- Ox64 is ready for Firmware Flashing by the BL DevCube GUI Tool

- Firmware Flashing supports various Baud Rates: 230.4 kbps, 2 Mbps, ...

- But 2 Mbps will fail on macOS. That's why we Flash Firmware at 230.4 kbps.

  [(Same problem when flashing BL602)](https://lupyuen.github.io/articles/flash#flash-the-firmware)

_Serial Console is always 2 Mbps?_

Yeah 2 Mbps is hardcoded in Ox64 Linux. Switching to other Baud Rates will show garbled text.

Thus our USB Serial Adapter must connect reliably to Ox64 at 2 Mbps.

Now we flash Ox64 and boot Linux...

# Flash OpenSBI and U-Boot Bootloader to Ox64 BL808

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

Before booting Linux on Ox64, we flash OpenSBI + U-Boot Bootloader to D0 Multimedia Core, and the Peripheral Interrupt Firmware to M0 Wireless Core. From [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo):

* __d0_lowload_bl808_d0.bin__: This is a very basic bootloader that loads opensbi, the kernel and dts files into ram

* __m0_lowload_bl808_m0.bin__: This firmware runs on M0 and forwards interupts to the D0 for several peripherals

* __bl808-firmware.bin__: An image containing OpenSBI, Uboot and uboot dtb files. 

Here are the steps, based on the [Official Flashing Instructions](https://github.com/openbouffalo/buildroot_bouffalo#flashing-instructions)...

1.  We tested with [Pine64 Woodpecker CH340G USB Serial Adapter](https://pine64.com/product/serial-console-woodpecker-edition/) on macOS x64.

    Warning: Some USB Serial Adapters [WON'T WORK!](https://wiki.pine64.org/wiki/Ox64#Compatible_UARTs_when_in_bootloader_mode)

    Probably because we are connecting at 2 Mbps, which might be too fast for some USB Serial Adapters.

    [(Like this CP2102, which shows garbled text at 2 Mbps)](https://www.lazada.sg/products/i2037772272-s11135131253.html)

    ![Flashing UART](https://lupyuen.github.io/images/ox64-pinout2.jpg)

1.  To Test our USB Serial Adapter: Connect the USB Serial Adapter to __Ox64 Flashing UART__ (pic above)...
    + Flashing UART TX is __GPIO 14__ (Physical Pin 1)
    + Flashing UART RX is __GPIO 15__ (Physical Pin 2)
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Start the USB Serial Terminal (Flashing UART).

    Power up Ox64 via the Micro USB Port. Ox64 Green LED should light up.

    This Clickety Micro USB Cable is very handy for rebooting Ox64...

    ![Clickety Micro USB Cable](https://lupyuen.github.io/images/ox64-usb.jpg)

1.  In the USB Serial Terminal (Flashing UART), we should see the Ox64 Factory Test Firmware...

    ```text
    Build:19:50:39,Nov 20 2022
    Copyright (c) 2022 Bouffalolab team
    dynamic memory init success,heap size = 93 Kbyte 
    sig1:ffff32ff
    sig2:0000ffff
    Pong!
    Ping!
    ```

    [(Source)](https://adventurist.me/posts/00317)

    If the text appears garbled: Try a different USB Serial Adapter. (See above)

    My prototype version shows this instead...

    ```text
    Init CLI with event Driven
    start aos loop... 
    CLI RAW Data, c906
    /romfs/c906.bin not found!
    ```

    [(Source)](https://gist.github.com/lupyuen/43676407bbced733e65566879e18732b)

1.  Pre-Flash Check: Set BL808 board to programming mode
    + Remove the microSD Card
    + Press and Hold BOOT Button
    + Unplug and replug the Micro USB Port
    + Release BOOT button
    + Ox64 Green LED should turn on

    In the USB Serial Terminal (Flashing UART), we should see this...

    ```text
    .
    ```

    Yep Ox64 is ready for flashing!

1.  Now we prepare to flash:

    Disconnect the USB Serial Terminal (to release the Flashing UART)

    Set BL808 board to programming mode
    + Remove the microSD Card
    + Press and Hold BOOT Button
    + Unplug and replug the Micro USB Port
    + Release BOOT button
    + Ox64 Green LED should turn on

1.  We download the Ox64 Binaries...

    - [bl808-linux-pine64_ox64_full_defconfig.tar.gz](https://github.com/openbouffalo/buildroot_bouffalo/releases/download/v1.0.1/bl808-linux-pine64_ox64_full_defconfig.tar.gz) 

    From the latest Ox64 Linux Release...

    - [openbouffalo/buildroot_bouffalo (Release v1.0.1)](https://github.com/openbouffalo/buildroot_bouffalo/releases/tag/v1.0.1)

    Unzip the download and we should see this...

    ```bash
    → ls -l firmware
       7340032  bl808-firmware.bin
         31360  d0_lowload_bl808_d0.bin
         65760  m0_lowload_bl808_m0.bin
      43859444  sdcard-pine64_ox64_full_defconfig.img.xz    
    ```

1.  We'll run BouffaloLab DevCube for Flashing BL808.

    Only Ubuntu x64, macOS and Windows are supported.

    TODO: How to flash BL808 on Arm64 SBCs and Pinebook Pro? Sigh. See [bflb-iot-tool / bflb-mcu-tool](https://wiki.pine64.org/wiki/Ox64#Alternative:_Open-Source_Flashing)

1.  Download Bouffalo Lab DevCube 1.8.3 from...

    [openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip](https://openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip)

    [(1.8.4 and later won't work)](https://github.com/openbouffalo/buildroot_bouffalo/issues/60)

    May need to Grant Execute Permission...

    ```bash
    cd BouffaloLabDevCube-v1.8.3
    chmod +x BLDevCube-macos-x86_64
    ./BLDevCube-macos-x86_64
    ```

1.  Run DevCube, select "BL808", and switch to "MCU" page

1.  M0 Group: Group0

    Image Addr: 0x58000000
    
    PATH: Select "m0_lowload_bl808_m0.bin"

1.  D0 Group: Group0

    Image Addr: 0x58100000
    
    PATH: Select "d0_lowload_bl808_d0.bin"

1.  Set UART Rate to 230400.

    Don't set to 2000000, it will fail on macOS!

    [(Same problem when flashing BL602)](https://lupyuen.github.io/articles/flash#flash-the-firmware)

1.  Click "Create & Download" and wait until it's done

    [(See the log)](https://gist.github.com/lupyuen/125e15be5ed1e034bed33d16ed496d87)

1.  Switch to "IOT" page

1.  Enable 'Single Download'

    Set Address to 0x800000
    
    Select "bl808-firmware.bin"

1.  Set UART Rate to 230400.

    Don't set to 2000000, it will fail on macOS!

    [(Same problem when flashing BL602)](https://lupyuen.github.io/articles/flash#flash-the-firmware)

1.  Click "Create & Download" again and wait until it's done

    [(See the log)](https://gist.github.com/lupyuen/e8c0aca0ebd0f1eae034b0996a5b3ec3)

1.  Start the USB Serial Terminal (Flashing UART at 2 Mbps).

    Unplug and replug the Micro USB Port.

    (Don't press the Boot Button!)

1.  On the USB Serial Terminal (Flashing UART) we should see...

    ```text
    [I][] Powered by BouffaloLab
    [I][] Build:11:52:22,Mar  6 2023
    [I][] Copyright (c) 2023 OpenBouffalo team
    [I][] Copyright (c) 2022 Bouffalolab team
    [I][] =========== flash cfg ==============
    [I][] jedec id   0xEF6018
    [I][] mid            0xEF
    [I][] iomode         0x04
    [I][] clk delay      0x01
    [I][] clk invert     0x01
    [I][] read reg cmd0  0x05
    [I][] read reg cmd1  0x35
    [I][] write reg cmd0 0x01
    [I][] write reg cmd1 0x31
    [I][] qe write len   0x01
    [I][] cread support  0x00
    [I][] cread code     0xFF
    [I][] burst wrap cmd 0x77
    [I][] sector size:   0x04
    [I][] =====================================
    [I][] dynamic memory init success,heap size = 156 Kbyte 
    [I][MAIN] Starting Mailbox Handlers
    [I][MBOX] Forwarding Interupt SDH (33) to D0 (0x58008bbc)
    [I][MBOX] Forwarding Interupt GPIO (60) to D0 (0x58008d0e)
    [I][MAIN] Running...
    [I][MBOX] Mailbox IRQ Stats:
    [I][MBOX] .Peripheral SDH (33): 0
    [I][MBOX] .Peripheral GPIO (60): 0
    [I][MBOX] Unhandled Interupts: 0 Unhandled Signals 0
    ```

    [(Source)](https://gist.github.com/lupyuen/52ccdf076ae294db26e837e6ffc4bafb)

    Yep we have flashed the OpenBouffalo Firmware successfully!

    ![Serial Console](https://lupyuen.github.io/images/ox64-pinout3.jpg)

1.  Connect our USB Serial Adapter to __Ox64 Serial Console__: (pic above)
    + Serial Console TX is __GPIO 16__ (Physical Pin 32)
    + Serial Console RX is __GPIO 17__ (Physical Pin 31)
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Start the USB Serial Terminal (Serial Console).

    Unplug and replug the Micro USB Port.

    (Don't press the Boot Button!)

1.  On the USB Serial Terminal (Serial Console) we should see...

    ```text
    U-Boot 2023.04-rc2 (Mar 06 2023 - 11:48:40 +0000)
    Card did not respond to voltage select! : -110
    BOOTP broadcast
    Retry time exceeded; starting again
    ```

    [(Source)](https://gist.github.com/lupyuen/0b1a98781e86ba11c5538eb1e3058718)

    Which is OK because U-Boot Bootloader is waiting for a microSD Card. 

1.  If nothing appears...

    Check that we are using [Bouffalo Lab DevCube 1.8.3](https://openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip)

    [(1.8.4 and later won't work)](https://github.com/openbouffalo/buildroot_bouffalo/issues/60)

    In BL Dev Cube, UART Rate (for MCU and IoT) should be 230400.

    Don't set to 2000000, it will fail on macOS!

    [(Same problem when flashing BL602)](https://lupyuen.github.io/articles/flash#flash-the-firmware)

Let's load Ox64 Linux into a microSD Card...

# Boot Linux on Ox64 BL808

![Ox64 Linux in a microSD Card](https://lupyuen.github.io/images/ox64-sd.jpg)

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

Now that D0 Multimedia Core is flashed with OpenSBI and U-Boot Bootloader, we're ready to boot Linux on microSD!

Based on the [Official Flashing Instructions](https://github.com/openbouffalo/buildroot_bouffalo#flashing-instructions)...

1.  Look for the microSD Image that we downloaded earlier...

    ```text
    sdcard-pine64_ox64_full_defconfig.img.xz
    ```

    Uncompress the file to get...

    ```text
    sdcard-pine64_ox64_full_defconfig.img
    ```

1.  Flash the uncompressed image to your microSD card.

    You can use [Balena Etcher](https://github.com/balena-io/etcher), GNOME Disks or `dd`.

1.  Insert the microSD Card into Ox64. (Pic above)

    ![Flashing UART](https://lupyuen.github.io/images/ox64-pinout2.jpg)

1.  Connect our USB Serial Adapter to __Ox64 Flashing UART__: (pic above)
    + Flashing UART TX is __GPIO 14__ (Physical Pin 1)
    + Flashing UART RX is __GPIO 15__ (Physical Pin 2)
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Start the USB Serial Terminal (Flashing UART).

    Unplug and replug the Micro USB Port.

    (Don't press the Boot Button!)

1.  On the USB Serial Terminal (Flashing UART) we should see the same thing as earlier...

    ```text
    [I][MAIN] Starting Mailbox Handlers
    [I][MBOX] Forwarding Interupt SDH (33) to D0 (0x58008bbc)
    [I][MBOX] Forwarding Interupt GPIO (60) to D0 (0x58008d0e)
    [I][MAIN] Running...
    [I][MBOX] Mailbox IRQ Stats:
    [I][MBOX] .Peripheral SDH (33): 0
    [I][MBOX] .Peripheral GPIO (60): 0
    [I][MBOX] Unhandled Interupts: 0 Unhandled Signals 0
    ```

    [(Source)](https://gist.github.com/lupyuen/52ccdf076ae294db26e837e6ffc4bafb)

    ![Serial Console](https://lupyuen.github.io/images/ox64-pinout3.jpg)

1.  Connect our USB Serial Adapter to __Ox64 Serial Console__: (pic above)
    + Serial Console TX is __GPIO 16__ (Physical Pin 32)
    + Serial Console RX is __GPIO 17__ (Physical Pin 31)
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Start the USB Serial Terminal (Serial Console).

    Unplug and replug the Micro USB Port.

    (Don't press the Boot Button!)

1.  On the USB Serial Terminal (Serial Console) we should see...

    ```text
    [I][] Powered by BouffaloLab
    [I][] Build:11:52:04,Mar  6 2023
    [I][] Copyright (c) 2023 OpenBouffalo team
    [I][] Copyright (c) 2022 Bouffalolab team
    [I][] dynamic memory init success,heap s[I][LowLoad] D0 start...
    [I][LowLoad] low_load start... 
    [I][LowLoad] Header at 0x5d5ff000
    [I][LowLoad] Section dtb(1) - Start 0x5d5ff100, Size 14314
    [I][LowLoad] Copying DTB to 0x51ff8000...0x51ffb7ea
    [I][LowLoad] Done!
    [I][LowLoad] Section OpenSBI(2) - Start 0x5d60f100, Size 109864
    [I][LowLoad] Copying OpenSBI to 0x3ef80000...0x3ef9ad28
    [I][LowLoad] Done!
    [I][LowLoad] Section Kernel(3) - Start 0x5d62f100, Size 315597
    [I][LowLoad] Uncompressing Kernel to 0x50000000...
    [I][LowLoad] Done!
    [I][LowLoad] CRC: 00000000
    [I][LowLoad] load time: 61306 us 
    [I][LowLoad] ing PMP
    [I][LowLoad] Booting OpenSBI at 0x000000003ef80000 with DTB at 0x51ff8000
    ...
    OpenSBI v1.2
    Platform Name             : Pine64 Ox64 (D0)
    Platform Features          medeleg
    Platform HART Count       : 1
    Platform IPI Device       : aclint-mswi
    Platform Timer Device     : aclint-mtimer @ 1000000Hz
    Platform Console Device   : bflb_uart
    Platform HSM Device       : ---
    Platform PMU Device       : ---
    Platform Reboot Device    : ---
    Platform Shutdown Device  : ---
    Firmware Base             : 0x3ef80000
    Firmware Size             : 200 KB
    Runtime SBI Version       : 1.0
    ...

    U-Boot 2023.04-rc2 (Mar 06 2023 - 11:48:40 +0000)
    DRAM:  64 MiB
    Core:  36 devices, 17 uclasses, devicetree: board
    MMC:   mmc@20060000: 0
    Loading Environment from FAT... Unable to read "uboot.env" from mmc0:2... 
    ...
    Starting kernel ...
    Linux version 6.2.0 (runner@fv-az587-938) (riscv64-unknown-linux-gnu-gcc (Xuantie-900 linux-5.10.4 glibc gcc Toolchain V2.6.1 B-20220906) 10.2.0, GNU ld (GNU Binutils) 2.35) #1 Mon Mar  6 11:17:27 UTC 2023
    ...
    Welcome to Buildroot
    ox64 login: 
    ```

    [(See the Complete Log)](https://gist.github.com/lupyuen/3035a70d52d2d1d529e96f5292f54210)

    [(Watch the Video on YouTube)](https://youtu.be/UJ_7DyHnfDA)

    Yep Linux is running on Ox64 yay! (Pic below)

1.  If nothing appears...

    Check that we are using [Bouffalo Lab DevCube 1.8.3](https://openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip)

    [(1.8.4 and later won't work)](https://github.com/openbouffalo/buildroot_bouffalo/issues/60)

    In BL Dev Cube, UART Rate (for MCU and IoT) should be 230400.

    Don't set to 2000000, it will fail on macOS!

    [(Same problem when flashing BL602)](https://lupyuen.github.io/articles/flash#flash-the-firmware)

1.  If we see...

    ```text
    U-Boot 2023.04-rc2 (Mar 06 2023 - 11:48:40 +0000)
    Card did not respond to voltage select! : -110
    BOOTP broadcast
    Retry time exceeded; starting again
    ```

    [(Source)](https://gist.github.com/lupyuen/0b1a98781e86ba11c5538eb1e3058718)

    Check that the microSD Card is inserted correctly. (Pic above)

1.  TODO: TFTP Boot over Ethernet

![Boot Linux on Ox64 BL808](https://lupyuen.github.io/images/ox64-title.jpg)

Comment by [@gamelaster](https://x.com/gamelaster/status/1719073156281798755?s=20)...

> "This is not hardware specific, but flasher specific. With blisp, I was able to get faster flashing working, but this is Apple's quirk. Or maybe not? Because FreeBSD need same quirks and exact buffer sizes as Apple."

Comment by [@madushan1000](https://x.com/madushan1000/status/1719069431580524720?s=20)...

> "You can also use u-boot. https://github.com/openbouffalo/u-boot/releases/tag/bl808-2023-02-19 
You can also get rid of mailbox, but you will have to build the kernel yourself https://github.com/openbouffalo/linux/tree/bl808/all"

# Forward Peripheral Interrupts

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

TODO

```text
[I][MAIN] Starting Mailbox Handlers
[I][MBOX] Forwarding Interupt SDH (33) to D0 (0x58008bbc)
[I][MBOX] Forwarding Interupt GPIO (60) to D0 (0x58008d0e)
[I][MAIN] Running...
[I][MBOX] Mailbox IRQ Stats:
[I][MBOX] .Peripheral SDH (33): 0
[I][MBOX] .Peripheral GPIO (60): 0
[I][MBOX] Unhandled Interupts: 0 Unhandled Signals 0
```

[(Source)](https://gist.github.com/lupyuen/52ccdf076ae294db26e837e6ffc4bafb)

SDH: SD Card (SDIO) Host Controller (BL808 RM Page 561)

IRQ 60: GPIO_INT0 (IRQ_NUM_BASE+44) GPIO Interrupt (BL808 RM Page 44)

[GPIO_INT0_IRQn](https://github.com/bouffalolab/bl808_linux/blob/main/bl_mcu_sdk_bl808/drivers/bl808_driver/regs/bl808.h#L123)

[SDH is IRQ 33: SDH_IRQn](https://github.com/bouffalolab/bl808_linux/blob/main/bl_mcu_sdk_bl808/drivers/bl808_driver/regs/bl808.h#L96)

IRQ_NUM_BASE is 16 (BL808 RM Page 45)

[m0_lowload](https://github.com/openbouffalo/OBLFR/tree/master/apps/m0_lowload)

[d0_lowload](https://github.com/openbouffalo/OBLFR/tree/master/apps/d0_lowload)

[Forward GPIO Interrupt](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L127-L135)

[Forward SDH Interrupt](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L95-L103)

[Setup SDH Interrupt](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L238C1-L257)

Other Interrupts (unused)
- [UART2](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L103-L111)
- [USB](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L111-L119)
- [EMAC](https://github.com/openbouffalo/OBLFR/blob/master/components/mailbox/src/oblfr_mailbox.c#L119-L127)

# Inspect the Linux Image for Ox64 BL808

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

_Will Apache NuttX RTOS boot on Ox64 BL808?_

Let's examine the Linux Kernel Image for Ox64, and we replicate the same format for NuttX. (Which is how we ported NuttX to 64-bit RISC-V Star64 JH7110 SBC)

We download the Ox64 Binaries...

- [bl808-linux-pine64_ox64_full_defconfig.tar.gz](https://github.com/openbouffalo/buildroot_bouffalo/releases/download/v1.0.1/bl808-linux-pine64_ox64_full_defconfig.tar.gz) 

From the latest Ox64 Linux Release...

- [openbouffalo/buildroot_bouffalo (Release v1.0.1)](https://github.com/openbouffalo/buildroot_bouffalo/releases/tag/v1.0.1)

Unzip it and mount the SD Card Image...

```bash
→ ls -l sdcard-pine64_ox64_full_defconfig     
-  13,154,816  Image
-       4,012  bl808-pine64-ox64.dtb
-       4,106  bl808-sipeed-m1s.dtb
-         350  boot-m1s.scr
-         352  boot-pine64.scr
-         352  boot.scr
d          96  extlinux
```

Dump the `Image` as hex...

```bash
→ hexdump sdcard-pine64_ox64_full_defconfig/Image
0000000 4d 5a 6f 10 20 08 01 00 00 00 20 00 00 00 00 00
0000010 00 80 cd 00 00 00 00 00 00 00 00 00 00 00 00 00
0000020 02 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
0000030 52 49 53 43 56 00 00 00 52 53 43 05 40 00 00 00
```

The Linux Kernel Image begins with this __RISC-V Linux Image Header__...

-   [__"Boot Image Header in RISC-V Linux"__](https://www.kernel.org/doc/html/latest/riscv/boot-image-header.html)

Here are the decoded bytes...

1.  __code0__: Executable code

    (4 bytes, offset `0x00`)

    ```text
    4d 5a 6f 10 
    ```

1.  __code1__: Executable code 

    (4 bytes, offset `0x04`)

    ```text
    20 08 01 00 
    ```

1.  __text_offset__: Image load offset, little endian

    (8 bytes, offset `0x08`)

    ```text
    00 00 20 00 00 00 00 00
    ```

1.  __image_size__: Effective Image size, little endian 

    (8 bytes, offset `0x10`)

    ```text
    00 80 cd 00 00 00 00 00
    ```

1.  __flags__: Kernel flags, little endian 

    (8 bytes, offset `0x18`)

    ```text
    00 00 00 00 00 00 00 00
    ```

1.  __version__: Version of this header (_MinL_ _MinM_ `.` _MajL_ _MajM_)

    (4 bytes, offset `0x20`)

    ```text
    02 00 00 00
    ```

1.  __res1__: Reserved

    (4 bytes, offset `0x24`)

    ```text
    00 00 00 00
    ```

1.  __res2__: Reserved

    (8 bytes, offset `0x28`)

    ```text
    00 00 00 00 00 00 00 00
    ```

1.  __magic__: Magic number, little endian, "RISCV\x00\x00\x00" 
    
    (8 bytes, offset `0x30`)

    ```text
    52 49 53 43 56 00 00 00
    ```

1.  __magic2__: Magic number 2, little endian, "RSC\x05" 

    (4 bytes, offset `0x38`)

    ```text
    52 53 43 05
    ```

1.  __res3__: Reserved for PE COFF offset

    (4 bytes, offset `0x3C`)
    
    ```text
    40 00 00 00
    ```

Our NuttX Kernel shall __recreate this RISC-V Linux Image Header__. (Total `0x40` bytes)

(Or U-Boot Bootloader might refuse to boot NuttX)

Header Values are exactly the same as Star64. (Except the Image Size and Executable Code, since the Jump Address is different)

Thus we simply reuse the code from NuttX Star64!

# Linux Device Tree for Ox64 BL808

Read the article...

-   ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

TODO: Dump the Device Tree

```text
dtc \
  -o bl808-pine64-ox64.dts \
  -O dts \
  -I dtb \
  bl808-pine64-ox64.dtb
```

Here's the Decompiled Device Tree: [bl808-pine64-ox64.dts](bl808-pine64-ox64.dts)

TODO: Transmit to UART3 at 0x30002000. Reuse the BL602 UART Driver for NuttX.

```text
serial@30002000 {
  compatible = "bflb,bl808-uart";
  reg = <0x30002000 0x1000>;
  interrupts = <0x14 0x04>;
  clocks = <0x04>;
  status = "okay";
  phandle = <0x0a>;
};
```

[(Source)](https://github.com/lupyuen/nuttx-ox64/blob/main/bl808-pine64-ox64.dts#L89-L96)

TODO: Forward the Interrupts from M0 Wireless Core to D0 Multimedia Core via Mailbox / IPC (Where are the addresses documented?)

```text
mailbox@30005000 {
  compatible = "bflb,bl808-ipc";
  reg = <
    0x30005000 0x20 
    0x30005020 0x20 
    0x2000a800 0x20 
    0x2000a820 0x20
  >;
  interrupts = <0x36 0x04>;
  interrupt-controller;
  #interrupt-cells = <0x03>;
  #mbox-cells = <0x02>;
  status = "okay";
  phandle = <0x03>;
};
```

[(Source)](https://github.com/lupyuen/nuttx-ox64/blob/main/bl808-pine64-ox64.dts#L118-L127)

TODO: Print Debug Logs with OpenSBI

# Boot Apache NuttX RTOS on Ox64 BL808

_What happens if we boot Star64 NuttX on Ox64 BL808?_

Let's find out!

```bash
## Download and build NuttX for Star64
git clone --branch ox64 https://github.com/lupyuen2/wip-pinephone-nuttx nuttx
git clone --branch ox64 https://github.com/lupyuen2/wip-pinephone-nuttx-apps apps
cd nuttx
tools/configure.sh star64:nsh
make

## Export the Binary Image to nuttx.bin
riscv64-unknown-elf-objcopy \
  -O binary \
  nuttx \
  nuttx.bin

## Copy to microSD
cp nuttx.bin Image
cp Image "/Volumes/NO NAME"
diskutil unmountDisk /dev/disk2
```

We boot Nuttx on Ox64 via microSD... But Ox64 shows absolutely nothing!

```text
Retrieving file: /extlinux/../Image
append: root=PARTLABEL=rootfs rootwait rw rootfstype=ext4 console=ttyS0,2000000 loglevel=8 earlycon=sbi
Retrieving file: /extlinux/../bl808-pine64-ox64.dtb
## Flattened Device Tree blob at 51ff8000
   Booting using the fdt blob at 0x51ff8000
Working FDT set to 51ff8000
   Loading Device Tree to 0000000053f22000, end 0000000053f25fab ... OK
Working FDT set to 53f22000
Starting kernel ...
```

[(Source)](https://gist.github.com/lupyuen/8134f17502db733ce87d6fa8b00eab55)

Let's print to the Serial Console in the NuttX Boot Code (in RISC-V Assembly)

TODO

# Documentation for Ox64 BL808

- ["Ox64 BL808 RISC-V SBC: Booting Linux and (maybe) Apache NuttX RTOS"](https://lupyuen.github.io/articles/ox64)

- ["Booting Linux on the Pine64 Ox64 SBC"](https://adventurist.me/posts/00317)

- [Pine64 Ox64 Wiki](https://wiki.pine64.org/wiki/Ox64)

- [Pine64 Ox64 Schematic](https://files.pine64.org/doc/ox64/PINE64_Ox64-Schematic-202221018.pdf)

- [OpenBouffalo Wiki](https://openbouffalo.org/index.php/Main_Page)

- [Linux Image + OpenSBI + U-Boot for BL808](https://github.com/openbouffalo/buildroot_bouffalo)

  [(Newer version?)](https://github.com/bouffalolab/buildroot_bouffalo)

- [BL808 Datasheet](https://github.com/bouffalolab/bl_docs/blob/main/BL808_DS/en/BL808_DS_1.2_en.pdf)

- [BL808 Reference Manual](https://github.com/bouffalolab/bl_docs/blob/main/BL808_RM/en/BL808_RM_en_1.3.pdf)

- [BL808 D0 Core: T-Head C906 480MHz 64-bit RISC-V CPU](https://www.t-head.cn/product/c906?lang=en)

  (Multimedia Core: MIPI CSI / DSI, Neural Proc Unit)

  Memory Mgmt Unit is Sv39, 128/256/512 TLB table entry. (Same as Star64?)

- [BL808 M0 Core: T-Head E907 320MHz 32-bit RISC-V CPU](https://www.t-head.cn/product/e907?lang=en)

  (Wireless + Peripherals Core: WiFi, BLE, BT, Zigbee, Audio)

- [BL808 LP Core: T-Head E902 150MHz 32-bit RISC-V CPU](https://www.t-head.cn/product/e902?lang=en)

  (Low Power Core)

From [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo):

* m0_lowload_bl808_m0.bin - This firmware runs on M0 and forwards interupts to the D0 for several peripherals
* d0_lowload_bl808_d0.bin - This is a very basic bootloader that loads opensbi, the kernel and dts files into ram
* bl808-firmware.bin - An image containing OpenSBI, Uboot and uboot dtb files. 
* sdcard-*.tar.xz - A tarball containing the rootfs for the image to be flashed to the SD card
