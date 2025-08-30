// Main application JavaScript for the booking page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Generate time slots
    generateTimeSlots();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize form validation
    initializeFormValidation();
}

function generateTimeSlots() {
    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;
    
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const timeSlot = document.createElement('div');
        timeSlot.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors';
        timeSlot.innerHTML = `
            <input type="radio" name="timeSlot" value="${time}" class="text-indigo-600 focus:ring-indigo-500">
            <label class="text-sm font-medium text-gray-700 cursor-pointer">${time}</label>
        `;
        
        timeSlot.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            updateSelectedTimeSlot();
        });
        
        container.appendChild(timeSlot);
        timeSlots.push(timeSlot);
    }
}

function updateSelectedTimeSlot() {
    const selectedSlot = document.querySelector('input[name="timeSlot"]:checked');
    if (selectedSlot) {
        // Remove previous selection styling
        document.querySelectorAll('.bg-indigo-50').forEach(el => {
            el.classList.remove('bg-indigo-50', 'border-indigo-200');
            el.classList.add('bg-gray-50');
        });
        
        // Add selection styling to current slot
        const slotContainer = selectedSlot.closest('div');
        slotContainer.classList.remove('bg-gray-50');
        slotContainer.classList.add('bg-indigo-50', 'border-indigo-200');
    }
}

function setupEventListeners() {
    // Payment button
    const paymentBtn = document.getElementById('paymentBtn');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', handlePayment);
    }
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copySessionLink);
    }
    
    // Join session link
    const joinSessionLink = document.getElementById('joinSessionLink');
    if (joinSessionLink) {
        joinSessionLink.addEventListener('click', openSessionModal);
    }
    
    // Close modal button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeSessionModal);
    }
    
    // Send chat button
    const sendChatBtn = document.getElementById('sendChatBtn');
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    
    // Chat input enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll('input[required], input[type="email"], input[type="tel"]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('border-red-500', 'focus:border-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-xs mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500', 'focus:border-red-500');
    
    const errorDiv = document.getElementById(`${field.id}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Check if time slot is selected
    const selectedTimeSlot = document.querySelector('input[name="timeSlot"]:checked');
    if (!selectedTimeSlot) {
        showError('Please select a time slot');
        isValid = false;
    }
    
    return isValid;
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function handlePayment() {
    if (!validateForm()) {
        return;
    }
    
    const paymentBtn = document.getElementById('paymentBtn');
    paymentBtn.disabled = true;
    paymentBtn.textContent = 'Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
        showConfirmation();
        paymentBtn.disabled = false;
        paymentBtn.textContent = 'Proceed to Payment';
    }, 2000);
}

function showConfirmation() {
    const bookingCard = document.getElementById('bookingCard');
    const confirmationCard = document.getElementById('confirmationCard');
    
    if (bookingCard && confirmationCard) {
        bookingCard.style.display = 'none';
        confirmationCard.classList.remove('hidden');
        
        // Generate session link
        const sessionLink = generateSessionLink();
        const sessionLinkInput = document.getElementById('sessionLinkInput');
        if (sessionLinkInput) {
            sessionLinkInput.value = sessionLink;
        }
        
        // Update join session link
        const joinSessionLink = document.getElementById('joinSessionLink');
        if (joinSessionLink) {
            joinSessionLink.href = sessionLink;
        }
    }
}

function generateSessionLink() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    return `https://meet.example.com/session/${timestamp}-${randomId}`;
}

function copySessionLink() {
    const sessionLinkInput = document.getElementById('sessionLinkInput');
    if (sessionLinkInput) {
        sessionLinkInput.select();
        document.execCommand('copy');
        
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('bg-green-500');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('bg-green-500');
            }, 2000);
        }
    }
}

function openSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeSessionModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'p-3 rounded-lg bg-blue-100 text-blue-800 self-end max-w-xs ml-auto';
    messageDiv.innerHTML = `<p class="text-sm">${message}</p>`;
    
    // Add to chat
    chatMessages.appendChild(messageDiv);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate response (optional)
    setTimeout(() => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'p-3 rounded-lg bg-gray-100 text-gray-800 self-start max-w-xs';
        responseDiv.innerHTML = `<p class="text-sm">Thanks for your message! I'll get back to you soon.</p>`;
        chatMessages.appendChild(responseDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('sessionModal');
    if (modal && event.target === modal) {
        closeSessionModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSessionModal();
    }
});