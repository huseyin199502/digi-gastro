// digi-gastro Play World — Realtime-Server (Colyseus).
import { defineServer, defineRoom, listen } from "colyseus";
import { KartRoom } from "./rooms/KartRoom";
import { Kart3dRoom } from "./rooms/Kart3dRoom";
import { LudoRoom } from "./rooms/LudoRoom";
import { QuizRoom } from "./rooms/QuizRoom";

const port = Number(process.env.PORT ?? 2567);

const server = defineServer({
  rooms: {
    kart: defineRoom(KartRoom),
    kart3d: defineRoom(Kart3dRoom),
    ludo: defineRoom(LudoRoom),
    quiz: defineRoom(QuizRoom),
    board: defineRoom(QuizRoom),
  },
});

listen(server, port).then(() => {
  console.log(`[games] Colyseus läuft auf Port ${port}`);
});
