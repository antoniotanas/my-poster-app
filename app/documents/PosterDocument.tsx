// app/documents/PosterDocument.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { StyleTemplate } from '@/app/actions/analyzeStyle';

// --- REGISTER FONTS ---
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Definiamo un tipo specifico per l'allineamento flex valido in React-PDF
type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type TextAlignType = 'left' | 'right' | 'center' | 'justify';
// --- HELPER FUNCTIONS ---
// Converte l'allineamento testuale (left/center/right) in Flexbox (alignItems)
const getFlexAlign = (align: string): FlexAlignType => {
  switch (align) {
    case 'left': return 'flex-start';
    case 'right': return 'flex-end';
    default: return 'center';
  }
};

// Converte l'allineamento testuale in proprietà textAlign per <Text>
// React-PDF accetta 'left' | 'right' | 'center' | 'justify'
const getTextAlign = (align: string): TextAlignType => {
  switch (align) {
    case 'left': return 'left';
    case 'right': return 'right';
    default: return 'center';
  }
};


// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
    position: 'relative',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  fallbackBgColor: {
    backgroundColor: '#333333',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
  },
  contentContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },

  // TEXT STYLES
  title: {
    fontSize: 42,
    fontWeight: 700,
    textTransform: 'uppercase',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  descriptionBlock: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.2)', // Leggera ombra di sfondo per leggibilità
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  text: {
    fontSize: 14,
    lineHeight: 1.5,
  },

  // AGENDA SPECIFIC
  agendaItemWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  agendaBullet: {
    fontSize: 18,
    marginRight: 10,
    lineHeight: 1,
  },
  agendaItemText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 1.4,
    fontWeight: 500,
  },

  // DYNAMIC LAYOUT BLOCK
  sectionBlock: {
    position: 'relative',
    left: 4, // Padding laterale fisso
    right: 40,
  }
});

// --- PROPS INTERFACE ---
interface PosterData {
  title: string;
  description: string;
  agenda: string;
  location?: string;
  imageUrl: string | null;
  showBackground: boolean;
  layout?: StyleTemplate['layout'];
}

