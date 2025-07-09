// Fee Payment Portal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializePaymentForm();
    initializeSidebar();
    initializeCardFormatting();
    initializePaymentSummary();
    initializeFormValidation();
    initializeNavigation();
});

// Payment Form Initialization
function initializePaymentForm() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const cardFields = document.querySelectorAll('#card-number, #expiry, #cvv, #cardholder-name');
    
    // Handle payment method changes
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            toggleCardFields(this.value);
            updatePaymentSummary();
        });
    });
    
    // Initialize with default selection
    const defaultMethod = document.querySelector('input[name="payment-method"]:checked');
    if (defaultMethod) {
        toggleCardFields(defaultMethod.value);
    }
}

// Toggle card fields based on payment method
function toggleCardFields(paymentMethod) {
    const cardFieldsContainer = document.querySelector('#card-number').closest('.form-group').parentNode;
    const cardFields = cardFieldsContainer.querySelectorAll('.form-group');
    
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
        cardFields.forEach(field => {
            if (field.querySelector('#card-number, #expiry, #cvv, #cardholder-name')) {
                field.style.display = 'block';
            }
        });
    } else {
        cardFields.forEach(field => {
            if (field.querySelector('#card-number, #expiry, #cvv, #cardholder-name')) {
                field.style.display = 'none';
            }
        });
    }
}

// Sidebar Navigation
function initializeSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            sidebarItems.forEach(si => si.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle navigation (you can expand this based on your needs)
            const text = this.querySelector('span').textContent;
            showNotification(`Navigating to ${text}`, 'info');
        });
    });
}

// Card Number and Field Formatting
function initializeCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');
    
    // Format card number
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let matches = value.match(/\d{4,16}/g);
            let match = matches && matches[0] || '';
            let parts = [];
            
            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
            }
            
            if (parts.length) {
                e.target.value = parts.join(' ');
            } else {
                e.target.value = '';
            }
            
            // Detect card type
            detectCardType(value);
            updatePaymentSummary();
        });
    }
    
    // Format expiry date
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Format CVV
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
        });
    }
}

// Detect card type based on number
function detectCardType(number) {
    const cardTypes = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/
    };
    
    let detectedType = 'unknown';
    
    for (let type in cardTypes) {
        if (cardTypes[type].test(number)) {
            detectedType = type;
            break;
        }
    }
    
    // You can add visual indicators for card type here
    console.log('Detected card type:', detectedType);
}

// Payment Summary Updates
function initializePaymentSummary() {
    const amountInput = document.getElementById('amount');
    const feeTypeSelect = document.getElementById('fee-type');
    
    if (amountInput) {
        amountInput.addEventListener('input', updatePaymentSummary);
    }
    
    if (feeTypeSelect) {
        feeTypeSelect.addEventListener('change', updatePaymentSummary);
    }
}

function updatePaymentSummary() {
    const amountInput = document.getElementById('amount');
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    
    let subtotal = parseFloat(amountInput?.value || 0);
    let processingFee = calculateProcessingFee(subtotal, paymentMethod?.value);
    let total = subtotal + processingFee;
    
    // Update summary display
    const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
    const processingFeeElement = document.querySelector('.summary-item:nth-child(2) span:last-child');
    const totalElement = document.querySelector('.summary-item.total span:last-child');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (processingFeeElement) processingFeeElement.textContent = `$${processingFee.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function calculateProcessingFee(amount, paymentMethod) {
    if (amount === 0) return 0;
    
    const fees = {
        'credit-card': amount * 0.029 + 0.30,
        'debit-card': 0.50,
        'bank-transfer': 0,
        'digital-wallet': amount * 0.025
    };
    
    return fees[paymentMethod] || 15.00;
}

// Form Validation
function initializeFormValidation() {
    const form = document.querySelector('.payment-form');
    const submitBtn = document.querySelector('.btn-primary');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                processPayment();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Additional validation for card fields
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (paymentMethod && (paymentMethod.value === 'credit-card' || paymentMethod.value === 'debit-card')) {
        if (!validateCardNumber() || !validateExpiryDate()) {
            isValid = false;
        }
    }
    
    return isValid;
}

function validateField(field) {
    const errorClass = 'field-error';
    const successClass = 'field-success';
    
    // Remove existing validation classes
    field.classList.remove(errorClass, successClass);
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Specific validations
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    if (field.type === 'number' && field.value) {
        if (parseFloat(field.value) <= 0) {
            isValid = false;
            errorMessage = 'Amount must be greater than 0';
        }
    }
    
    // Add validation styling
    field.classList.add(isValid ? successClass : errorClass);
    
    // Show/hide error message
    showFieldError(field, isValid ? '' : errorMessage);
    
    return isValid;
}

function validateCardNumber() {
    const cardNumber = document.getElementById('card-number');
    if (!cardNumber) return true;
    
    const number = cardNumber.value.replace(/\s/g, '');
    const isValid = number.length >= 13 && number.length <= 19 && /^\d+$/.test(number);
    
    cardNumber.classList.toggle('field-error', !isValid);
    cardNumber.classList.toggle('field-success', isValid);
    
    showFieldError(cardNumber, isValid ? '' : 'Please enter a valid card number');
    return isValid;
}

function validateExpiryDate() {
    const expiry = document.getElementById('expiry');
    if (!expiry) return true;
    
    const value = expiry.value;
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;
    
    const isValid = value.length === 5 && 
                   month >= 1 && month <= 12 && 
                   (year > currentYear || (year == currentYear && month >= currentMonth));
    
    expiry.classList.toggle('field-error', !isValid);
    expiry.classList.toggle('field-success', isValid);
    
    showFieldError(expiry, isValid ? '' : 'Please enter a valid expiry date');
    return isValid;
}

function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message if provided
    if (message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
}

// Payment Processing
function processPayment() {
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
            showNotification('Payment processed successfully!', 'success');
            // Reset form or redirect
            resetPaymentForm();
        } else {
            showNotification('Payment failed. Please try again.', 'error');
        }
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function resetPaymentForm() {
    const form = document.querySelector('.payment-form');
    if (form) {
        form.reset();
        
        // Clear validation classes
        const fields = form.querySelectorAll('input, select');
        fields.forEach(field => {
            field.classList.remove('field-error', 'field-success');
        });
        
        // Clear error messages
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Reset payment summary
        updatePaymentSummary();
    }
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle navigation
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                const section = document.querySelector(href);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '9999',
        minWidth: '300px',
        backgroundColor: getNotificationColor(type),
        color: 'white',
        animation: 'slideIn 0.3s ease-out'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--primary-color)'
    };
    return colors[type] || 'var(--primary-color)';
}

// Download receipt functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-download') && !e.target.disabled) {
        e.preventDefault();
        showNotification('Receipt download started', 'success');
        
        // Simulate download
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#';
            link.download = `receipt-${Date.now()}.pdf`;
            // In a real application, this would be a real file URL
            showNotification('Receipt downloaded successfully', 'success');
        }, 1000);
    }
});

// Add CSS for notifications and form validation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .field-error {
        border-color: var(--danger-color) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .field-success {
        border-color: var(--success-color) !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    .error-message {
        animation: fadeIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);