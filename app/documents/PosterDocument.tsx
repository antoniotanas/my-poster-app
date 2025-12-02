// app/documents/PosterDocument.tsx
import React from 'react';
import ReactPDF from '@react-pdf/renderer';

// Destructure components.
const { Page, Text, View, Document, StyleSheet, Image, Font } = ReactPDF;

// --- REGISTER FONTS ---
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
    // IMPORTANT: Position relative here is needed so absolute children are relative to the page area.
    position: 'relative',
    // No padding here. Padding goes on the content container.
  },

  // --- LAYER 1 STYLES (Background) ---
  // FIX: Defined this generic style to absolutely fill space.
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallbackBgColor: {
    backgroundColor: '#333333', // Dark gray for readability when no image
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    // This also needs to fill space absolutely
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // Medium dark overlay to ensure text pops
  },

  // --- LAYER 2 STYLES (Content) ---
  // This container sits naturally on top because it comes later in JSX.
  contentContainer: {
    position: 'relative', // Normal flow
    height: '100%', // Fill page height
    padding: 40, // Padding applied here so text doesn't touch edges
    flexDirection: 'column',
  },

  // --- TEXT STYLES ---
  header: {
    marginBottom: 30,
    // Text shadow helps readability over complex images
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  descriptionSection: {
    marginBottom: 30,
    padding: 25,
    // Subtle semi-transparent box for better contrast
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFD700', // Gold
    marginBottom: 12,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  text: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 1.6,
  },
  agendaSection: {
    flex: 1,
    padding: 25,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  agendaItemWrapper: {
      marginBottom: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
  },
  agendaBullet: {
    fontSize: 18,
    color: '#FFD700',
    marginRight: 12,
    lineHeight: 1,
  },
  agendaItemText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 1.4,
    fontWeight: 500,
  }
});

interface PosterData {
  title: string;
  description: string;
  agenda: string;
  imageUrl: string | null;
  showBackground: boolean;
}

export const PosterDocument = ({ data }: { data: PosterData }) => {
  // Safer default values
  const safeTitle = data.title || "Event Title";
  const safeDescription = data.description || "Event description goes here...";
  const agendaItems = data.agenda ? data.agenda.split('\n').filter(i => i.trim()) : [];

  // Logic: Show image ONLY if switch is ON AND we have a URL string.
  const shouldRenderImage = data.imageUrl && typeof data.imageUrl === 'string';//data.showBackground &&

  return (
  <Document>
    <Page size="A4" style={styles.page}>

        {/* =================================================================
            LAYER 1: BACKGROUND (Rendered first, sits at bottom)
           ================================================================= */}
        {/* FIX: Use the correctly named style here */}
        <View style={styles.absoluteFill}>
             {shouldRenderImage ? (
                 // 1A. Has image and switch is ON
                 <>
                   {/* @ts-ignore */}
                   <Image src={data.imageUrl} style={styles.backgroundImage} />
                   <View style={styles.overlay} />
                 </>
             ) : (
                 // 1B. No image or switch is OFF -> Show solid dark color
                 // FIX: Use the correctly named style here combined with color
                 <View style={[styles.absoluteFill, styles.fallbackBgColor]} />
             )}
        </View>


        {/* =================================================================
            LAYER 2: CONTENT (Rendered second, sits on top)
           ================================================================= */}
        <View style={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>{safeTitle}</Text>
            </View>

            <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>About the Event</Text>
                <Text style={styles.text}>{safeDescription}</Text>
            </View>

            <View style={styles.agendaSection}>
                <Text style={styles.sectionTitle}>Agenda</Text>
                {agendaItems.length > 0 ? (
                    agendaItems.map((item, index) => (
                    <View key={index} style={styles.agendaItemWrapper}>
                        <Text style={styles.agendaBullet}>•</Text>
                        <Text style={styles.agendaItemText}>{item}</Text>
                    </View>
                    ))
                ) : (
                    <Text style={styles.text}>Add agenda items...</Text>
                )}
            </View>
      </View>
    </Page>
  </Document>
  );
};