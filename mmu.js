// Based on
// https://lupyuen.github.io/articles/mmu#appendix-flush-the-mmu-cache-for-t-head-c906
// https://gist.github.com/lupyuen/def8fb96245643c046e5f3ad6c4e3ed0
// https://gist.github.com/lupyuen/8d5fb67ef5e174cacbb55121d04e4b10

console.log("mmu.js");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let all_addr = {};

function main() {
  // Allocate the Display Blocks for each address
  for (let pass = 0; pass < 2; pass++) {
    for (const i in log_lines) {
      // From `mmu_ln_setentry: ptlevel=1, lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000, mmuflags=0`
      // Extract `lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000`
      const line = log_lines[i];
      const fields = parse_line(line);
      if (!fields) { continue; }
      const { lnvaddr, paddr, vaddr } = fields;

      if (pass == 0) {
        // First Pass: Allocate the Display Blocks for each address
        console.log({ lnvaddr, paddr, vaddr });
        all_addr[lnvaddr] = 1;
        all_addr[paddr] = 1;
        all_addr[vaddr] = 1;  

      } else {
      }  
    }  
  }
  const keys = Object.keys(all_addr);
  const all_addr_len = keys.length;
  console.log({ all_addr_len });
  console.clear();

  window.setTimeout(()=>draw_log(0), 5_000);
}

// Draw Line i of the Log
function draw_log(i) {
  if (i >= log_lines.length) { console.log("Done!"); return; }
  const line = log_lines[i];
  const res = draw_line(line);
  if (!res) { draw_log(i + 1); return; }
  window.setTimeout(()=>draw_log(i + 1), 100);
}

let count = 0;

// Draw a Log Line
function draw_line(line) {
  // From `mmu_ln_setentry: ptlevel=1, lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000, mmuflags=0`
  // Extract `lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000`
  const fields = parse_line(line);
  if (!fields) { return null; }
  const { lnvaddr, paddr, vaddr } = fields;

  // Second Pass: Render the Display Blocks for each address
  // Draw: Boxes for lnvaddr, paddr, vaddr
  // Draw: lnvaddr line to vaddr
  // Draw: vaddr line to paddr (if vaddr != paddr)
  const keys = Object.keys(all_addr);
  const lindex = keys.indexOf(lnvaddr);
  const pindex = keys.indexOf(paddr);
  const vindex = keys.indexOf(vaddr);
  draw_block(lindex, count % 256, parseInt(count / 256), 64); count += 37;
  draw_block(pindex, count % 256, parseInt(count / 256), 128); count += 37;
  draw_block(vindex, count % 256, parseInt(count / 256), 192); count += 37;
  return fields;
}

// Parse a Log Line
function parse_line(line) {
  // From `mmu_ln_setentry: ptlevel=1, lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000, mmuflags=0`
  // Extract `lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000`
  if (!line.startsWith("mmu_ln_setentry:")) { return null; }
  console.log(line);
  const lnvaddr = line.split("lnvaddr=")[1].split(",")[0];
  const paddr = line.split("paddr=")[1].split(",")[0];
  const vaddr = line.split("vaddr=")[1].split(",")[0];  
  return { lnvaddr, paddr, vaddr };
}

// Render a block for `mmu_ln_setentry`
function draw_block(index, r, g, b) {
  const keys = Object.keys(all_addr);
  const all_addr_len = keys.length;
  const all_addr_len_sqrt = Math.ceil(Math.sqrt(all_addr_len));  // 26

  const block_width = Math.floor(canvas.width / all_addr_len_sqrt);
  const block_height = Math.floor(canvas.height / all_addr_len_sqrt);
  const width_in_blocks  = canvas.width / block_width;
  const height_in_blocks = canvas.height / block_height;
  const x = (index % width_in_blocks) * block_width;
  const y = parseInt(index / width_in_blocks) * block_height;
  ctx.fillStyle = `rgb(${r} ${g} ${b})`;
  ctx.fillRect(x, y, block_width, block_height);
  // console.log({ x, y, block_width, block_height });
}

// ctx.fillStyle = "yellow";
// ctx.fillRect(0, 0, canvas.width, canvas.height);
// ctx.fillStyle = "green";
// ctx.fillRect(10, 10, 150, 100);

// ctx.beginPath();
// ctx.moveTo(125, 125);
// ctx.lineTo(125, 45);
// ctx.lineTo(45, 125);
// ctx.closePath();
// ctx.stroke();

