#!/usr/bin/env python3
"""Atualiza o site da Sugar League. Rode na pasta do site:

  python atualizar.py listar
  python atualizar.py time add "Nome do time"
  python atualizar.py time remover "Nome do time"
  python atualizar.py jogo "Time A" "Time B" 3          (agenda confronto na rodada 3)
  python atualizar.py resultado "Time A" 2 1 "Time B"   (Time A venceu por 2x1)

Depois, atualize a página no navegador (F5)."""
import json, os, sys

F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.js")
VALIDOS = {(2, 0), (2, 1), (0, 2), (1, 2)}

def load():
    s = open(F, encoding="utf-8").read()
    return json.loads(s[s.index("{"):s.rindex("}") + 1])

def save(d):
    with open(F, "w", encoding="utf-8") as f:
        f.write("window.LIGA = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n")

def nome(d, x):
    for t in d["times"]:
        if t.lower() == x.lower():
            return t
    sys.exit(f'Time "{x}" não existe. Times: {", ".join(d["times"])}')

def main(a):
    if not a or a[0] == "-h":
        return print(__doc__)
    d, c = load(), a[0]
    if c == "listar":
        print("Times:", ", ".join(d["times"]))
        for g in d["jogos"]:
            pl = "a jogar" if g["sa"] is None else f'{g["sa"]}x{g["sb"]}'
            print(f'Rodada {g["rodada"]}: {g["a"]} vs {g["b"]} -> {pl}')
        return
    if c == "time" and len(a) == 3 and a[1] in ("add", "remover"):
        if a[1] == "add":
            if a[2].lower() in [t.lower() for t in d["times"]]:
                sys.exit("Esse time já existe.")
            d["times"].append(a[2])
        else:
            n = nome(d, a[2])
            d["times"].remove(n)
            d["jogos"] = [g for g in d["jogos"] if n not in (g["a"], g["b"])]
    elif c == "jogo" and len(a) == 4:
        d["jogos"].append({"rodada": int(a[3]), "a": nome(d, a[1]), "b": nome(d, a[2]), "sa": None, "sb": None})
    elif c == "resultado" and len(a) == 5:
        A, B, sa, sb = nome(d, a[1]), nome(d, a[4]), int(a[2]), int(a[3])
        if (sa, sb) not in VALIDOS:
            sys.exit("Placar inválido. Use 2 0, 2 1, 0 2 ou 1 2 (melhor de 3).")
        for g in d["jogos"]:
            if (g["a"], g["b"]) == (A, B):
                g["sa"], g["sb"] = sa, sb; break
            if (g["a"], g["b"]) == (B, A):
                g["sa"], g["sb"] = sb, sa; break
        else:
            d["jogos"].append({"rodada": max([g["rodada"] for g in d["jogos"]] or [1]), "a": A, "b": B, "sa": sa, "sb": sb})
    else:
        return print(__doc__)
    save(d)
    print("Ok. Atualize a página no navegador.")

main(sys.argv[1:])
