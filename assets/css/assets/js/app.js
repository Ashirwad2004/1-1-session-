// assets/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const bookingCard = document.getElementById('bookingCard');
    const confirmationCard = document.getElementById('confirmationCard');
    const sessionModal = document.getElementById('sessionModal');
    const paymentBtn = document.getElementById('paymentBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const joinSessionLink = document.getElementById('joinSessionLink');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const sessionLinkInput = document.getElementById('sessionLinkInput');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const errorMessage = document.getElementById('error-message');
    const timeSlotsContainer = document.getElementById('timeSlotsContainer');

    let selectedTimeSlot = null;

    function generateAndRenderSlots() {
        const slotsByDay = {};
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            const day = date.getDay();
            const isWeekend = (day === 0 || day === 6);
            let availableHours = [];
            if (isWeekend) {
                availableHours = [9, 10, 11, 12, 14, 15, 16, 17];
            } else {
                availableHours = [22];
            }
            const dateString = date.toISOString().split('T')[0];
            if (!slotsByDay[dateString]) {
                slotsByDay[dateString] = {
                    label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    slots: []
                };
            }
            availableHours.forEach(hour => {
                const slotDate = new Date(date);
                slotDate.setHours(hour, 0, 0, 0);
                if (slotDate > now) {
                    slotsByDay[dateString].slots.push(slotDate);
                }
            });
        }

        timeSlotsContainer.innerHTML = '';
        Object.keys(slotsByDay).forEach(dateString => {
            const dayData = slotsByDay[dateString];
            if (dayData.slots.length > 0) {
                const dayContainer = document.createElement('div');
                const dayLabel = document.createElement('h4');
                dayLabel.className = 'text-sm font-semibold text-gray-600';
                dayLabel.textContent = dayData.label;
                dayContainer.appendChild(dayLabel);

                const slotsGrid = document.createElement('div');
                slotsGrid.className = 'grid grid-cols-3 gap-2 mt-2';
                dayData.slots.forEach(slot => {
                    const slotButton = document.createElement('button');
                    slotButton.className = 'px-2 py-2 text-sm border rounded-lg hover:bg-indigo-100 hover:border-indigo-500 transition';
                    slotButton.textContent = slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    slotButton.dataset.value = slot.toISOString();
                    slotButton.addEventListener('click', () => {
                        document.querySelectorAll('#timeSlotsContainer button').forEach(btn => {
                            btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
                        });
                        slotButton.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
                        selectedTimeSlot = slotButton.dataset.value;
                        validateForm();
                    });
                    slotsGrid.appendChild(slotButton);
                });
                dayContainer.appendChild(slotsGrid);
                timeSlotsContainer.appendChild(dayContainer);
            }
        });
    }

    function validateForm() {
        if (!selectedTimeSlot) {
            paymentBtn.disabled = true;
            errorMessage.textContent = 'Please select a time slot.';
            return false;
        }
        errorMessage.textContent = '';
        paymentBtn.disabled = false;
        return true;
    }

    generateAndRenderSlots();
    validateForm();

    paymentBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        if (!name || !email || !phone) {
            errorMessage.textContent = 'Please fill in your name, email, and phone.';
            return;
        }
        if (!validateForm()) return;

        const options = {
            "key": "YOUR_KEY_ID",
            "amount": 399.00,
            "currency": "INR",
            "name": "1:1 Session Booking",
            "description": "Expert Consultation Session",
            "image": "https://placehold.co/100x100/7c3aed/ffffff?text=1:1",
            "handler": function () {
                bookingCard.classList.add('hidden');
                confirmationCard.classList.remove('hidden');
                generateSessionLink();
            },
            "prefill": { "name": name, "email": email, "contact": phone },
            "notes": { "session_time": new Date(selectedTimeSlot).toLocaleString() },
            "theme": { "color": "#4F46E5" }
        };

        const rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            errorMessage.textContent = `Payment failed: ${response.error.description}`;
        });
        rzp1.open();
    });

    function generateSessionLink() {
        const randomString = Math.random().toString(36).substring(2, 12);
        const link = window.location.href.split('?')[0] + `?session=${randomString}`;
        sessionLinkInput.value = link;
        joinSessionLink.href = link;
    }

    copyLinkBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(sessionLinkInput.value);
            copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
        } catch {
            try {
                sessionLinkInput.select();
                document.execCommand('copy');
                copyLinkBtn.textContent = 'Copied!';
                setTimeout(() => { copyLinkBtn.textContent = 'Copy'; }, 2000);
            } catch {
                alert('Please manually copy the link.');
            }
        }
    });

    joinSessionLink.addEventListener('click', (e) => {
        e.preventDefault();
        sessionModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        sessionModal.classList.add('hidden');
    });

    sessionModal.addEventListener('click', (e) => {
        if (e.target === sessionModal) {
            sessionModal.classList.add('hidden');
        }
    });

    function addChatMessage(message, sender = 'user') {
        const messageElement = document.createElement('div');
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageText.classList.add('text-sm');
        messageElement.appendChild(messageText);
        messageElement.classList.add('p-3', 'rounded-lg', 'max-w-xs', 'break-words');
        if (sender === 'user') {
            messageElement.classList.add('bg-indigo-500', 'text-white', 'self-end', 'ml-auto');
        } else {
            messageElement.classList.add('bg-gray-200', 'text-gray-800', 'self-start', 'mr-auto');
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSendChat() {
        const message = chatInput.value.trim();
        if (message) {
            addChatMessage(message, 'user');
            chatInput.value = '';
        }
    }

    sendChatBtn.addEventListener('click', handleSendChat);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendChat();
        }
    });
});