export const PosterDocument = ({ data }: { data: PosterData }) => {

  // 1. Default Layout se non fornito (es. prima generazione o errore)
  // Default layout esteso
  const layout = data.layout || {
    title: { position: 'top', align: 'center', color: 'red' },
    description: { position: 'top', align: 'center', color: 'red' }, // FORZIAMO TOP
    agenda: { position: 'center', align: 'center', color: 'red' },
    location: { position: 'bottom', align: 'center', color: 'red' }
};
  // 2. Overlay Color (Default scuro se non c'è nel layout)
  // Nota: Qui usiamo un default fisso, ma potremmo passare suggestedOverlayColor dai props se volessi
  const overlayColor = 'rgba(0,0,0,0.4)';

  // 3. Parsing Agenda
  const agendaItems = data.agenda ? data.agenda.split('\n').filter(i => i.trim()) : [];

  // --- LOGICA DI RAGGRUPPAMENTO ---
      // Default robusto che copre i buchi
    const defaultLayout = {
        title: { position: 'top', align: 'center', color: '#FFFFFF' },
        description: { position: 'center', align: 'center', color: '#FFFFFF' },
        agenda: { position: 'center', align: 'left', color: '#FFFFFF' },
        location: { position: 'bottom', align: 'center', color: '#FFFFFF' }
    };

    // Merge intelligente: se l'AI manda null, usiamo il default
    const safeLayout = {
        title: { ...defaultLayout.title, ...data.layout?.title },
        description: { ...defaultLayout.description, ...data.layout?.description },
        agenda: { ...defaultLayout.agenda, ...data.layout?.agenda },
        location: { ...defaultLayout.location, ...data.layout?.location },
    };

    // Fix specifico per position=null
    if (!safeLayout.title.position) safeLayout.title.position = 'top'; // Fallback sicuro
    if (!safeLayout.description.position) safeLayout.description.position = 'top'; // Fallback sicuro
    if (!safeLayout.agenda.position) safeLayout.agenda.position = 'bottom'; // Fallback sicuro
    if (!safeLayout.location.position) safeLayout.location.position = 'bottom';

    // Ora usa safeLayout invece di layout per costruire gli elements// Raggruppiamo gli elementi nelle 3 zone: TOP, CENTER, BOTTOM
  const elements = [
    { id: 'title', ...safeLayout.title, content: data.title, type: 'title' },
    { id: 'description', ...safeLayout.description, content: data.description, type: 'description' },
    { id: 'agenda', ...safeLayout.agenda, content: data.agenda, type: 'agenda' },
    { id: 'location', ...safeLayout.location, content: data.location, type: 'location' }
  ];

  const topElements = elements.filter(e => e.position === 'top');
  const centerElements = elements.filter(e => e.position === 'center');
  const bottomElements = elements.filter(e => e.position === 'bottom');

  // Renderizzatore generico di un elemento
  const renderElement = (el: any) => {
    // Calcola gli stili una volta sola per questo elemento
    const alignStyle = {
      alignItems: getFlexAlign(el.align)
    };
    const textAlignment = getTextAlign(el.align); // Variabile esplicita per textAlign

    const colorStyle = { color: el.color || '#ebddddff' };

    if (el.type === 'title') {
      return (
        <View key={el.id} style={[styles.sectionBlock, alignStyle]}>
          <Text style={[styles.title, colorStyle, { textAlign: textAlignment }]}>
            {el.content}
          </Text>
        </View>
      );
    }

    if (el.type === 'description') {
      return (
        <View key={el.id} style={[styles.sectionBlock, alignStyle]}>
          <View style={styles.descriptionBlock}>
            {/* Titolo sezione opzionale */}
            <Text style={[styles.sectionTitle, { color: '#FFD700', textAlign: textAlignment }]}>
              About
            </Text>
            <Text style={[styles.text, colorStyle, { textAlign: textAlignment }]}>
              {el.content}
            </Text>
          </View>
        </View>
      );
    }

    if (el.type === 'location') {
      return (
        <View key={el.id} style={[styles.sectionBlock, alignStyle]}>
          <Text style={[styles.text, colorStyle, { textAlign: textAlignment, fontWeight: 700 }]}>
            {el.content}
          </Text>
        </View>
      );
    }

    if (el.type === 'agenda') {
      const items = el.content ? el.content.split('\n') : [];
      return (
        <View key={el.id} style={[styles.sectionBlock, alignStyle]}>
          <Text style={[styles.sectionTitle, { color: '#FFD700', textAlign: textAlignment, marginBottom: 5 }]}>
            Agenda
          </Text>
          {items.map((item: string, i: number) => (
            <Text key={i} style={[styles.text, colorStyle, { textAlign: textAlignment }]}>
              • {item}
            </Text>
          ))}
        </View>
      );
    }
    return null;
  };
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* BACKGROUND (Invariato) */}
        <View style={styles.absoluteFill}>
          {data.showBackground && data.imageUrl ? (
            <Image src={data.imageUrl} style={styles.backgroundImage} />
          ) : null}
          <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        </View>

        {/* CONTENT CONTAINER - FLEX COLUMN CHE COPRE TUTTA LA PAGINA */}
        <View style={{ flex: 1, flexDirection: 'column', padding: 40, justifyContent: 'space-between' }}>

          {/* TOP ZONE */}
          <View style={{ width: '100%', justifyContent: 'flex-start' }}>
            {topElements.map(renderElement)}
          </View>

          {/* CENTER ZONE (Flex 1 per espandersi e spingere bottom giù) */}
          <View style={{ width: '100%', justifyContent: 'center', flex: 1 }}>
            {centerElements.map(renderElement)}
          </View>

          {/* BOTTOM ZONE */}
          <View style={{ width: '100%', justifyContent: 'flex-end' }}>
            {bottomElements.map(renderElement)}
          </View>

        </View>
      </Page>
    </Document>
  );
};