"""
Calcul des classements de groupe et des qualifiés — CDM 2026.

Départage (règles FIFA, ordre simplifié) :
  1. points  2. différence de buts  3. buts marqués
  4. confrontation directe (points, diff, buts entre équipes à égalité)
  5. (puis fair-play / tirage — non simulé ; départage stable par nom à la fin)

Format 2026 : 32 qualifiés = 12 premiers + 12 deuxièmes + 8 meilleurs troisièmes.
"""
import pandas as pd


def _empty():
    return {"J": 0, "G": 0, "N": 0, "P": 0, "bp": 0, "bc": 0, "pts": 0}


def table_groupe(matchs):
    """matchs : liste de (dom, ext, buts_dom, buts_ext). Renvoie DataFrame classé."""
    st = {}
    for dom, ext, bd, be in matchs:
        for t in (dom, ext):
            st.setdefault(t, _empty())
        st[dom]["J"] += 1; st[ext]["J"] += 1
        st[dom]["bp"] += bd; st[dom]["bc"] += be
        st[ext]["bp"] += be; st[ext]["bc"] += bd
        if bd > be:
            st[dom]["G"] += 1; st[ext]["P"] += 1; st[dom]["pts"] += 3
        elif bd < be:
            st[ext]["G"] += 1; st[dom]["P"] += 1; st[ext]["pts"] += 3
        else:
            st[dom]["N"] += 1; st[ext]["N"] += 1
            st[dom]["pts"] += 1; st[ext]["pts"] += 1
    df = pd.DataFrame(st).T
    df["diff"] = df["bp"] - df["bc"]
    df = df.reset_index().rename(columns={"index": "equipe"})

    # Départage : pts, diff, bp globaux, puis mini-classement entre ex æquo.
    def h2h_key(group_df, equipe):
        tied = group_df["equipe"].tolist()
        sub = [(d, e, bd, be) for d, e, bd, be in matchs if d in tied and e in tied]
        mini = {t: _empty() for t in tied}
        for d, e, bd, be in sub:
            mini[d]["bp"] += bd; mini[d]["bc"] += be
            mini[e]["bp"] += be; mini[e]["bc"] += bd
            if bd > be: mini[d]["pts"] += 3
            elif bd < be: mini[e]["pts"] += 3
            else: mini[d]["pts"] += 1; mini[e]["pts"] += 1
        m = mini[equipe]
        return (m["pts"], m["bp"] - m["bc"], m["bp"])

    parts = []
    for pts, g in df.groupby("pts"):
        if len(g) > 1:
            g = g.copy()
            g["_h2h"] = g["equipe"].apply(lambda eq: h2h_key(g, eq))
            g = g.sort_values(["diff", "bp", "_h2h", "equipe"],
                              ascending=[False, False, False, True])
            g = g.drop(columns="_h2h")
        parts.append((pts, g))
    parts.sort(key=lambda x: x[0], reverse=True)
    out = pd.concat([g for _, g in parts], ignore_index=True)
    out.index = range(1, len(out) + 1)
    out.index.name = "rang"
    return out[["equipe", "J", "G", "N", "P", "bp", "bc", "diff", "pts"]]


def tous_classements(predictions):
    """predictions : DataFrame avec groupe, equipe_dom, equipe_ext, buts_dom, buts_ext."""
    res = {}
    for g, sub in predictions.groupby("groupe"):
        matchs = [(r.equipe_dom, r.equipe_ext, int(r.buts_dom), int(r.buts_ext))
                  for _, r in sub.iterrows()]
        res[g] = table_groupe(matchs)
    return res


def qualifies(classements):
    """Renvoie (premiers, deuxiemes, meilleurs_troisiemes, df_troisiemes_classes)."""
    premiers, deuxiemes, troisiemes = [], [], []
    for g, t in sorted(classements.items()):
        premiers.append((g, t.iloc[0]["equipe"]))
        deuxiemes.append((g, t.iloc[1]["equipe"]))
        r3 = t.iloc[2]
        troisiemes.append({"groupe": g, "equipe": r3["equipe"], "pts": int(r3["pts"]),
                           "diff": int(r3["diff"]), "bp": int(r3["bp"])})
    df3 = pd.DataFrame(troisiemes).sort_values(
        ["pts", "diff", "bp", "equipe"], ascending=[False, False, False, True]
    ).reset_index(drop=True)
    meilleurs3 = df3.head(8)
    return premiers, deuxiemes, meilleurs3, df3


if __name__ == "__main__":
    pred = pd.read_csv("data/predictions.csv")
    cls = tous_classements(pred)
    p1, p2, m3, df3 = qualifies(cls)
    for g, t in sorted(cls.items()):
        print(f"\n=== Groupe {g} ===")
        print(t.to_string())
    print("\n=== Meilleurs 3es (8 qualifiés) ===")
    print(df3.to_string(index=False))
    qualifs = [e for _, e in p1] + [e for _, e in p2] + m3["equipe"].tolist()
    print(f"\nNb qualifiés: {len(qualifs)}")
