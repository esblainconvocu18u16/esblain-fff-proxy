import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Proxy multi-équipe FFF pour ES Blain
 * Accessible via :
 *   /api/fff/u18a
 *   /api/fff/u18b
 *   /api/fff/u16a
 */

export default async function handler(req, res) {
  const { equipe } = req.query; // ex: "u18a"

  const equipes = {
    u18a: {
      nom: "U18A",
      url: "https://epreuves.fff.fr/competition/club/502178-ent-s-de-blain/equipe/2025_1312_U19_2/equipe",
    },
    u18b: {
      nom: "U18B",
      url: "https://epreuves.fff.fr/competition/club/502178-ent-s-de-blain/equipe/2025_1312_U19_14/equipe",
    },
    u16a: {
      nom: "U16A",
      url: "https://epreuves.fff.fr/competition/club/502178-ent-s-de-blain/equipe/2025_1312_U17_13/equipe",
    },
  };

  if (!equipe || !equipes[equipe]) {
    return res.status(400).json({ error: "Équipe invalide. Utilise /api/fff/u18a, /u18b ou /u16a" });
  }

  const { nom, url } = equipes[equipe];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const matches = [];

    $(".calendar__line").each((i, el) => {
      const date = $(el).find(".calendar__date").text().trim();
      const adversaire = $(el).find(".calendar__opponent").text().trim();
      const score = $(el).find(".calendar__score").text().trim();
      const lieu = $(el).find(".calendar__place").text().trim();
      if (date) matches.push({ date, adversaire, score, lieu });
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      equipe: nom,
      club: "ENT S. de Blain",
      total: matches.length,
      matches,
    });
  } catch (err) {
    res.status(500).json({
      error: `Erreur lors de la récupération FFF pour ${nom}`,
      details: err.message,
    });
  }
}
