"""Reconstruit data/club2name.json depuis le classement OFFICIEL affiche par
MPP (source independante, lue sur le site) joint au rang->clubId de l'API.
Corrige notamment l'inversion France/Norvege (groupe I)."""
import json

# Classement rendu par MPP (rang 1..4), noms alignes sur le repo
RENDERED = {
    "A": ["Mexique", "Afrique du Sud", "Corée du Sud", "Tchéquie"],
    "B": ["Suisse", "Canada", "Bosnie-Herzégovine", "Qatar"],
    "C": ["Brésil", "Maroc", "Écosse", "Haïti"],
    "D": ["États-Unis", "Australie", "Paraguay", "Turquie"],
    "E": ["Allemagne", "Côte d'Ivoire", "Équateur", "Curaçao"],
    "F": ["Pays-Bas", "Japon", "Suède", "Tunisie"],
    "G": ["Belgique", "Égypte", "Iran", "Nouvelle-Zélande"],
    "H": ["Espagne", "Cap-Vert", "Uruguay", "Arabie saoudite"],
    "I": ["France", "Norvège", "Sénégal", "Irak"],
    "J": ["Argentine", "Autriche", "Algérie", "Jordanie"],
    "K": ["Colombie", "Portugal", "RD Congo", "Ouzbékistan"],
    "L": ["Angleterre", "Croatie", "Ghana", "Panama"],
}

mpp = json.load(open("data/mpp_knockout_raw.json"))
old = json.load(open("data/club2name.json"))

club2name = {}
for g, rows in mpp["groups"].items():
    rows = sorted(rows, key=lambda r: r["rank"])  # rang 1..4 -> clubId
    for r in rows:
        club2name[r["clubId"]] = RENDERED[g][r["rank"] - 1]

# Diff avec l'ancien mapping
changed = {c: (old.get(c), club2name[c]) for c in club2name if old.get(c) != club2name[c]}
print(f"club2name : {len(club2name)} equipes")
print(f"corrections vs ancien mapping : {len(changed)}")
for c, (o, n) in changed.items():
    print(f"  clubId {c} : {o} -> {n}")

json.dump(club2name, open("data/club2name.json", "w"), ensure_ascii=False, indent=0)