const log = `
Starting kernel ...
ABC
mmu_ln_map_region: ptlevel=1, lnvaddr=0x50406000, paddr=0, vaddr=0, size=0x40000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=1, lnvaddr=0x50406000, paddr=0, vaddr=0, mmuflags=0x8000000000000026
mmu_ln_map_region: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0000000, vaddr=0xe0000000, size=0x10000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0000000, vaddr=0xe0000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0200000, vaddr=0xe0200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0400000, vaddr=0xe0400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0600000, vaddr=0xe0600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0800000, vaddr=0xe0800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0a00000, vaddr=0xe0a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0c00000, vaddr=0xe0c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe0e00000, vaddr=0xe0e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1000000, vaddr=0xe1000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1200000, vaddr=0xe1200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1400000, vaddr=0xe1400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1600000, vaddr=0xe1600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1800000, vaddr=0xe1800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1a00000, vaddr=0xe1a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1c00000, vaddr=0xe1c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe1e00000, vaddr=0xe1e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2000000, vaddr=0xe2000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2200000, vaddr=0xe2200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2400000, vaddr=0xe2400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2600000, vaddr=0xe2600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2800000, vaddr=0xe2800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2a00000, vaddr=0xe2a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2c00000, vaddr=0xe2c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe2e00000, vaddr=0xe2e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3000000, vaddr=0xe3000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3200000, vaddr=0xe3200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3400000, vaddr=0xe3400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3600000, vaddr=0xe3600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3800000, vaddr=0xe3800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3a00000, vaddr=0xe3a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3c00000, vaddr=0xe3c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe3e00000, vaddr=0xe3e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4000000, vaddr=0xe4000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4200000, vaddr=0xe4200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4400000, vaddr=0xe4400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4600000, vaddr=0xe4600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4800000, vaddr=0xe4800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4a00000, vaddr=0xe4a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4c00000, vaddr=0xe4c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe4e00000, vaddr=0xe4e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5000000, vaddr=0xe5000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5200000, vaddr=0xe5200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5400000, vaddr=0xe5400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5600000, vaddr=0xe5600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5800000, vaddr=0xe5800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5a00000, vaddr=0xe5a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5c00000, vaddr=0xe5c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe5e00000, vaddr=0xe5e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6000000, vaddr=0xe6000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6200000, vaddr=0xe6200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6400000, vaddr=0xe6400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6600000, vaddr=0xe6600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6800000, vaddr=0xe6800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6a00000, vaddr=0xe6a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6c00000, vaddr=0xe6c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe6e00000, vaddr=0xe6e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7000000, vaddr=0xe7000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7200000, vaddr=0xe7200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7400000, vaddr=0xe7400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7600000, vaddr=0xe7600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7800000, vaddr=0xe7800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7a00000, vaddr=0xe7a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7c00000, vaddr=0xe7c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe7e00000, vaddr=0xe7e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8000000, vaddr=0xe8000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8200000, vaddr=0xe8200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8400000, vaddr=0xe8400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8600000, vaddr=0xe8600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8800000, vaddr=0xe8800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8a00000, vaddr=0xe8a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8c00000, vaddr=0xe8c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe8e00000, vaddr=0xe8e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9000000, vaddr=0xe9000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9200000, vaddr=0xe9200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9400000, vaddr=0xe9400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9600000, vaddr=0xe9600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9800000, vaddr=0xe9800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9a00000, vaddr=0xe9a00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9c00000, vaddr=0xe9c00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xe9e00000, vaddr=0xe9e00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xea000000, vaddr=0xea000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xea200000, vaddr=0xea200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xea400000, vaddr=0xea400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xea600000, vaddr=0xea600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xea800000, vaddr=0xea800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeaa00000, vaddr=0xeaa00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeac00000, vaddr=0xeac00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeae00000, vaddr=0xeae00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeb000000, vaddr=0xeb000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeb200000, vaddr=0xeb200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeb400000, vaddr=0xeb400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeb600000, vaddr=0xeb600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeb800000, vaddr=0xeb800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeba00000, vaddr=0xeba00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xebc00000, vaddr=0xebc00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xebe00000, vaddr=0xebe00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xec000000, vaddr=0xec000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xec200000, vaddr=0xec200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xec400000, vaddr=0xec400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xec600000, vaddr=0xec600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xec800000, vaddr=0xec800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeca00000, vaddr=0xeca00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xecc00000, vaddr=0xecc00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xece00000, vaddr=0xece00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xed000000, vaddr=0xed000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xed200000, vaddr=0xed200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xed400000, vaddr=0xed400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xed600000, vaddr=0xed600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xed800000, vaddr=0xed800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeda00000, vaddr=0xeda00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xedc00000, vaddr=0xedc00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xede00000, vaddr=0xede00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xee000000, vaddr=0xee000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xee200000, vaddr=0xee200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xee400000, vaddr=0xee400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xee600000, vaddr=0xee600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xee800000, vaddr=0xee800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeea00000, vaddr=0xeea00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeec00000, vaddr=0xeec00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xeee00000, vaddr=0xeee00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xef000000, vaddr=0xef000000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xef200000, vaddr=0xef200000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xef400000, vaddr=0xef400000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xef600000, vaddr=0xef600000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xef800000, vaddr=0xef800000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xefa00000, vaddr=0xefa00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xefc00000, vaddr=0xefc00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50404000, paddr=0xefe00000, vaddr=0xefe00000, mmuflags=0x8000000000000026
mmu_ln_setentry: ptlevel=1, lnvaddr=0x50406000, paddr=0x50404000, vaddr=0xe0000000, mmuflags=0x20
mmu_ln_setentry: ptlevel=2, lnvaddr=0x50405000, paddr=0x50402000, vaddr=0x50200000, mmuflags=0
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50200000, vaddr=0x50200000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50201000, vaddr=0x50201000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50202000, vaddr=0x50202000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50203000, vaddr=0x50203000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50204000, vaddr=0x50204000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50205000, vaddr=0x50205000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50206000, vaddr=0x50206000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50207000, vaddr=0x50207000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50208000, vaddr=0x50208000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50209000, vaddr=0x50209000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020a000, vaddr=0x5020a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020b000, vaddr=0x5020b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020c000, vaddr=0x5020c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020d000, vaddr=0x5020d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020e000, vaddr=0x5020e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5020f000, vaddr=0x5020f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50210000, vaddr=0x50210000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50211000, vaddr=0x50211000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50212000, vaddr=0x50212000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50213000, vaddr=0x50213000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50214000, vaddr=0x50214000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50215000, vaddr=0x50215000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50216000, vaddr=0x50216000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50217000, vaddr=0x50217000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50218000, vaddr=0x50218000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50219000, vaddr=0x50219000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021a000, vaddr=0x5021a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021b000, vaddr=0x5021b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021c000, vaddr=0x5021c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021d000, vaddr=0x5021d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021e000, vaddr=0x5021e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5021f000, vaddr=0x5021f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50220000, vaddr=0x50220000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50221000, vaddr=0x50221000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50222000, vaddr=0x50222000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50223000, vaddr=0x50223000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50224000, vaddr=0x50224000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50225000, vaddr=0x50225000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50226000, vaddr=0x50226000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50227000, vaddr=0x50227000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50228000, vaddr=0x50228000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50229000, vaddr=0x50229000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022a000, vaddr=0x5022a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022b000, vaddr=0x5022b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022c000, vaddr=0x5022c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022d000, vaddr=0x5022d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022e000, vaddr=0x5022e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5022f000, vaddr=0x5022f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50230000, vaddr=0x50230000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50231000, vaddr=0x50231000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50232000, vaddr=0x50232000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50233000, vaddr=0x50233000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50234000, vaddr=0x50234000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50235000, vaddr=0x50235000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50236000, vaddr=0x50236000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50237000, vaddr=0x50237000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50238000, vaddr=0x50238000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50239000, vaddr=0x50239000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023a000, vaddr=0x5023a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023b000, vaddr=0x5023b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023c000, vaddr=0x5023c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023d000, vaddr=0x5023d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023e000, vaddr=0x5023e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5023f000, vaddr=0x5023f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50240000, vaddr=0x50240000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50241000, vaddr=0x50241000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50242000, vaddr=0x50242000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50243000, vaddr=0x50243000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50244000, vaddr=0x50244000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50245000, vaddr=0x50245000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50246000, vaddr=0x50246000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50247000, vaddr=0x50247000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50248000, vaddr=0x50248000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50249000, vaddr=0x50249000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024a000, vaddr=0x5024a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024b000, vaddr=0x5024b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024c000, vaddr=0x5024c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024d000, vaddr=0x5024d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024e000, vaddr=0x5024e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5024f000, vaddr=0x5024f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50250000, vaddr=0x50250000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50251000, vaddr=0x50251000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50252000, vaddr=0x50252000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50253000, vaddr=0x50253000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50254000, vaddr=0x50254000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50255000, vaddr=0x50255000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50256000, vaddr=0x50256000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50257000, vaddr=0x50257000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50258000, vaddr=0x50258000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50259000, vaddr=0x50259000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025a000, vaddr=0x5025a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025b000, vaddr=0x5025b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025c000, vaddr=0x5025c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025d000, vaddr=0x5025d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025e000, vaddr=0x5025e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5025f000, vaddr=0x5025f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50260000, vaddr=0x50260000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50261000, vaddr=0x50261000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50262000, vaddr=0x50262000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50263000, vaddr=0x50263000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50264000, vaddr=0x50264000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50265000, vaddr=0x50265000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50266000, vaddr=0x50266000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50267000, vaddr=0x50267000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50268000, vaddr=0x50268000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50269000, vaddr=0x50269000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026a000, vaddr=0x5026a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026b000, vaddr=0x5026b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026c000, vaddr=0x5026c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026d000, vaddr=0x5026d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026e000, vaddr=0x5026e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5026f000, vaddr=0x5026f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50270000, vaddr=0x50270000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50271000, vaddr=0x50271000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50272000, vaddr=0x50272000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50273000, vaddr=0x50273000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50274000, vaddr=0x50274000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502e8000, vaddr=0x502e8000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502e9000, vaddr=0x502e9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ea000, vaddr=0x502ea000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502eb000, vaddr=0x502eb000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ec000, vaddr=0x502ec000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ed000, vaddr=0x502ed000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ee000, vaddr=0x502ee000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ef000, vaddr=0x502ef000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f0000, vaddr=0x502f0000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f1000, vaddr=0x502f1000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f2000, vaddr=0x502f2000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f3000, vaddr=0x502f3000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f4000, vaddr=0x502f4000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f5000, vaddr=0x502f5000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f6000, vaddr=0x502f6000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f7000, vaddr=0x502f7000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f8000, vaddr=0x502f8000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502f9000, vaddr=0x502f9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502fa000, vaddr=0x502fa000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502fb000, vaddr=0x502fb000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502fc000, vaddr=0x502fc000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502fd000, vaddr=0x502fd000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502fe000, vaddr=0x502fe000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x502ff000, vaddr=0x502ff000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50300000, vaddr=0x50300000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50301000, vaddr=0x50301000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50302000, vaddr=0x50302000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50303000, vaddr=0x50303000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50304000, vaddr=0x50304000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50305000, vaddr=0x50305000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50306000, vaddr=0x50306000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50307000, vaddr=0x50307000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50308000, vaddr=0x50308000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50309000, vaddr=0x50309000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030a000, vaddr=0x5030a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030b000, vaddr=0x5030b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030c000, vaddr=0x5030c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030d000, vaddr=0x5030d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030e000, vaddr=0x5030e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5030f000, vaddr=0x5030f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50310000, vaddr=0x50310000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50311000, vaddr=0x50311000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50312000, vaddr=0x50312000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50313000, vaddr=0x50313000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50314000, vaddr=0x50314000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50315000, vaddr=0x50315000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50316000, vaddr=0x50316000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50317000, vaddr=0x50317000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50318000, vaddr=0x50318000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50319000, vaddr=0x50319000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031a000, vaddr=0x5031a000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031b000, vaddr=0x5031b000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031c000, vaddr=0x5031c000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031d000, vaddr=0x5031d000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031e000, vaddr=0x5031e000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x5031f000, vaddr=0x5031f000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50320000, vaddr=0x50320000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50321000, vaddr=0x50321000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50322000, vaddr=0x50322000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50323000, vaddr=0x50323000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50324000, vaddr=0x50324000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x50325000, vaddr=0x50325000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503a9000, vaddr=0x503a9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503aa000, vaddr=0x503aa000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ab000, vaddr=0x503ab000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ac000, vaddr=0x503ac000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ad000, vaddr=0x503ad000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ae000, vaddr=0x503ae000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503af000, vaddr=0x503af000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b0000, vaddr=0x503b0000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b1000, vaddr=0x503b1000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b2000, vaddr=0x503b2000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b3000, vaddr=0x503b3000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b4000, vaddr=0x503b4000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b5000, vaddr=0x503b5000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b6000, vaddr=0x503b6000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b7000, vaddr=0x503b7000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b8000, vaddr=0x503b8000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503b9000, vaddr=0x503b9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ba000, vaddr=0x503ba000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503bb000, vaddr=0x503bb000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503bc000, vaddr=0x503bc000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503bd000, vaddr=0x503bd000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503be000, vaddr=0x503be000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503bf000, vaddr=0x503bf000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c0000, vaddr=0x503c0000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c1000, vaddr=0x503c1000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c2000, vaddr=0x503c2000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c3000, vaddr=0x503c3000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c4000, vaddr=0x503c4000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c5000, vaddr=0x503c5000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c6000, vaddr=0x503c6000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c7000, vaddr=0x503c7000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c8000, vaddr=0x503c8000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503c9000, vaddr=0x503c9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ca000, vaddr=0x503ca000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503cb000, vaddr=0x503cb000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503cc000, vaddr=0x503cc000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503cd000, vaddr=0x503cd000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503ce000, vaddr=0x503ce000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503cf000, vaddr=0x503cf000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d0000, vaddr=0x503d0000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d1000, vaddr=0x503d1000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d2000, vaddr=0x503d2000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d3000, vaddr=0x503d3000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d4000, vaddr=0x503d4000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d5000, vaddr=0x503d5000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d6000, vaddr=0x503d6000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d7000, vaddr=0x503d7000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d8000, vaddr=0x503d8000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503d9000, vaddr=0x503d9000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503da000, vaddr=0x503da000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503db000, vaddr=0x503db000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503dc000, vaddr=0x503dc000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503dd000, vaddr=0x503dd000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503de000, vaddr=0x503de000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503df000, vaddr=0x503df000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e0000, vaddr=0x503e0000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e1000, vaddr=0x503e1000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e2000, vaddr=0x503e2000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e3000, vaddr=0x503e3000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e4000, vaddr=0x503e4000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e5000, vaddr=0x503e5000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50402000, paddr=0x503e6000, vaddr=0x503e6000, mmuflags=0x2a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50527000, vaddr=0x50527000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50528000, vaddr=0x50528000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50529000, vaddr=0x50529000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052a000, vaddr=0x5052a000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052b000, vaddr=0x5052b000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052c000, vaddr=0x5052c000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052d000, vaddr=0x5052d000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052e000, vaddr=0x5052e000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5052f000, vaddr=0x5052f000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50530000, vaddr=0x50530000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50531000, vaddr=0x50531000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50532000, vaddr=0x50532000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50533000, vaddr=0x50533000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50534000, vaddr=0x50534000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50535000, vaddr=0x50535000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50536000, vaddr=0x50536000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50537000, vaddr=0x50537000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50538000, vaddr=0x50538000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50539000, vaddr=0x50539000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053a000, vaddr=0x5053a000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053b000, vaddr=0x5053b000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053c000, vaddr=0x5053c000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053d000, vaddr=0x5053d000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053e000, vaddr=0x5053e000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5053f000, vaddr=0x5053f000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50540000, vaddr=0x50540000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50541000, vaddr=0x50541000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50542000, vaddr=0x50542000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50543000, vaddr=0x50543000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50544000, vaddr=0x50544000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50545000, vaddr=0x50545000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50546000, vaddr=0x50546000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50547000, vaddr=0x50547000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50548000, vaddr=0x50548000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50549000, vaddr=0x50549000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054a000, vaddr=0x5054a000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054b000, vaddr=0x5054b000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054c000, vaddr=0x5054c000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054d000, vaddr=0x5054d000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054e000, vaddr=0x5054e000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5054f000, vaddr=0x5054f000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50550000, vaddr=0x50550000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50551000, vaddr=0x50551000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50552000, vaddr=0x50552000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50553000, vaddr=0x50553000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50554000, vaddr=0x50554000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50555000, vaddr=0x50555000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50556000, vaddr=0x50556000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50557000, vaddr=0x50557000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50558000, vaddr=0x50558000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50559000, vaddr=0x50559000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055a000, vaddr=0x5055a000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055b000, vaddr=0x5055b000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055c000, vaddr=0x5055c000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055d000, vaddr=0x5055d000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055e000, vaddr=0x5055e000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5055f000, vaddr=0x5055f000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50560000, vaddr=0x50560000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50561000, vaddr=0x50561000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50562000, vaddr=0x50562000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50563000, vaddr=0x50563000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50564000, vaddr=0x50564000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50565000, vaddr=0x50565000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50566000, vaddr=0x50566000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50567000, vaddr=0x50567000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50568000, vaddr=0x50568000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50569000, vaddr=0x50569000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056a000, vaddr=0x5056a000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056b000, vaddr=0x5056b000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056c000, vaddr=0x5056c000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056d000, vaddr=0x5056d000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056e000, vaddr=0x5056e000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x5056f000, vaddr=0x5056f000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50570000, vaddr=0x50570000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50571000, vaddr=0x50571000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50572000, vaddr=0x50572000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50573000, vaddr=0x50573000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50574000, vaddr=0x50574000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50575000, vaddr=0x50575000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50576000, vaddr=0x50576000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x50403000, paddr=0x50577000, vaddr=0x50577000, mmuflags=0x26
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50634000, vaddr=0x80218000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50635000, vaddr=0x80219000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50636000, vaddr=0x8021a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50637000, vaddr=0x8021b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50638000, vaddr=0x8021c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50639000, vaddr=0x8021d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063a000, vaddr=0x8021e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063b000, vaddr=0x8021f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063c000, vaddr=0x80220000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063d000, vaddr=0x80221000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063e000, vaddr=0x80222000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5063f000, vaddr=0x80223000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50640000, vaddr=0x80224000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50641000, vaddr=0x80225000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50642000, vaddr=0x80226000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50643000, vaddr=0x80227000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50644000, vaddr=0x80228000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50645000, vaddr=0x80229000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50646000, vaddr=0x8022a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50647000, vaddr=0x8022b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50648000, vaddr=0x8022c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50649000, vaddr=0x8022d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064a000, vaddr=0x8022e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064b000, vaddr=0x8022f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064c000, vaddr=0x80230000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064d000, vaddr=0x80231000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064e000, vaddr=0x80232000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5064f000, vaddr=0x80233000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50650000, vaddr=0x80234000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50651000, vaddr=0x80235000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50652000, vaddr=0x80236000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50653000, vaddr=0x80237000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50654000, vaddr=0x80238000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50655000, vaddr=0x80239000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50656000, vaddr=0x8023a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50657000, vaddr=0x8023b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50658000, vaddr=0x8023c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50659000, vaddr=0x8023d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065a000, vaddr=0x8023e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065b000, vaddr=0x8023f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065c000, vaddr=0x80240000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065d000, vaddr=0x80241000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065e000, vaddr=0x80242000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5065f000, vaddr=0x80243000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50660000, vaddr=0x80244000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50661000, vaddr=0x80245000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50662000, vaddr=0x80246000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50663000, vaddr=0x80247000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50664000, vaddr=0x80248000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50665000, vaddr=0x80249000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50666000, vaddr=0x8024a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50667000, vaddr=0x8024b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50668000, vaddr=0x8024c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50669000, vaddr=0x8024d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066a000, vaddr=0x8024e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066b000, vaddr=0x8024f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066c000, vaddr=0x80250000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066d000, vaddr=0x80251000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066e000, vaddr=0x80252000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x5066f000, vaddr=0x80253000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5061b000, paddr=0x50670000, vaddr=0x80254000, mmuflags=0x16
0030  d7 88 18 14 00 00 00 00 d7 8c 18 14 00 00 00 00  ................
0040  d7 90 18 14 00 00 00 00 d7 94 18 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x5061c000
up_addrenv_select: Before Update: *0x5061c000 is 0
up_addrenv_select: Before Update: *0x80200000 is 0
up_addrenv_select: Expected Values: *0x80200000 is 0x1, *0x5061c000 is 0x1 (not 0xffffffffffffffff)
up_addrenv_select: Actual Values: *0x80200000 is 0x1, *0x5061c000 is 0x1
elf_symname: Symbol has no name
elf_symvalue: SHN_UNDEF: Failed to get symbol name: -3
elf_relocateadd: Section 2 reloc 2: Undefined symbol[0] has no name: -3
mm_initialize: Heap: name=(null), start=0x80200000 size=528384
mm_addregion: [(null)] Region 1: base=0x802002a8 size=527696
up_exit: TCB=0x504098d0 exiting

NuttShell (NSH) NuttX-12.4.0
nsh> nx_start: CPU0: Beginning Idle Loop


nsh> 
nsh> getprime
posix_spawn: pid=0x80202978 path=getprime file_actions=0x80202980 attr=0x80202988 argv=0x80202a28
up_addrenv_create: textsize=0x27c0, datasize=0xc, heapsize=0x80000, addrenv=0x50409980
mmu_ln_setentry: ptlevel=1, lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000, mmuflags=0
mmu_ln_setentry: ptlevel=2, lnvaddr=0x5069e000, paddr=0x5069f000, vaddr=0x80100000, mmuflags=0
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a0000, vaddr=0x80100000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a1000, vaddr=0x80000000, mmuflags=0x1a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a2000, vaddr=0x80001000, mmuflags=0x1a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a3000, vaddr=0x80002000, mmuflags=0x1a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a4000, vaddr=0x80101000, mmuflags=0x16
mmu_ln_setentry: ptlevel=2, lnvaddr=0x5069e000, paddr=0x506a5000, vaddr=0x80200000, mmuflags=0
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506a6000, vaddr=0x80200000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506a7000, vaddr=0x80201000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506a8000, vaddr=0x80202000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506a9000, vaddr=0x80203000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506aa000, vaddr=0x80204000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ab000, vaddr=0x80205000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ac000, vaddr=0x80206000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ad000, vaddr=0x80207000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ae000, vaddr=0x80208000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506af000, vaddr=0x80209000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b0000, vaddr=0x8020a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b1000, vaddr=0x8020b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b2000, vaddr=0x8020c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b3000, vaddr=0x8020d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b4000, vaddr=0x8020e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b5000, vaddr=0x8020f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b6000, vaddr=0x80210000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b7000, vaddr=0x80211000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b8000, vaddr=0x80212000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506b9000, vaddr=0x80213000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ba000, vaddr=0x80214000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506bb000, vaddr=0x80215000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506bc000, vaddr=0x80216000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506bd000, vaddr=0x80217000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506be000, vaddr=0x80218000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506bf000, vaddr=0x80219000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c0000, vaddr=0x8021a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c1000, vaddr=0x8021b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c2000, vaddr=0x8021c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c3000, vaddr=0x8021d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c4000, vaddr=0x8021e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c5000, vaddr=0x8021f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c6000, vaddr=0x80220000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c7000, vaddr=0x80221000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c8000, vaddr=0x80222000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506c9000, vaddr=0x80223000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ca000, vaddr=0x80224000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506cb000, vaddr=0x80225000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506cc000, vaddr=0x80226000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506cd000, vaddr=0x80227000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ce000, vaddr=0x80228000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506cf000, vaddr=0x80229000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d0000, vaddr=0x8022a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d1000, vaddr=0x8022b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d2000, vaddr=0x8022c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d3000, vaddr=0x8022d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d4000, vaddr=0x8022e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d5000, vaddr=0x8022f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d6000, vaddr=0x80230000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d7000, vaddr=0x80231000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d8000, vaddr=0x80232000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506d9000, vaddr=0x80233000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506da000, vaddr=0x80234000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506db000, vaddr=0x80235000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506dc000, vaddr=0x80236000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506dd000, vaddr=0x80237000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506de000, vaddr=0x80238000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506df000, vaddr=0x80239000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e0000, vaddr=0x8023a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e1000, vaddr=0x8023b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e2000, vaddr=0x8023c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e3000, vaddr=0x8023d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e4000, vaddr=0x8023e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e5000, vaddr=0x8023f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e6000, vaddr=0x80240000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e7000, vaddr=0x80241000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e8000, vaddr=0x80242000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506e9000, vaddr=0x80243000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ea000, vaddr=0x80244000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506eb000, vaddr=0x80245000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ec000, vaddr=0x80246000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ed000, vaddr=0x80247000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ee000, vaddr=0x80248000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ef000, vaddr=0x80249000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f0000, vaddr=0x8024a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f1000, vaddr=0x8024b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f2000, vaddr=0x8024c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f3000, vaddr=0x8024d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f4000, vaddr=0x8024e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f5000, vaddr=0x8024f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f6000, vaddr=0x80250000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f7000, vaddr=0x80251000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f8000, vaddr=0x80252000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506f9000, vaddr=0x80253000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506fa000, vaddr=0x80254000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506fb000, vaddr=0x80255000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506fc000, vaddr=0x80256000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506fd000, vaddr=0x80257000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506fe000, vaddr=0x80258000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x506ff000, vaddr=0x80259000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50700000, vaddr=0x8025a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50701000, vaddr=0x8025b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50702000, vaddr=0x8025c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50703000, vaddr=0x8025d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50704000, vaddr=0x8025e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50705000, vaddr=0x8025f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50706000, vaddr=0x80260000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50707000, vaddr=0x80261000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50708000, vaddr=0x80262000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50709000, vaddr=0x80263000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070a000, vaddr=0x80264000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070b000, vaddr=0x80265000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070c000, vaddr=0x80266000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070d000, vaddr=0x80267000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070e000, vaddr=0x80268000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5070f000, vaddr=0x80269000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50710000, vaddr=0x8026a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50711000, vaddr=0x8026b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50712000, vaddr=0x8026c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50713000, vaddr=0x8026d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50714000, vaddr=0x8026e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50715000, vaddr=0x8026f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50716000, vaddr=0x80270000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50717000, vaddr=0x80271000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50718000, vaddr=0x80272000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50719000, vaddr=0x80273000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071a000, vaddr=0x80274000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071b000, vaddr=0x80275000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071c000, vaddr=0x80276000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071d000, vaddr=0x80277000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071e000, vaddr=0x80278000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x5071f000, vaddr=0x80279000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50720000, vaddr=0x8027a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50721000, vaddr=0x8027b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50722000, vaddr=0x8027c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50723000, vaddr=0x8027d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50724000, vaddr=0x8027e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50725000, vaddr=0x8027f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a5000, paddr=0x50726000, vaddr=0x80280000, mmuflags=0x16
mmu_satp_reg: pgbase=0x5069d000, asid=0x0, reg=0x800000000005069d
mmu_write_satp: reg=0x800000000005069d
up_addrenv_select: addrenv=0x50409980, satp=0x800000000005069d, l1_page_table=0x5069d000
*l1_page_table= (0x5069d000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 78 1a 14 00 00 00 00 21 10 10 14 00 00 00 00  .x......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x5069e000
*l2_page_table= (0x5069e000):
0000  01 7c 1a 14 00 00 00 00 01 94 1a 14 00 00 00 00  .|..............
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x506a5000
*l3_page_table= (0x506a5000):
0000  d7 98 1a 14 00 00 00 00 d7 9c 1a 14 00 00 00 00  ................
0010  d7 a0 1a 14 00 00 00 00 d7 a4 1a 14 00 00 00 00  ................
0020  d7 a8 1a 14 00 00 00 00 d7 ac 1a 14 00 00 00 00  ................
0030  d7 b0 1a 14 00 00 00 00 d7 b4 1a 14 00 00 00 00  ................
0040  d7 b8 1a 14 00 00 00 00 d7 bc 1a 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x506a6000
up_addrenv_select: Before Update: *0x506a6000 is 0
up_addrenv_select: Before Update: *0x80200000 is 0
up_addrenv_select: Expected Values: *0x80200000 is 0x1, *0x506a6000 is 0x1 (not 0xffffffffffffffff)
up_addrenv_select: Actual Values: *0x80200000 is 0x1, *0x506a6000 is 0x1
mmu_write_satp: reg=0x8000000000050600
up_addrenv_select: addrenv=0x5040b830, satp=0x8000000000050600, l1_page_table=0x50600000
*l1_page_table= (0x50600000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 04 18 14 00 00 00 00 21 10 10 14 00 00 00 00  ........!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x50601000
*l2_page_table= (0x50601000):
0000  01 08 18 14 00 00 00 00 01 6c 18 14 00 00 00 00  .........l......
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x5061b000
*l3_page_table= (0x5061b000):
0000  d7 70 18 14 00 00 00 00 d7 74 18 14 00 00 00 00  .p.......t......
0010  d7 78 18 14 00 00 00 00 d7 7c 18 14 00 00 00 00  .x.......|......
0020  d7 80 18 14 00 00 00 00 d7 84 18 14 00 00 00 00  ................
0030  d7 88 18 14 00 00 00 00 d7 8c 18 14 00 00 00 00  ................
0040  d7 90 18 14 00 00 00 00 d7 94 18 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x5061c000
up_addrenv_select: Before Update: *0x5061c000 is 0x40001
up_addrenv_select: Before Update: *0x80200000 is 0x40001
up_addrenv_select: Expected Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002 (not 0x40000)
up_addrenv_select: Actual Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002
mmu_write_satp: reg=0x800000000005069d
up_addrenv_select: addrenv=0x50409980, satp=0x800000000005069d, l1_page_table=0x5069d000
*l1_page_table= (0x5069d000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 78 1a 14 00 00 00 00 21 10 10 14 00 00 00 00  .x......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x5069e000
*l2_page_table= (0x5069e000):
0000  01 7c 1a 14 00 00 00 00 01 94 1a 14 00 00 00 00  .|..............
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x506a5000
*l3_page_table= (0x506a5000):
0000  d7 98 1a 14 00 00 00 00 d7 9c 1a 14 00 00 00 00  ................
0010  d7 a0 1a 14 00 00 00 00 d7 a4 1a 14 00 00 00 00  ................
0020  d7 a8 1a 14 00 00 00 00 d7 ac 1a 14 00 00 00 00  ................
0030  d7 b0 1a 14 00 00 00 00 d7 b4 1a 14 00 00 00 00  ................
0040  d7 b8 1a 14 00 00 00 00 d7 bc 1a 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x506a6000
up_addrenv_select: Before Update: *0x506a6000 is 0
up_addrenv_select: Before Update: *0x80200000 is 0
up_addrenv_select: Expected Values: *0x80200000 is 0x1, *0x506a6000 is 0x1 (not 0xffffffffffffffff)
up_addrenv_select: Actual Values: *0x80200000 is 0x1, *0x506a6000 is 0x1
elf_symname: Symbol has no name
elf_symvalue: SHN_UNDEF: Failed to get symbol name: -3
elf_relocateadd: Section 2 reloc 1: Undefined symbol[0] has no name: -3
mmu_write_satp: reg=0x8000000000050600
up_addrenv_select: addrenv=0x5040b830, satp=0x8000000000050600, l1_page_table=0x50600000
*l1_page_table= (0x50600000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 04 18 14 00 00 00 00 21 10 10 14 00 00 00 00  ........!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x50601000
*l2_page_table= (0x50601000):
0000  01 08 18 14 00 00 00 00 01 6c 18 14 00 00 00 00  .........l......
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x5061b000
*l3_page_table= (0x5061b000):
0000  d7 70 18 14 00 00 00 00 d7 74 18 14 00 00 00 00  .p.......t......
0010  d7 78 18 14 00 00 00 00 d7 7c 18 14 00 00 00 00  .x.......|......
0020  d7 80 18 14 00 00 00 00 d7 84 18 14 00 00 00 00  ................
0030  d7 88 18 14 00 00 00 00 d7 8c 18 14 00 00 00 00  ................
0040  d7 90 18 14 00 00 00 00 d7 94 18 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x5061c000
up_addrenv_select: Before Update: *0x5061c000 is 0x40001
up_addrenv_select: Before Update: *0x80200000 is 0x40001
up_addrenv_select: Expected Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002 (not 0x40000)
up_addrenv_select: Actual Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002
mmu_write_satp: reg=0x800000000005069d
up_addrenv_select: addrenv=0x50409980, satp=0x800000000005069d, l1_page_table=0x5069d000
*l1_page_table= (0x5069d000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 78 1a 14 00 00 00 00 21 10 10 14 00 00 00 00  .x......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x5069e000
*l2_page_table= (0x5069e000):
0000  01 7c 1a 14 00 00 00 00 01 94 1a 14 00 00 00 00  .|..............
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x506a5000
*l3_page_table= (0x506a5000):
0000  d7 98 1a 14 00 00 00 00 d7 9c 1a 14 00 00 00 00  ................
0010  d7 a0 1a 14 00 00 00 00 d7 a4 1a 14 00 00 00 00  ................
0020  d7 a8 1a 14 00 00 00 00 d7 ac 1a 14 00 00 00 00  ................
0030  d7 b0 1a 14 00 00 00 00 d7 b4 1a 14 00 00 00 00  ................
0040  d7 b8 1a 14 00 00 00 00 d7 bc 1a 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x506a6000
up_addrenv_select: Before Update: *0x506a6000 is 0
up_addrenv_select: Before Update: *0x80200000 is 0
up_addrenv_select: Expected Values: *0x80200000 is 0x1, *0x506a6000 is 0x1 (not 0xffffffffffffffff)
up_addrenv_select: Actual Values: *0x80200000 is 0x1, *0x506a6000 is 0x1
mm_initialize: Heap: name=(null), start=0x80200000 size=528384
mm_addregion: [(null)] Region 1: base=0x802002a8 size=527696
mmu_write_satp: reg=0x8000000000050600
up_addrenv_select: addrenv=0x5040b830, satp=0x8000000000050600, l1_page_table=0x50600000
*l1_page_table= (0x50600000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 04 18 14 00 00 00 00 21 10 10 14 00 00 00 00  ........!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x50601000
*l2_page_table= (0x50601000):
0000  01 08 18 14 00 00 00 00 01 6c 18 14 00 00 00 00  .........l......
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x5061b000
*l3_page_table= (0x5061b000):
0000  d7 70 18 14 00 00 00 00 d7 74 18 14 00 00 00 00  .p.......t......
0010  d7 78 18 14 00 00 00 00 d7 7c 18 14 00 00 00 00  .x.......|......
0020  d7 80 18 14 00 00 00 00 d7 84 18 14 00 00 00 00  ................
0030  d7 88 18 14 00 00 00 00 d7 8c 18 14 00 00 00 00  ................
0040  d7 90 18 14 00 00 00 00 d7 94 18 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x5061c000
up_addrenv_select: Before Update: *0x5061c000 is 0x40001
up_addrenv_select: Before Update: *0x80200000 is 0x40001
up_addrenv_select: Expected Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002 (not 0x40000)
up_addrenv_select: Actual Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002
mmu_write_satp: reg=0x800000000005069d
up_addrenv_select: addrenv=0x50409980, satp=0x800000000005069d, l1_page_table=0x5069d000
*l1_page_table= (0x5069d000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 78 1a 14 00 00 00 00 21 10 10 14 00 00 00 00  .x......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ...............
up_addrenv_select: l2_page_table=0x5069e000
*l2_page_table= (0x5069e000):
0000  01 7c 1a 14 00 00 00 00 01 94 1a 14 00 00 00 00  .|..............
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x506a5000
*l3_page_table= (0x506a5000):
0000  d7 98 1a 14 00 00 00 00 d7 9c 1a 14 00 00 00 00  ................
0010  d7 a0 1a 14 00 00 00 00 d7 a4 1a 14 00 00 00 00  ................
0020  d7 a8 1a 14 00 00 00 00 d7 ac 1a 14 00 00 00 00  ................
0030  d7 b0 1a 14 00 00 00 00 d7 b4 1a 14 00 00 00 00  ................
0040  d7 b8 1a 14 00 00 00 00 d7 bc 1a 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x506a6000
up_addrenv_select: Before Update: *0x506a6000 is 0x40001
up_addrenv_select: Before Update: *0x80200000 is 0x40001
up_addrenv_select: Expected Values: *0x80200000 is 0x40002, *0x506a6000 is 0x40002 (not 0x40000)
up_addrenv_select: Actual Values: *0x80200000 is 0x40002, *0x506a6000 is 0x40002
Set thread priority to 10
Set thread policy to SCHED_RR
Start thread #0
pthread_join: thread=7 group=0x50409b70
pthread_join: Thread is still running
thread #0 started, looking for primes < 10000, doing 10 run(s)
thread #0 finished, found 1230 primes, last one was 9973
nx_pthread_exit: exit_value=0
pthread_completejoin: pid=7 exit_value=0 group=0x50409b70
pthread_notifywaiters: pjoin=0x5040d320
pthread_join: exit_value=0
pthread_destroyjoin: pjoin=0x5040d320
pthread_join: Returning 0
Done
getprime took 0 msec
pthread_completejoin: pid=7 exit_value=0xffffffffffffffff group=0x50409b70
group_drop: Keep group 0x50409b70 (waiters > 0)
up_exit: TCB=0x50409a00 exiting
mmu_write_satp: reg=0x8000000000050600
up_addrenv_select: addrenv=0x5040b830, satp=0x8000000000050600, l1_page_table=0x50600000
*l1_page_table= (0x50600000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 04 18 14 00 00 00 00 21 10 10 14 00 00 00 00  .......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x50601000
*l2_page_table= (0x50601000):
0000  01 08 18 14 00 00 00 00 01 6c 18 14 00 00 00 00  .........l......
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x5061b000
*l3_page_table= (0x5061b000):
0000  d7 70 18 14 00 00 00 00 d7 74 18 14 00 00 00 00  .p.......t......
0010  d7 78 18 14 00 00 00 00 d7 7c 18 14 00 00 00 00  .x.......|......
0020  d7 80 18 14 00 00 00 00 d7 84 18 14 00 00 00 00  ................
0030  d7 88 18 14 00 00 00 00 d7 8c 18 14 00 00 00 00  ................
0040  d7 90 18 14 00 00 00 00 d7 94 18 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x5061c000
up_addrenv_select: Before Update: *0x5061c000 is 0x40001
up_addrenv_select: Before Update: *0x80200000 is 0x40001
up_addrenv_select: Expected Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002 (not 0x40000)
up_addrenv_select: Actual Values: *0x80200000 is 0x40002, *0x5061c000 is 0x40002
nsh> 
nsh> up_addrenv_destroy: Destroy addrenv=0x50409980

nsh> 
nsh> hello
posix_spawn: pid=0x80202978 path=hello file_actions=0x80202980 attr=0x80202988 argv=0x80202a28
up_addrenv_create: textsize=0xf24, datasize=0xc, heapsize=0x80000, addrenv=0x50409940
mmu_ln_setentry: ptlevel=1, lnvaddr=0x5069d000, paddr=0x5069e000, vaddr=0x80100000, mmuflags=0
mmu_ln_setentry: ptlevel=2, lnvaddr=0x5069e000, paddr=0x5069f000, vaddr=0x80100000, mmuflags=0
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a0000, vaddr=0x80100000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a1000, vaddr=0x80000000, mmuflags=0x1a
mmu_ln_setentry: ptlevel=3, lnvaddr=0x5069f000, paddr=0x506a2000, vaddr=0x80101000, mmuflags=0x16
mmu_ln_setentry: ptlevel=2, lnvaddr=0x5069e000, paddr=0x506a3000, vaddr=0x80200000, mmuflags=0
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a4000, vaddr=0x80200000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a5000, vaddr=0x80201000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a6000, vaddr=0x80202000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a7000, vaddr=0x80203000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a8000, vaddr=0x80204000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506a9000, vaddr=0x80205000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506aa000, vaddr=0x80206000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ab000, vaddr=0x80207000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ac000, vaddr=0x80208000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ad000, vaddr=0x80209000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ae000, vaddr=0x8020a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506af000, vaddr=0x8020b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b0000, vaddr=0x8020c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b1000, vaddr=0x8020d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b2000, vaddr=0x8020e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b3000, vaddr=0x8020f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b4000, vaddr=0x80210000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b5000, vaddr=0x80211000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b6000, vaddr=0x80212000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b7000, vaddr=0x80213000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b8000, vaddr=0x80214000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506b9000, vaddr=0x80215000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ba000, vaddr=0x80216000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506bb000, vaddr=0x80217000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506bc000, vaddr=0x80218000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506bd000, vaddr=0x80219000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506be000, vaddr=0x8021a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506bf000, vaddr=0x8021b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c0000, vaddr=0x8021c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c1000, vaddr=0x8021d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c2000, vaddr=0x8021e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c3000, vaddr=0x8021f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c4000, vaddr=0x80220000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c5000, vaddr=0x80221000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c6000, vaddr=0x80222000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c7000, vaddr=0x80223000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c8000, vaddr=0x80224000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506c9000, vaddr=0x80225000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ca000, vaddr=0x80226000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506cb000, vaddr=0x80227000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506cc000, vaddr=0x80228000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506cd000, vaddr=0x80229000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ce000, vaddr=0x8022a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506cf000, vaddr=0x8022b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d0000, vaddr=0x8022c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d1000, vaddr=0x8022d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d2000, vaddr=0x8022e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d3000, vaddr=0x8022f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d4000, vaddr=0x80230000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d5000, vaddr=0x80231000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d6000, vaddr=0x80232000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d7000, vaddr=0x80233000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d8000, vaddr=0x80234000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506d9000, vaddr=0x80235000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506da000, vaddr=0x80236000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506db000, vaddr=0x80237000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506dc000, vaddr=0x80238000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506dd000, vaddr=0x80239000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506de000, vaddr=0x8023a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506df000, vaddr=0x8023b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e0000, vaddr=0x8023c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e1000, vaddr=0x8023d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e2000, vaddr=0x8023e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e3000, vaddr=0x8023f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e4000, vaddr=0x80240000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e5000, vaddr=0x80241000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e6000, vaddr=0x80242000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e7000, vaddr=0x80243000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e8000, vaddr=0x80244000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506e9000, vaddr=0x80245000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ea000, vaddr=0x80246000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506eb000, vaddr=0x80247000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ec000, vaddr=0x80248000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ed000, vaddr=0x80249000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ee000, vaddr=0x8024a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ef000, vaddr=0x8024b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f0000, vaddr=0x8024c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f1000, vaddr=0x8024d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f2000, vaddr=0x8024e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f3000, vaddr=0x8024f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f4000, vaddr=0x80250000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f5000, vaddr=0x80251000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f6000, vaddr=0x80252000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f7000, vaddr=0x80253000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f8000, vaddr=0x80254000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506f9000, vaddr=0x80255000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506fa000, vaddr=0x80256000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506fb000, vaddr=0x80257000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506fc000, vaddr=0x80258000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506fd000, vaddr=0x80259000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506fe000, vaddr=0x8025a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x506ff000, vaddr=0x8025b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50700000, vaddr=0x8025c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50701000, vaddr=0x8025d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50702000, vaddr=0x8025e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50703000, vaddr=0x8025f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50704000, vaddr=0x80260000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50705000, vaddr=0x80261000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50706000, vaddr=0x80262000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50707000, vaddr=0x80263000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50708000, vaddr=0x80264000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50709000, vaddr=0x80265000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070a000, vaddr=0x80266000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070b000, vaddr=0x80267000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070c000, vaddr=0x80268000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070d000, vaddr=0x80269000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070e000, vaddr=0x8026a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5070f000, vaddr=0x8026b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50710000, vaddr=0x8026c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50711000, vaddr=0x8026d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50712000, vaddr=0x8026e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50713000, vaddr=0x8026f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50714000, vaddr=0x80270000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50715000, vaddr=0x80271000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50716000, vaddr=0x80272000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50717000, vaddr=0x80273000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50718000, vaddr=0x80274000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50719000, vaddr=0x80275000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071a000, vaddr=0x80276000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071b000, vaddr=0x80277000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071c000, vaddr=0x80278000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071d000, vaddr=0x80279000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071e000, vaddr=0x8027a000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x5071f000, vaddr=0x8027b000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50720000, vaddr=0x8027c000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50721000, vaddr=0x8027d000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50722000, vaddr=0x8027e000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50723000, vaddr=0x8027f000, mmuflags=0x16
mmu_ln_setentry: ptlevel=3, lnvaddr=0x506a3000, paddr=0x50724000, vaddr=0x80280000, mmuflags=0x16
mmu_satp_reg: pgbase=0x5069d000, asid=0x0, reg=0x800000000005069d
mmu_write_satp: reg=0x800000000005069d
up_addrenv_select: addrenv=0x50409940, satp=0x800000000005069d, l1_page_table=0x5069d000
*l1_page_table= (0x5069d000):
0000  e7 00 00 00 00 00 00 80 21 14 10 14 00 00 00 00  ........!.......
0010  01 78 1a 14 00 00 00 00 21 10 10 14 00 00 00 00  .x......!.......
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
up_addrenv_select: l2_page_table=0x5069e000
*l2_page_table= (0x5069e000):
0000  01 7c 1a 14 00 00 00 00 01 8c 1a 14 00 00 00 00  .|..............
0010  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0020  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0030  00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
0040  00 00 00 00 00 00 00 00 00 0 00 00 00 00 00 00  ................
up_addrenv_select: l3_page_table=0x506a3000
*l3_page_table= (0x506a3000):
0000  d7 90 1a 14 00 00 00 00 d7 94 1a 14 00 00 00 00  ................
0010  d7 98 1a 14 00 00 00 00 d7 9c 1a 14 00 00 00 00  ................
0020  d7 a0 1a 14 00 00 00 00 d7 a4 1a 14 00 00 00 00  ................
0030  d7 a8 1a 14 00 00 00 00 d7 ac 1a 14 00 00 00 00  ................
0040  d7 b0 1a 14 00 00 00 00 d7 b4 1a 14 00 00 00 00  ................
up_addrenv_select: Virtual Address 0x80200000 maps to Physical Address 0x506a4000
up_addrenv_select: Before Update: *0x506a4000 is 0
riscv_exception: EXCEPTION: Load page fault. MCAUSE: 000000000000000d, EPC: 000000005020c020, MTVAL: 0000000080200000
riscv_exception: PANIC!!! Exception = 000000000000000d
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed panic: at file: common/riscv_exception.c:85 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020c020
up_dump_register: A0: 0000000000000033 A1: 000000000000000a A2: 0000000000000010 A3: 0000000000000030
up_dump_register: A4: 000000000000000a A5: 000000000000000a A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 000000000000002e T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 00000000506a4000 S1: 0000000080200000 S2: 00000000006a4000 S3: 0000000010000000
up_dump_register: S4: 0000000000000000 S5: 0000000000000000 S6: 0000000000000000 S7: 0000000000000000
up_dump_register: S8: 0000000000000001 S9: 0000000000000000 S10: 0000000000000000 S11: 0000000000000000
up_dump_register: SP: 000000005040b130 FP: 00000000506a4000 TP: 0000000000000000 RA: 000000005020c01e
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
dump_stack:     sp: 0x5040b130
stack_dump: 0x5040b110: 00000000 00000000 00000000 00000000 00000009 00000000 00000000 00000000
stack_dump: 0x5040b130: 00000000 00000000 0005069d 80000000 00000009 00000000 00000016 00000000
stack_dump: 0x5040b150: 00000000 00000000 50401b38 00000000 00042022 00000002 5040b830 00000000
stack_dump: 0x5040b170: 50409940 00000000 50201912 00000000 00080000 00000000 00000000 00000000
stack_dump: 0x5040b190: 504098d0 00000000 5040b238 00000000 00000000 00000000 502144c4 00000000
stack_dump: 0x5040b1b0: 504098d0 00000000 5040b238 00000000 00000000 00000000 502146a6 00000000
stack_dump: 0x5040b1d0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b1f0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b210: 504098d0 00000000 00000000 00000000 fffffffe ffffffff 50213c4c 00000000
stack_dump: 0x5040b230: 00000000 00000000 80000000 00000000 80101000 00000000 00000f24 00000000
stack_dump: 0x5040b250: 0000000c 00000000 00000008 00000000 00000008 00000000 00081c80 00000000
stack_dump: 0x5040b270: 00000000 0000816d 464c457f 00010102 00000000 00000000 00f30001 00000001
stack_dump: 0x5040b290: 0000001a 00000000 00000000 00000000 00081540 00000000 00000005 00000040
stack_dump: 0x5040b2b0: 00400000 001c001d 00000000 00000000 5040bb00 00000000 00000000 00000000
stack_dump: 0x5040b2d0: 50409940 00000000 5040b830 00000000 00000000 00000000 00000401 00081c80
stack_dump: 0x5040b2f0: 5040a860 00000000 5040b7f0 00000000 00000000 00000000 50409f10 00000000
stack_dump: 0x5040b310: 504098d0 00000000 50400238 00000000 fffffffe ffffffff 50214de0 00000000
stack_dump: 0x5040b330: 00000000 00000000 00000000 00000000 50409f10 00000000 50408190 00000000
stack_dump: 0x5040b350: 802008c8 00000000 504098d0 00000000 fffffffe ffffffff 50214ec4 00000000
stack_dump: 0x5040b370: 504098c0 00000000 00000064 00000000 80200570 00000000 80202a28 00000000
stack_dump: 0x5040b390: 80202988 00000000 80202988 00000000 802008c8 00000000 504098d0 00000000
stack_dump: 0x5040b3b0: 00000000 00000000 50213ab8 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b3d0: 0000000a 00000000 0000000b 00000000 80015e48 00000000 80200570 00000000
stack_dump: 0x5040b3f0: 80202988 00000000 80202a28 00000000 80202978 00000000 802008c8 00000000
stack_dump: 0x5040b410: 00000000 00000000 5021839c 00000000 80202a9f 00000000 00000000 00000000
stack_dump: 0x5040b430: 80202a9f 00000000 00000000 00000000 80202a28 00000000 00000000 00000000
stack_dump: 0x5040b450: 802008c8 00000000 802005d0 00000000 00000000 00000000 50207768 00000000
stack_dump: 0x5040b470: 80202b40 00000000 502014f0 00000000 80004cb0 00000000 00000032 00000025
stack_dump: 0x5040b490: 502014d8 00000000 80004cb0 00000000 5040b490 00000000 00000000 00000000
stack_dump: 0x5040b4b0: 00000000 00000000 5020742e 00000000 80202988 00000000 000001ff 00000000
stack_dump: 0x5040b4d0: 00000000 00000000 802005d0 00000000 0000001b 00000000 80202978 00000000
stack_dump: 0x5040b4f0: 802008c8 00000000 80202980 00000000 80202988 00000000 80202a28 00000000
stack_dump: 0x5040b510: 80200570 00000000 80202a28 00000000 802008c8 00000000 00000000 00000000
stack_dump: 0x5040b530: 80202a28 00000000 00000000 00000000 80015e48 00000000 0000000b 00000000
stack_dump: 0x5040b550: 0000000a 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b570: 80202980 00000000 802008c8 00000000 80202978 00000000 0000002a 00000000
stack_dump: 0x5040b590: 00042120 00000002 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b5b0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b5d0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b5f0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b610: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b630: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b650: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x5040b670: 00000000 00000000 00000000 00000000 00000000 00000000 50203586 00000000
stack_dump: 0x5040b690: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_tasks:    PID GROUP PRI POLICY   TYPE    NPX STATE   EVENT      SIGMASK          STACKBASE  STACKSIZE      USED   FILLED    COMMAND
dump_tasks:   ----   --- --- -------- ------- --- ------- ---------- ---------------- 0x50400290      2048      1000    48.8%    irq
dump_task:       0     0   0 FIFO     Kthread - Ready              0000000000000000 0x50407010      3056       904    29.5%    Idle_Task
dump_task:       1     1 100 RR       Kthread - Waiting Semaphore  0000000000000000 0x5040a050      1968       736    37.3%    lpwork 0x50401a90 0x50401ab8
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000000 A7: fffffffffffffff8
up_dump_register: T0: 0000000050400cd0 T1: 0000000000000007 T2: 00000000000001ff T3: 0000000050400850
up_dump_register: T4: 0000000050400848 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000050201fc4 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 50401b50 00000000 50401b44 00000000 00000000 00000000
stack_dump: 0x50400a30: 50201fc4 00000000 50401b30 00000000 50400520 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 00042100 00000002
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 0000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 0000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Ja00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: commn/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000r: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 000000000000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((vod*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: 8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
sta000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 00000058
stack_dump: 0x50400930: 5040b8b0 00000000 504013d0 00000000 5021aea8 00000000 5021aed0 00000000
stack_dump: 0x50400950: 0000004f 00000000 7474754e 2e320058 00302e34 00000000 5021b0e8 00000000
stack_dump: 0x50400970: 3233c000 61613932 69642d65 20797472 206e614a 32203132 20343230 2e323100
stack_dump: 0x50400990: 00302e34 00000000 0000000a 00000000 3233000d 61613932 69642d65 20797472
stack_dump: 0x504009b0: 206e614a 32203132 20343230 303a3631 36353a38 00000000 00000000 00000000
stack_dump: 0x504009d0: 00000001 73697200 00762d63 00000000 00000000 00000000 00000000 00000000
stack_dump: 0x504009f0: 5040aaa0 00000000 80202c00 00000000 00000bc0 00000000 50401b30 00000000
stack_dump: 0x50400a10: 00042100 00000002 80202040 00000000 50400290 00000000 00000001 00000000
stack_dump: 0x50400a30: 00000001 00000000 50401b30 00000000 504006d0 00000000 50207c66 00000000
stack_dump: 0x50400a50: 5040af20 00000000 50200d80 00000000 5040b280 00000000 5040b8b0 00000000
stack_dump: 0x50400a70: 0000000d 00000000 50200894 00000000 5020b6b4 00000000 50200180 00000000
stack_dump: 0x50400a90: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
dump_stack: Kernel Stack:
dump_stack:   base: 0x5040aaa0
dump_stack:   size: 00003072
stack_dump: 0x5040b6a0: 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000
_assert: Current Version: NuttX  12.4.0 3229aae-dirty Jan 21 2024 16:08:56 risc-v
_assert: Assertion failed (g_current_regs[(0)]) == ((void*)0): at file: common/riscv_doirq.c:79 task: /system/bin/init process: /system/bin/init 0x8000004a
up_dump_register: EPC: 000000005020217e
up_dump_register: A0: 00000000504013d0 A1: 000000000000004f A2: 000000005021aea8 A3: 0000000200042100
up_dump_register: A4: 000000005040b8b0 A5: 000000005040af20 A6: 0000000000000009 A7: 0000000000000000
up_dump_register: T0: 0000000050400cd0 T1: 000000000000006a T2: 00000000000001ff T3: 000000000000006c
up_dump_register: T4: 0000000000000068 T5: 0000000000000009 T6: 000000000000002a
up_dump_register: S0: 0000000000000000 S1: 000000005040b8b0 S2: 0000000000000001 S3: 000000005040b8b0
up_dump_register: S4: 000000005021aea8 S5: 000000005021aed0 S6: 0000000200042100 S7: 0000000050401b30
up_dump_register: S8: 000000000000004f S9: 0000000080202c00 S10: 000000005040aaa0 S11: 0000000000000000
up_dump_register: SP: 0000000050400910 FP: 0000000000000000 TP: 0000000000000000 RA: 000000005020217e
dump_stack: IRQ Stack:
dump_stack:   base: 0x50400290
dump_stack:   size: 00002048
dump_stack:     sp: 0x50400910
stack_dump: 0x504008f0: 00000001 00000000 5040b8b0 00000000 50400910 00000000 502022b0 00000000
stack_dump: 0x50400910: 8000004a 00000000 5021b110 00000000 00000055 00000000 7474754e 
`;

const log_lines = log.split("\n");
console.log("mmu.js done!");
main();
