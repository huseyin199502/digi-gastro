export interface Question {
  category: string;
  q: string;
  answers: [string, string, string, string];
  correct: number; // 0..3
}

export const QUESTIONS: Question[] = [
  // ── Getränke ──
  { category: 'Getränke', q: 'Aus welcher Pflanze wird Tequila hergestellt?', answers: ['Agave', ' Zuckerrohr', 'Weizen', 'Mais'], correct: 0 },
  { category: 'Getränke', q: 'Welches Getränk wird aus Trauben hergestellt?', answers: ['Bier', 'Wein', 'Whisky', 'Tee'], correct: 1 },
  { category: 'Getränke', q: 'Wie viel Prozent hat ein klassisches Pils etwa?', answers: ['ca. 5 %', 'ca. 12 %', 'ca. 1 %', 'ca. 20 %'], correct: 0 },
  { category: 'Getränke', q: 'Was ist die Basis eines Mojitos?', answers: ['Wodka', 'Rum', 'Gin', 'Tequila'], correct: 1 },
  { category: 'Getränke', q: 'Aus welchem Land kommt der Espresso ursprünglich?', answers: ['Frankreich', 'Italien', 'Spanien', 'USA'], correct: 1 },
  { category: 'Getränke', q: 'Welcher Cocktail enthält Cola und Rum?', answers: ['Cuba Libre', 'Margarita', 'Negroni', 'Aperol Spritz'], correct: 0 },

  // ── Speisen ──
  { category: 'Speisen', q: 'Aus welchem Land kommt Sushi?', answers: ['China', 'Japan', 'Korea', 'Thailand'], correct: 1 },
  { category: 'Speisen', q: 'Woraus wird klassische Pizza Margherita gemacht?', answers: ['Tomate, Mozzarella, Basilikum', 'Salami, Käse, Pilze', 'Thunfisch, Zwiebel', 'Hähnchen, Ananas'], correct: 0 },
  { category: 'Speisen', q: 'Was ist die Hauptzutat von Hummus?', answers: ['Linsen', 'Kichererbsen', 'Bohnen', 'Erbsen'], correct: 1 },
  { category: 'Speisen', q: 'Welche Nudelsorte bedeutet „kleine Schnüre"?', answers: ['Spaghetti', 'Penne', 'Fusilli', 'Rigatoni'], correct: 0 },
  { category: 'Speisen', q: 'Aus welchem Getreide wird klassisches Risotto gemacht?', answers: ['Weizen', 'Reis', 'Gerste', 'Hafer'], correct: 1 },
  { category: 'Speisen', q: 'Was ist Tofu?', answers: ['Käse aus Milch', 'Quark aus Soja', 'Fleisch-Ersatz aus Weizen', 'Fischpaste'], correct: 1 },

  // ── Shisha ──
  { category: 'Shisha', q: 'Wie heißt der Tabakkopf einer Shisha?', answers: ['Bowl', 'Head', 'Hose', 'Valve'], correct: 1 },
  { category: 'Shisha', q: 'Was kühlt den Rauch in der Shisha?', answers: ['Das Wasser in der Bowl', 'Der Kohleteller', 'Der Schlauch', 'Die Zange'], correct: 0 },
  { category: 'Shisha', q: 'Womit wird der Tabak in der Shisha erhitzt?', answers: ['Feuerzeug direkt', 'Kohle', 'Strom', 'Kerze'], correct: 1 },
  { category: 'Shisha', q: 'Wie nennt man den Schlauch einer Shisha?', answers: ['Hose', 'Tube', 'Pipe', 'Stem'], correct: 0 },

  // ── Allgemein ──
  { category: 'Allgemein', q: 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?', answers: ['9', '10', '11', '12'], correct: 2 },
  { category: 'Allgemein', q: 'Welche Farbe entsteht, wenn man Blau und Gelb mischt?', answers: ['Grün', 'Orange', 'Violett', 'Braun'], correct: 0 },
  { category: 'Allgemein', q: 'Wie viele Kontinente gibt es?', answers: ['5', '6', '7', '8'], correct: 2 },
  { category: 'Allgemein', q: 'Welches ist das größte Land der Welt?', answers: ['China', 'USA', 'Kanada', 'Russland'], correct: 3 },
];
