# -*- coding: utf-8 -*-
"""Ajoute la colonne kickoff_utc (instant réel du coup d'envoi) à data/fixtures.csv.
Horaires best-effort (sources ESPN/CBS/FIFA/Sky, juin 2026) — indicatifs, à confirmer.
CEST = UTC + 2h (dérivé à l'affichage)."""
import pandas as pd

KICKOFF_UTC = {
 ("Mexique","Afrique du Sud"):"2026-06-11T19:00",
 ("Corée du Sud","Tchéquie"):"2026-06-12T02:00",
 ("Canada","Bosnie-Herzégovine"):"2026-06-12T19:00",
 ("États-Unis","Paraguay"):"2026-06-12T19:00",
 ("Qatar","Suisse"):"2026-06-13T19:00",
 ("Brésil","Maroc"):"2026-06-13T22:00",
 ("Haïti","Écosse"):"2026-06-14T01:00",
 ("Australie","Turquie"):"2026-06-14T01:00",
 ("Allemagne","Curaçao"):"2026-06-14T17:00",
 ("Pays-Bas","Japon"):"2026-06-14T20:00",
 ("Côte d'Ivoire","Équateur"):"2026-06-14T23:00",
 ("Suède","Tunisie"):"2026-06-15T02:00",
 ("Espagne","Cap-Vert"):"2026-06-15T16:00",
 ("Belgique","Égypte"):"2026-06-15T19:00",
 ("Arabie saoudite","Uruguay"):"2026-06-15T22:00",
 ("Iran","Nouvelle-Zélande"):"2026-06-16T01:00",
 ("France","Sénégal"):"2026-06-16T19:00",
 ("Irak","Norvège"):"2026-06-16T22:00",
 ("Argentine","Algérie"):"2026-06-17T01:00",
 ("Autriche","Jordanie"):"2026-06-17T04:00",
 ("Portugal","RD Congo"):"2026-06-17T17:00",
 ("Angleterre","Croatie"):"2026-06-17T20:00",
 ("Ghana","Panama"):"2026-06-17T23:00",
 ("Ouzbékistan","Colombie"):"2026-06-18T02:00",
 ("Tchéquie","Afrique du Sud"):"2026-06-18T16:00",
 ("Suisse","Bosnie-Herzégovine"):"2026-06-18T19:00",
 ("Canada","Qatar"):"2026-06-18T22:00",
 ("Mexique","Corée du Sud"):"2026-06-19T01:00",
 ("Écosse","Maroc"):"2026-06-19T22:00",
 ("États-Unis","Australie"):"2026-06-19T19:00",
 ("Brésil","Haïti"):"2026-06-20T01:00",
 ("Turquie","Paraguay"):"2026-06-20T04:00",
 ("Allemagne","Côte d'Ivoire"):"2026-06-20T20:00",
 ("Pays-Bas","Suède"):"2026-06-20T17:00",
 ("Équateur","Curaçao"):"2026-06-21T00:00",
 ("Tunisie","Japon"):"2026-06-21T04:00",
 ("Espagne","Arabie saoudite"):"2026-06-21T16:00",
 ("Belgique","Iran"):"2026-06-21T19:00",
 ("Uruguay","Cap-Vert"):"2026-06-21T22:00",
 ("Nouvelle-Zélande","Égypte"):"2026-06-22T01:00",
 ("France","Irak"):"2026-06-22T21:00",
 ("Argentine","Autriche"):"2026-06-22T17:00",
 ("Norvège","Sénégal"):"2026-06-23T00:00",
 ("Jordanie","Algérie"):"2026-06-23T03:00",
 ("Portugal","Ouzbékistan"):"2026-06-23T17:00",
 ("Angleterre","Ghana"):"2026-06-23T20:00",
 ("Panama","Croatie"):"2026-06-23T23:00",
 ("Colombie","RD Congo"):"2026-06-24T02:00",
 ("Suisse","Canada"):"2026-06-24T19:00",
 ("Bosnie-Herzégovine","Qatar"):"2026-06-24T19:00",
 ("Écosse","Brésil"):"2026-06-24T22:00",
 ("Maroc","Haïti"):"2026-06-24T22:00",
 ("Tchéquie","Mexique"):"2026-06-25T01:00",
 ("Afrique du Sud","Corée du Sud"):"2026-06-25T01:00",
 ("Curaçao","Côte d'Ivoire"):"2026-06-25T20:00",
 ("Équateur","Allemagne"):"2026-06-25T20:00",
 ("Japon","Suède"):"2026-06-25T23:00",
 ("Tunisie","Pays-Bas"):"2026-06-25T23:00",
 ("Turquie","États-Unis"):"2026-06-26T02:00",
 ("Paraguay","Australie"):"2026-06-26T02:00",
 ("Norvège","France"):"2026-06-26T19:00",
 ("Sénégal","Irak"):"2026-06-26T19:00",
 ("Cap-Vert","Arabie saoudite"):"2026-06-27T00:00",
 ("Uruguay","Espagne"):"2026-06-27T00:00",
 ("Égypte","Iran"):"2026-06-27T03:00",
 ("Nouvelle-Zélande","Belgique"):"2026-06-27T03:00",
 ("Colombie","Portugal"):"2026-06-27T23:30",
 ("RD Congo","Ouzbékistan"):"2026-06-27T23:30",
 ("Panama","Angleterre"):"2026-06-27T21:00",
 ("Croatie","Ghana"):"2026-06-27T21:00",
 ("Jordanie","Argentine"):"2026-06-28T02:00",
 ("Algérie","Autriche"):"2026-06-28T02:00",
}

fx = pd.read_csv("data/fixtures.csv")
manquants = [(r.equipe_dom, r.equipe_ext) for _, r in fx.iterrows()
             if (r.equipe_dom, r.equipe_ext) not in KICKOFF_UTC]
if manquants:
    raise SystemExit(f"Horaires manquants: {manquants}")
fx["kickoff_utc"] = [KICKOFF_UTC[(r.equipe_dom, r.equipe_ext)] for _, r in fx.iterrows()]
# Heure CEST affichable (UTC+2)
cest = pd.to_datetime(fx["kickoff_utc"]) + pd.Timedelta(hours=2)
fx["kickoff_cest"] = cest.dt.strftime("%Y-%m-%d %H:%M")
fx.to_csv("data/fixtures.csv", index=False)
print(f"fixtures.csv mis à jour avec kickoff_utc/kickoff_cest ({len(fx)} matchs).")
