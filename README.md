# Apache NuttX RTOS for Pine64 Ox64 64-bit RISC-V SBC (BouffaloLab BL808)

_Will Apache NuttX RTOS boot on Ox64 BL808?_

Let's examine the Linux Kernel Image for Ox64, and we replicate the same format for NuttX.

We download...

- [bl808-linux-pine64_ox64_full_defconfig.tar.gz](https://github.com/openbouffalo/buildroot_bouffalo/releases/download/v1.0.1/bl808-linux-pine64_ox64_full_defconfig.tar.gz) 

From the latest Ox64 Linux release...

- [openbouffalo/buildroot_bouffalo/releases/tag/v1.0.1](https://github.com/openbouffalo/buildroot_bouffalo/releases/tag/v1.0.1)

Unzip and mount the SD Card Image.

```bash
→ ls -l /Users/Luppy/ox64/sdcard-pine64_ox64_full_defconfig     
total 25744
-rwxrwxrwx@ 1 Luppy  staff  13154816 Mar  6  2023 Image
-rwxrwxrwx@ 1 Luppy  staff      4012 Mar  6  2023 bl808-pine64-ox64.dtb
-rwxrwxrwx@ 1 Luppy  staff      4106 Mar  6  2023 bl808-sipeed-m1s.dtb
-rwxrwxrwx@ 1 Luppy  staff       350 Mar  6  2023 boot-m1s.scr
-rwxrwxrwx@ 1 Luppy  staff       352 Mar  6  2023 boot-pine64.scr
-rwxrwxrwx@ 1 Luppy  staff       352 Mar  6  2023 boot.scr
drwxrwxrwx@ 3 Luppy  staff        96 Mar  6  2023 extlinux
```

Dump the `Image` as hex...

```bash
→ hexdump /Users/Luppy/ox64/sdcard-pine64_ox64_full_defconfig/Image | mor
e
0000000 4d 5a 6f 10 20 08 01 00 00 00 20 00 00 00 00 00
0000010 00 80 cd 00 00 00 00 00 00 00 00 00 00 00 00 00
0000020 02 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
0000030 52 49 53 43 56 00 00 00 52 53 43 05 40 00 00 00
0000040 50 45 00 00 64 50 02 00 00 00 00 00 00 00 00 00
0000050 00 00 00 00 a0 00 06 02 0b 02 02 14 00 f0 5f 00
0000060 00 80 6d 00 00 00 00 00 3e 2a 42 00 00 10 00 00
0000070 00 00 00 00 00 00 00 00 00 10 00 00 00 02 00 00
0000080 00 00 00 00 01 00 01 00 00 00 00 00 00 00 00 00
0000090 00 80 cd 00 00 10 00 00 00 00 00 00 0a 00 00 00
00000a0 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
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
    aaaa 00  C0  56  01  00  00  00  00
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

Header Values are exactly the same as Star64. (Except the Executable Code, since the Jump Address is different)

TODO