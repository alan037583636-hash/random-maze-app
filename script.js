const queue = [];
let nextTicketNumber = 1;

const registrationForm = document.getElementById('registration-form');
const nameInput = document.getElementById('guest-name');
const phoneInput = document.getElementById('guest-phone');
const ticketResult = document.getElementById('ticket-result');
const queueList = document.getElementById('queue-list');
const queueCount = document.getElementById('queue-count');
const rosterCount = document.getElementById('roster-count');
const callNextButton = document.getElementById('call-next');
const counterHint = document.getElementById('counter-hint');
const announcement = document.getElementById('announcement');
const lookupForm = document.getElementById('lookup-form');
const lookupInput = document.getElementById('lookup-ticket');
const lookupResult = document.getElementById('lookup-result');

function renderQueue() {
    queueList.replaceChildren();

    if (queue.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';

        const wave = document.createElement('span');
        wave.className = 'empty-wave';
        wave.setAttribute('aria-hidden', 'true');
        wave.textContent = '〰';

        const title = document.createElement('strong');
        title.textContent = '目前沒有等候者';

        const description = document.createElement('span');
        description.textContent = '完成登記後，名單會顯示在這裡。';

        emptyState.append(wave, title, description);
        queueList.append(emptyState);
    } else {
        queue.forEach((guest, index) => {
            const item = document.createElement('li');
            item.className = 'queue-item';

            const position = document.createElement('span');
            position.className = 'queue-position';
            position.textContent = String(index + 1).padStart(2, '0');

            const guestInfo = document.createElement('span');
            guestInfo.className = 'guest-info';

            const guestName = document.createElement('strong');
            guestName.textContent = guest.name;

            const guestPhone = document.createElement('span');
            guestPhone.textContent = guest.phone;
            guestInfo.append(guestName, guestPhone);

            const ticket = document.createElement('span');
            ticket.className = 'ticket-tag';
            ticket.textContent = guest.ticket;

            item.append(position, guestInfo, ticket);
            queueList.append(item);
        });
    }

    queueCount.textContent = String(queue.length);
    rosterCount.textContent = String(queue.length);
    callNextButton.disabled = queue.length === 0;
    counterHint.textContent = queue.length === 0
        ? '準備好為下一組安排座位'
        : `目前隊首：${queue[0].ticket} ${queue[0].name}`;
}

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) return;

    const ticket = `Q${String(nextTicketNumber).padStart(3, '0')}`;
    nextTicketNumber += 1;
    queue.push({ name, phone, ticket });

    ticketResult.replaceChildren();
    const confirmation = document.createElement('span');
    confirmation.textContent = `${name}，您的專屬號碼牌是`;
    const ticketNumber = document.createElement('strong');
    ticketNumber.textContent = ticket;
    ticketResult.append(confirmation, ticketNumber);
    ticketResult.hidden = false;

    announcement.hidden = true;
    registrationForm.reset();
    nameInput.focus();
    renderQueue();
});

callNextButton.addEventListener('click', () => {
    const guest = queue.shift();
    if (!guest) return;

    announcement.textContent = `請 ${guest.ticket} ${guest.name} 入座`;
    announcement.hidden = false;
    ticketResult.hidden = true;
    renderQueue();
});

lookupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const ticket = lookupInput.value.trim().toUpperCase();
    const position = queue.findIndex((guest) => guest.ticket === ticket);
    lookupResult.className = 'lookup-result';

    if (position === -1) {
        lookupResult.textContent = `查無 ${ticket || '此號碼牌'}，請確認號碼或重新登記。`;
        lookupResult.classList.add('is-error');
        return;
    }

    lookupResult.textContent = position === 0
        ? `您是 ${ticket}，目前已排在隊首，請留意叫號。`
        : `您前面還有 ${position} 組客人。`;
    lookupResult.classList.add('is-success');
});

renderQueue();