# Apache NuttX RTOS for Pine64 Ox64 64-bit RISC-V SBC (BouffaloLab BL808)

_Will Apache NuttX RTOS boot on Ox64 BL808?_

Let's examine the Linux Kernel Image for Ox64, and we replicate the same format for NuttX.

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

The Linux Kernel Image will begin with this __RISC-V Linux Image Header__...

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

TODO: Dump the Device Tree

TODO: Transmit to UART3. Reuse the BL602 UART Driver for NuttX.

TODO: Print Debug Logs with OpenSBI

- ["Booting Linux on the Pine64 Ox64 SBC"](https://adventurist.me/posts/00317)

- [OpenBouffalo Wiki](https://openbouffalo.org/index.php/Main_Page)

- [Linux Image for BL808](https://github.com/openbouffalo/buildroot_bouffalo)

  [(Newer version?)](https://github.com/bouffalolab/buildroot_bouffalo)

- [BL808 Datasheet](https://github.com/bouffalolab/bl_docs/blob/main/BL808_DS/en/BL808_DS_1.2_en.pdf)

- [BL808 Reference Manual](https://github.com/bouffalolab/bl_docs/blob/main/BL808_RM/en/BL808_RM_en_1.3.pdf)

- [BL808 D0 Core: T-Head C906 480MHz 64-bit RISC-V CPU](https://www.t-head.cn/product/c906?lang=en)

  (Multimedia Core)

- [BL808 M0 Core: T-Head E907 320MHz 32-bit RISC-V CPU](https://www.t-head.cn/product/e907?lang=en)

  (Wireless Core)

- [BL808 LP Core: T-Head E902 150MHz 32-bit RISC-V CPU](https://www.t-head.cn/product/e902?lang=en)

  (Low Power Core)

From [buildroot_bouffalo](https://github.com/openbouffalo/buildroot_bouffalo):

* m0_lowload_bl808_m0.bin - This firmware runs on M0 and forwards interupts to the D0 for several peripherals
* d0_lowload_bl808_d0.bin - This is a very basic bootloader that loads opensbi, the kernel and dts files into ram
* bl808-firmware.bin - A image containing OpenSBI, Uboot and uboot dtb files. 
* sdcard-*.tar.xz - A tarball containing the rootfs for the image to be flashed to the SD card
