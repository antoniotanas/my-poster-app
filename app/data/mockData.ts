// app/data/mockData.ts
import { StyleTemplate } from '@/app/actions/analyzeStyle';

// Usa l'URL dell'immagine che ha generato questo layout (o quella che stavi testando)
export const MOCK_IMAGE_URL = "https://res.cloudinary.com/df6c6fogf/image/upload/v1764780610/my-poster-app/vertex-generations/img_1764780609419_301.png"; 

// Usa l'URL dell'immagine che ha generato questo layout (o quella che stavi testando)
export const MOCK_REFERENCE_URL = "https://res.cloudinary.com/df6c6fogf/image/upload/v1764502205/ustica-info-hub/events/img_1764502204130_33.jpg";

export const MOCK_STYLE_1: StyleTemplate = {
  styleDescription: "The background features a realistic underwater scene with varying depths. The artistic style is naturalistic photography, capturing the serene ambiance of the sea. The color palette is dominated by deep and vibrant blues, transitioning from a lighter, sun-dappled surface to darker, more mysterious depths. There are significant areas of rich, earthy greens and hints of brown and red from corals and algae on the seabed. Lighting is natural, with sunlight filtering through the water from above, creating a shimmering effect on the surface and illuminating a diver. The texture of the water shows subtle ripples and currents, while the seabed is rough and organic with dense, bushy marine flora. The overall mood is calm, adventurous, and educational, invoking a sense of natural wonder.",
  suggestedOverlayColor: "rgba(0,0,0,0.5)",
  layout: {
    title: {
      position: "top",
      align: "center",
      color: "#0055A4"
    },
    description: {
      position: "top",
      align: "center",
      color: "#85BB80"
    },
    location: {
      position: "top",
      align: "center",
      color: "#E07542"
    },
    agenda: {
      position: "center",
      align:  "center",
      color: "#000000ff"
    }
  },
  texts: {
    title: "Ustica Blue Lab",
    description: "Summer School teorico-pratica in Biologia Marina Applicata nelle Aree Marine Protette",
    location: "Area Marina Protetta Isola di Ustica-Piazza Umbertol Ustica",
     agenda: [],
  }
};

export const MOCK_STYLE: StyleTemplate = {
  styleDescription: "An artistic background featuring a deep, oceanic blue color palette, ranging from dark navy to lighter cerulean tones. The texture is reminiscent of a subtly distressed or brushed surface, possibly evoking an abstract interpretation of water, sky, or an aged fresco. There are organic, swirling patterns and faint, light blue or off-white marbling that create a sense of depth and movement. The lighting is soft and ambient, highlighting the textures without creating harsh shadows. The overall mood is serene, sophisticated, and somewhat mysterious, providing a rich, textured canvas for overlaid content.",
  suggestedOverlayColor: "rgba(0,0,0,0.5)",
  layout: {
    title: {
      position: "top",
      align: "center",
      color: "#FFFFFF"
    },
    description: {
      position: "top",
      align: "center",
      color: "#FFD700"
    },
    location: {
      position: "bottom",
      align: "center",
      color: "#FFFFFF"
    },
    agenda: {
      position: "center",
      align: "left",
      color: "#FFFFFF"
    }
  },
  texts: {
    title: "¡ART USTICA",
    description: "MUSICA, CULTURA E NATURA",
    location: "PIAZZA CAPITANO VITO LONGO",
    agenda: [
      "4 SETTEMBRE 2025",
      "ORE 18 - Il Dipinto Collettivo a cura di FABIO INGRASSIA",
      "ORE 22 - RENZO RUBINO CON LA SBANDA",
      "A seguire DJ SET DI MISSPIA",
      "5 SETTEMBRE 2025",
      "ORE 10 - WORKSHOP IMMERSIVO",
      "ORE 22 - IL MAGO DEL GELATO",
      "A seguire DJ SET DI MISSPIA",
      "6 SETTEMBRE 2025",
      "ORE 22 - MALIKA AYANE E ROY PACI",
      "A seguire DJ SET DI MISSPIA",
      "7 SETTEMBRE 2025",
      "ORE 22 - CRISTIANO GODANO",
      "A seguire DJ SET DI MISSPIA"
    ]
  }
};
