Built [pic-audit.ts](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/scripts/treadmill/pic-audit.ts) and ran the requested full audit. It checked 160 pictures and wrote [pics.json](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/pics-test/pics.json) and [pics-all.json](/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/playtest/runs/pics-test/pics-all.json). TypeScript and output checks passed. Results: **92 OK, 18 major, 5 minor, 45 polish**.

Cat, pin, and sun pass. **Sand does not fully pass**: Gemini names it “sandcastle” first (85%) and “sand” third (5%), so the requested rules mark it polish.

The worst 15 are major findings, ordered by the model’s probability for its top name:

| Picture | Top name | Probability |
|---|---|---:|
| tusk | elephant | 90% |
| jump | ninja | 80% |
| dot | ball | 75% |
| fog | tree | 75% |
| night | moon | 75% |
| crisp | potato | 70% |
| cub | bear | 70% |
| chimp | monkey | 65% |
| leg | shoe | 65% |
| nap | cat | 65% |
| sit | boy | 65% |
| vet | stethoscope | 65% |
| hob | pan | 60% |
| hot | soup | 60% |
| bulb | lightbulb | 55% |