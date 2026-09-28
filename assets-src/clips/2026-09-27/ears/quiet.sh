#!/bin/zsh
# Wait (up to $2 seconds, default 900) until the machine's 1-minute load average is under $1 (default 10), so a take
# isn't filmed while other workflows saturate the CPU. Prints the load it started at.
lim=${1:-10}; max=${2:-900}; t=0
while true; do
  l=$(sysctl -n vm.loadavg | awk '{print $2}')
  if (( $(echo "$l < $lim" | bc -l) )); then echo "load $l"; exit 0; fi
  if (( t >= max )); then echo "load still $l after ${max}s"; exit 1; fi
  /bin/sleep 10; t=$((t+10))
done
