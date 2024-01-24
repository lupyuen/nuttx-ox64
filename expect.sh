#!/usr/bin/expect

## For every 1 character sent, wait 0.001 milliseconds
set send_slow {1 0.001}

## Start the Ox64 BL808 Emulator
spawn ./temu nuttx.cfg

## Wait for the prompt and enter `uname -a`
expect "nsh> "
send -s "uname -a\r"

## Wait for the prompt and enter `ostest`
expect "nsh> "
send -s "ostest\r"

## Wait at most 120 seconds
set timeout 120

## Check the response...
expect {
  ## If we see this message, exit normally
  "ostest_main: Exiting with status -1" { exit 0 }

  ## If timeout, exit with an error
  timeout { exit 1 }
}
