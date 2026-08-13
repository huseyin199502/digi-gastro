let demoState = { qty: 0, hasSent: false };

        function addDemoItem() {
            if (demoState.qty >= 1 || demoState.hasSent) return;
            demoState.qty = 1;
            const addBtn = document.getElementById('demo-add-btn');
            addBtn.innerHTML = '1';
            addBtn.className = "w-7 h-7 bg-gold-600 text-white rounded-full flex items-center justify-center font-bold text-xs";
            const submitBtn = document.getElementById('demo-submit-btn');
            submitBtn.innerHTML = 'Bestellung senden (3,50 €)';
            submitBtn.className = "w-full bg-gold-500 text-black font-black text-[10px] uppercase tracking-wider py-2.5 rounded-lg text-center transition-all duration-300 animate-custom-pulse cursor-pointer hover:bg-gold-400 min-h-[40px]";
            document.getElementById('demo-guide').innerHTML = 'Super! Klicke jetzt auf den pulsierenden Button <strong class="text-gold-500 font-extrabold">Bestellung senden</strong>, um die Bestellung an die Küche zu übertragen!';
        }

        function sendDemoOrder() {
            if (demoState.qty === 0 || demoState.hasSent) return;
            demoState.hasSent = true;
            const submitBtn = document.getElementById('demo-submit-btn');
            submitBtn.innerHTML = 'Gesendet ✓';
            submitBtn.className = "w-full bg-zinc-800 text-gold-400 font-black text-[10px] uppercase tracking-wider py-2.5 rounded-lg text-center transition-all duration-300 cursor-not-allowed min-h-[40px]";
            const addBtn = document.getElementById('demo-add-btn');
            addBtn.innerHTML = '1';
            addBtn.className = "w-7 h-7 bg-zinc-800 text-zinc-600 rounded-full flex items-center justify-center font-bold text-xs cursor-not-allowed";
            const ticket = document.getElementById('demo-flying-ticket');
            ticket.classList.remove('hidden');
            ticket.classList.add('animate-fly-ticket');
            document.getElementById('demo-guide').innerHTML = 'Die Bestellung fliegt in diesem Moment live über unser Krypto-Netzwerk auf das Küchen-Display!';
            setTimeout(() => {
                const kdsBoard = document.getElementById('demo-kds-board');
                const newTicket = document.createElement('div');
                newTicket.id = 'demo-new-kds-ticket';
                newTicket.className = "bg-zinc-900/60 border border-gold-500/30 p-2 rounded-lg flex items-center justify-between text-[10px] transition-all duration-500 scale-95 opacity-0";
                newTicket.innerHTML = `
                    <div>
                        <div class="font-extrabold text-white flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping"></span>
                            Tisch 1 &bull; Neu!
                        </div>
                        <div class="text-gold-500 mt-0.5 font-bold">1x Coca Cola Zero</div>
                    </div>
                    <div id="demo-kds-status" class="bg-gold-500/10 text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/20 font-bold">Zubereitung</div>
                `;
                kdsBoard.appendChild(newTicket);
                setTimeout(() => {
                    newTicket.classList.remove('scale-95', 'opacity-0');
                    newTicket.classList.add('scale-100', 'opacity-100');
                }, 50);
                document.getElementById('demo-guide').innerHTML = 'Angekommen! Die Küche bereitet die Cola vor. Der Status steht jetzt auf <strong class="text-gold-500">Zubereitung</strong>.';
                setTimeout(() => {
                    const statusText = document.getElementById('demo-kds-status');
                    if (statusText) {
                        statusText.innerHTML = '✓ Serviert';
                        statusText.className = "bg-gold-500/10 text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/20 font-bold";
                        newTicket.className = "bg-zinc-900/60 border border-zinc-800/40 p-2 rounded-lg flex items-center justify-between text-[10px] opacity-60 transition-all duration-500";
                    }
                    document.getElementById('demo-guide').innerHTML = 'Serviert! Der Kellner hat das Getränk an den Gast übergeben. Die Demo ist abgeschlossen.';
                    document.getElementById('demo-reset-btn').classList.remove('hidden');
                }, 3500);
            }, 1500);
        }

        function resetDemoSimulator() {
            demoState.qty = 0;
            demoState.hasSent = false;
            const addBtn = document.getElementById('demo-add-btn');
            addBtn.innerHTML = '+';
            addBtn.className = "w-7 h-7 bg-gold-500 text-black rounded-full flex items-center justify-center font-bold text-xs hover:scale-110 active:scale-95 transition-all";
            const submitBtn = document.getElementById('demo-submit-btn');
            submitBtn.innerHTML = 'Warenkorb leer';
            submitBtn.className = "w-full bg-zinc-800 text-zinc-500 cursor-not-allowed font-black text-[10px] uppercase tracking-wider py-2.5 rounded-lg text-center transition-all duration-300 min-h-[40px]";
            const ticket = document.getElementById('demo-flying-ticket');
            ticket.classList.add('hidden');
            ticket.classList.remove('animate-fly-ticket');
            const newTicket = document.getElementById('demo-new-kds-ticket');
            if (newTicket) newTicket.remove();
            document.getElementById('demo-guide').innerHTML = 'Drücke oben auf das <strong class="text-gold-500 font-extrabold">+</strong> am Smartphone, um Cola in den Warenkorb zu legen!';
            document.getElementById('demo-reset-btn').classList.add('hidden');
        }
