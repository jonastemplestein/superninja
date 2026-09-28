// Find array literals (Say[] compositions) that mix a line clip with a variable clip (word/stretch/onset/sound/sounds)
// or a dynamically chosen line id (template literal / variable). Prints file:line, enclosing function, snippet.
import ts from "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/node_modules/typescript/lib/typescript.js";
import { readFileSync, readdirSync } from "fs";
const root = "/Users/jonastemplestein/src/github.com/jonastemplestein/superninja/src";
const files = [
  ...readdirSync(root + "/scenes").map((f) => "scenes/" + f),
  "content/teach.ts", "engine/feedback.ts", "ui/nav.tsx", "App.tsx", "ui/SoundBadge.tsx", "ui/Ninja.tsx", "content/games.ts", "content/narrative.ts", "content/warmups.ts", "content/instructions.ts", "content/stories.ts", "content/flower.ts",
].filter((f) => /\.(tsx?|ts)$/.test(f));
const VAR = new Set(["word", "stretch", "onset", "sound", "sounds", "story"]);
type Hit = { file: string; line: number; fn: string; kinds: string[]; lines: string[]; text: string };
const hits: Hit[] = [];
function fnName(n: ts.Node): string {
  let p: ts.Node | undefined = n.parent; const names: string[] = [];
  while (p) {
    if ((ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) && p.name) names.unshift(p.name.getText());
    else if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && p.parent) {
      const q = p.parent;
      if (ts.isVariableDeclaration(q)) names.unshift(q.name.getText());
      else if (ts.isPropertyAssignment(q)) names.unshift(q.name.getText());
    } else if (ts.isVariableDeclaration(p) && ts.isArrowFunction(p.initializer ?? ({} as any)) === false && ts.isIdentifier(p.name) && names.length === 0) {}
    p = p.parent;
  }
  return names.slice(-2).join(".") || "(top)";
}
for (const f of files) {
  let src: string; try { src = readFileSync(root + "/" + f, "utf8"); } catch { continue; }
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (n: ts.Node) => {
    if (ts.isArrayLiteralExpression(n)) {
      const kinds = new Set<string>(); const lines: string[] = [];
      const scan = (e: ts.Node) => {
        if (ts.isObjectLiteralExpression(e)) {
          for (const p of e.properties) {
            const k = p.name?.getText();
            if (!k) { if (ts.isSpreadAssignment(p)) kinds.add("spread-obj"); continue; }
            if (k === "line" && ts.isPropertyAssignment(p)) {
              const v = p.initializer;
              if (ts.isStringLiteral(v)) lines.push(v.text); else { lines.push("<" + v.getText().slice(0, 60) + ">"); kinds.add("dyn-line"); }
            } else if (k === "line" && ts.isShorthandPropertyAssignment(p)) { lines.push("<line>"); kinds.add("dyn-line"); }
            if (VAR.has(k)) kinds.add(k);
          }
        } else if (ts.isSpreadElement(e)) {
          const t = e.expression.getText();
          const m = t.match(/^L\((.+)\)$/);
          if (m) { const a = m[1]; if (/^["']/.test(a)) lines.push(a.replace(/["']/g, "")); else { lines.push("<" + a + ">"); kinds.add("dyn-line"); } }
          else if (/^(clip|S|W)\(/.test(t)) { kinds.add("helper:" + t.slice(0, 4)); }
          else kinds.add("spread:" + t.slice(0, 40));
        } else if (ts.isCallExpression(e)) {
          const t = e.getText(); if (/^S\(/.test(t)) kinds.add("sound"); else if (/^W\(/.test(t)) kinds.add("word"); else if (/^petal\(/.test(t) || /^pop\(/.test(t)) kinds.add("sound"); else kinds.add("call:" + t.slice(0, 30));
        } else if (ts.isConditionalExpression(e)) { scan(e.whenTrue); scan(e.whenFalse); }
        else if (ts.isParenthesizedExpression(e)) scan(e.expression);
        else if (ts.isArrayLiteralExpression(e)) {}
        else if (ts.isIdentifier(e)) kinds.add("id:" + e.getText());
      };
      for (const e of n.elements) {
        if (ts.isSpreadElement(e) && (ts.isConditionalExpression(e.expression) || ts.isParenthesizedExpression(e.expression))) {
          // ...(cond ? [..] : [..]) : scan inner arrays
          const inner = (x: ts.Node): void => { if (ts.isArrayLiteralExpression(x)) x.elements.forEach(scan); else if (ts.isConditionalExpression(x)) { inner(x.whenTrue); inner(x.whenFalse); } else if (ts.isParenthesizedExpression(x)) inner(x.expression); else scan(e); };
          inner(e.expression);
        } else scan(e);
      }
      const hasLine = lines.length > 0;
      const hasVar = [...kinds].some((k) => VAR.has(k) || k === "dyn-line" || k.startsWith("helper") || k.startsWith("spread:") || k.startsWith("id:"));
      if (hasLine && (hasVar || lines.length > 1)) {
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart());
        hits.push({ file: f, line: line + 1, fn: fnName(n), kinds: [...kinds], lines, text: n.getText().replace(/\s+/g, " ").slice(0, 260) });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
for (const h of hits) console.log(`${h.file}:${h.line}\t${h.fn}\t[${h.lines.join(", ")}]\t{${h.kinds.join(",")}}\t${h.text}`);
console.error("hits", hits.length);
