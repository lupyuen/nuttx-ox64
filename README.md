# Apache NuttX RTOS for Pine64 Ox64 64-bit RISC-V SBC (BouffaloLab BL808)

_What's this BL808?_ [(Datasheet)](https://github.com/bouffalolab/bl_docs/blob/main/BL808_DS/en/BL808_DS_1.2_en.pdf) [(Reference Manual)](https://github.com/bouffalolab/bl_docs/blob/main/BL808_RM/en/BL808_RM_en_1.3.pdf)

BL808 is a complex creature with 3 (Asymmetric) RISC-V Cores (linked via IPC)...

1.  D0 Core: [T-Head C906 64-bit RV64IMAFCV](https://www.t-head.cn/product/c906?lang=en) (480 MHz)

    (Multimedia Core with MIPI CSI / DSI, Neural Proc Unit)

    (Memory Mgmt Unit is Sv39, 128/256/512 TLB table entry. Same as Star64?)

1.  M0 Core: [T-Head E907 32-bit RV32IMAFCP](https://www.t-head.cn/product/e907?lang=en) (320 MHz)

    (Wireless + Peripherals Core with WiFi, BLE, BT, Zigbee, Audio)

1.  LP Core: [T-Head E902 32-bit RV32E[M]C](https://www.t-head.cn/product/e902?lang=en) (150 MHz)

    (Low Power Core)

[Pine64 Ox64](https://wiki.pine64.org/wiki/Ox64) is the dev board for BL808C.

(BL808C supports MIPI CSI Cameras but not MIPI DSI Displays. Maybe someday we'll see BL808D for MIPI DSI Displays)

_Is Ox64 BL808 an SBC? Or an MCU Board?_

Technically Ox64 BL808 boots 64-bit RISC-V Linux (via MicroSD), so it feels like an SBC...

- ["Booting Linux on the Pine64 Ox64 SBC"](https://adventurist.me/posts/00317)

- [OpenBouffalo Wiki](https://openbouffalo.org/index.php/Main_Page)

- [Linux Image + OpenSBI + U-Boot for BL808](https://github.com/openbouffalo/buildroot_bouffalo)

  [(Newer version?)](https://github.com/bouffalolab/buildroot_bouffalo)

- USB-C Port for Camera Module (Dual-Lane MIPI CSI)

  (USB-C is not for Flashing!)

- USB 2.0 Port for USB OTG

  (On-The-Go = USB Host + USB Device)

  (Nope not for Flashing either)

But Ox64 BL808 also feels like an MCU Board...

- Form Factor is similar to MCU Board

- Limited Memory: 64 MB of RAM, [128 Megabits](https://pine64.com/product/128mb-ox64-sbc-available-on-december-2-2022/) (16 MB) of Flash Memory

- UART Pins need a USB Serial Adapter for Flashing and Console I/O

- M0 Wireless Core is 32-bit RISC-V MCU

_Ox64 BL808 sounds a little tiny for 64-bit Linux?_

Yeah 64-bit Linux runs with Limited RAM on the D0 Multimedia Core. But most Peripherals are hosted on the M0 Wireless Core: WiFi, BLE, BT, Zigbee, Audio, ...

So we flash M0 with a simple 32-bit RISC-V Firmware, to forward the Peripheral Interrupts from M0 to D0 Linux.

Here are the binaries loaded into D0 Multimedia Core and M0 Wireless Core, from [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo)...

* __d0_lowload_bl808_d0.bin__: This is a very basic bootloader that loads opensbi, the kernel and dts files into ram

* __m0_lowload_bl808_m0.bin__: This firmware runs on M0 and forwards interupts to the D0 for several peripherals

* __bl808-firmware.bin__: A image containing OpenSBI, Uboot and uboot dtb files. 

* __sdcard-*.tar.xz__: A tarball containing the rootfs for the image to be flashed to the SD card

Perhaps Ox64 BL808 might run more efficiently with a tiny 64-bit RTOS.

_Why Apache NuttX RTOS?_

It might be interesting to run Apache NuttX RTOS on both the D0 Multimedia Core and the M0 Wireless Core. Then D0 and M0 can talk over OpenAMP (Asymmetric Multi-Processing).

Let's explore...

# Flash OpenSBI and U-Boot Bootloader to Ox64 BL808

Before booting Linux on Ox64, we flash OpenSBI + U-Boot Bootloader to D0 Multimedia Core, and the Peripheral Interrupt Firmware to M0 Wireless Core. From [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo):

* __d0_lowload_bl808_d0.bin__: This is a very basic bootloader that loads opensbi, the kernel and dts files into ram

* __m0_lowload_bl808_m0.bin__: This firmware runs on M0 and forwards interupts to the D0 for several peripherals

* __bl808-firmware.bin__: A image containing OpenSBI, Uboot and uboot dtb files. 

Here are the steps, based on the [Official Flashing Instructions](https://github.com/openbouffalo/buildroot_bouffalo#flashing-instructions)...

1.  We tested with [Pine64 Woodpecker CH340G USB Serial Adapter](https://pine64.com/product/serial-console-woodpecker-edition/) on macOS x64.

    Warning: Some USB Serial Adapters [WON'T WORK!](https://wiki.pine64.org/wiki/Ox64#Compatible_UARTs_when_in_bootloader_mode)

    Probably because we are connecting at 2 Mbps, which might be too fast for some USB Serial Adapters.

    [(Like this CP2102, which shows garbled text at 2 Mbps)](https://www.lazada.sg/products/i2037772272-s11135131253.html)

1.  Connect a USB Serial Adapter to __Ox64 Serial Console__:
    + Serial Console TX is physical pin 32 / GPIO 16
    + Serial Console RX is physical pin 31 / GPIO 17
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Power up Ox64 via the Micro USB Port. Ox64 Green LED should light up.

    TODO: What do we see in USB Serial Terminal?

    If the text appears garbled, try a different USB Serial Adapter. (See above)

1.  Connect a USB Serial Adapter to __Ox64 Flashing UART__:
    + Flashing UART TX is physical pin 1 / GPIO 14
    + Flashing UART RX is physical pin 2 / GPIO 15
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Power up Ox64 via the Micro USB Port. Ox64 Green LED should light up.

    We should see the Ox64 Factory Test Firmware in the USB Serial Terminal...

    ```text
    Simple Malloc 5120
    custom 0x0000
    flash init 0
    BLSP Boot2 start:Aug 25 2022,15:42:52
    Build Version: 3aa71dc-dirty
    Build Date: Sep 16 2022
    Build Time: 14:40:13
    [OS] Starting aos_loop_proc task...
    [OS] Starting OS Scheduler...
    [ERROR : bl_romfs.c: 129] romfs magic is NOT correct
    Init CLI with event Driven
    start aos loop... 
    CLI RAW Data, c906
    /romfs/c906.bin not found!
    ```

    [(Source)](https://gist.github.com/lupyuen/43676407bbced733e65566879e18732b)

    If the text appears garbled, try a different USB Serial Adapter. (See above)

    TODO: Verify this on shipped version of Ox64

1.  Initial Check: Set BL808 board to programming mode
    + Press and Hold BOOT Button
    + Unplug and replug the Micro USB Port
    + Release BOOT button

    We should see this in the USB Serial Terminal...

    ```text
    .
    ```

    Yep Ox64 is ready for flashing!

1.  Now we prepare to flash:

    Disconnect the USB Serial Terminal (to release the Flashing UART)

    Set BL808 board to programming mode
    + Press and Hold BOOT Button
    + Unplug and replug the Micro USB Port
    + Release BOOT button

1.  We'll run BouffaloLab DevCube for Flashing BL808.

    Only Ubuntu x64, macOS and Windows are supported.

    TODO: How to flash BL808 on Arm64 SBCs and Pinebook Pro? See [bflb-iot-tool / bflb-mcu-tool](https://wiki.pine64.org/wiki/Ox64#Alternative:_Open-Source_Flashing)

1.  Get DevCube **1.8.3** from...

    [openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip](https://openbouffalo.org/static-assets/bldevcube/BouffaloLabDevCube-v1.8.3.zip)

    Normal download location is [dev.bouffalolab.com/download](http://dev.bouffalolab.com/download) but [1.8.4 and later do not work](https://github.com/openbouffalo/buildroot_bouffalo/issues/60)

    TODO: Does latest version work?

1.  Run DevCube, select [BL808], and switch to [MCU] page

1.  M0 Group[Group0] Image Addr [0x58000000] [PATH to m0_lowload_bl808_m0.bin]

1.  D0 Group[Group0] Image Addr [0x58100000] [PATH to d0_lowload_bl808_d0.bin]

1.  Click 'Create & Download' and wait until it's done

1.  Switch to [IOT] page

1.  Enable 'Single Download', set Address with 0x800000, choose [bl808-firmware.bin]

1.  Click 'Create & Download' again and wait until it's done

TODO: Does it work?

# Boot Linux on Ox64 BL808

Now that D0 Multimedia Core is flashed with OpenSBI and U-Boot Bootloader, we're ready to boot Linux on microSD!

Based on the [Official Flashing Instructions](https://github.com/openbouffalo/buildroot_bouffalo#flashing-instructions)...

1.  Flash the sdcard-pine64-*.img.xz to your microSD card.

    You can use dd (after uncompressing) or [Balena Etcher](https://github.com/balena-io/etcher).

1.  Insert the microSD Card into Ox64.

    Unplug and replug the Micro USB Port.

1.  Connect USB Serial Adapter to __Ox64 Serial Console__:
    + Serial Console TX is physical pin 32 / GPIO 16
    + Serial Console RX is physical pin 31 / GPIO 17
    + Remember to connect GND
    + Baud 2,000,000 (2 Mbps)

    Power up Ox64 via the Micro USB Port. Ox64 Green LED should light up.

    TODO: What do we see in USB Serial Terminal?

# Inspect the Linux Image for Ox64 BL808

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

# Documentation for Ox64 BL808

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
* bl808-firmware.bin - A image containing OpenSBI, Uboot and uboot dtb files. 
* sdcard-*.tar.xz - A tarball containing the rootfs for the image to be flashed to the SD card
