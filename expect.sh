#!/usr/bin/expect
set send_slow {1 0.001}
spawn ./temu nuttx.cfg

expect "nsh> "
send -s "uname -a\r"

expect "nsh> "
send -s "ostest\r"

set timeout 120
expect {
  "ostest_main: Exiting with status 0" { exit 0 }
  timeout { exit 1 }
}
