const currentDisplay = document.getElementById('current');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelectorAll('.btn, .btn-equals');

let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;

// Format numbers for clean sci-fi UX
const formatNumber = (numStr) => {
    if (numStr === 'Error') return 'Error';
    if (numStr.includes('.')) {
        const [int, dec] = numStr.split('.');
        return parseFloat(int).toLocaleString('en-US') + '.' + dec;
    }
    return parseFloat(numStr).toLocaleString('en-US');
};

const updateDisplay = () => {
    // Dynamic Font Resizing based on character length
    if (currentInput.length > 14) {
        currentDisplay.style.fontSize = '1.4rem';
    } else if (currentInput.length > 9) {
        currentDisplay.style.fontSize = '1.8rem';
    } else {
        currentDisplay.style.fontSize = '2.5rem';
    }

    if (currentInput === 'Error') {
        currentDisplay.textContent = 'Error';
    } else {
        currentDisplay.textContent = formatNumber(currentInput);
    }
    
    if (operation) {
        historyDisplay.textContent = `${formatNumber(previousInput)} ${operation}`;
    } else {
        historyDisplay.textContent = '';
    }
};

const inputNumber = (num) => {
    if (currentInput === '0' || shouldResetDisplay || currentInput === 'Error') {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput.replace(/[^0-9]/g, '').length < 16) { // Max digits constraint
            currentInput += num;
        }
    }
    updateDisplay();
};

const inputDecimal = () => {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
};

const clearAll = () => {
    currentInput = '0';
    previousInput = '';
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
};

const clearEntry = () => {
    currentInput = '0';
    updateDisplay();
};

const toggleSign = () => {
    if (currentInput === '0' || currentInput === 'Error') return;
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay();
};

const handlePercent = () => {
    if (currentInput === 'Error') return;
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay();
};

const setOperation = (op) => {
    if (currentInput === 'Error') return;
    if (operation && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operation = op;
    shouldResetDisplay = true;
    updateDisplay();
};

const calculate = () => {
    if (!operation || shouldResetDisplay) return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': 
            if (current === 0) {
                currentInput = 'Error';
                operation = null;
                shouldResetDisplay = true;
                updateDisplay();
                return;
            }
            result = prev / current; 
            break;
        default: return;
    }
    
    // Clean JavaScript float precision irregularities (e.g. 0.1 + 0.2)
    currentInput = parseFloat(result.toPrecision(12)).toString();
    operation = null;
    shouldResetDisplay = true;
    
    // Smooth result reveal animation
    currentDisplay.classList.remove('slide-in');
    void currentDisplay.offsetWidth; // Trigger reflow
    currentDisplay.classList.add('slide-in');
    
    updateDisplay();
};

// Handle Mouse Clicks
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        const action = btn.dataset.action;
        
        if (val) {
            if (val === '.') inputDecimal();
            else inputNumber(val);
        } else if (action) {
            handleAction(action);
        }
    });
});

const handleAction = (action) => {
    switch (action) {
        case 'clear-all': clearAll(); break;
        case 'clear-entry': clearEntry(); break;
        case 'percent': handlePercent(); break;
        case 'toggle-sign': toggleSign(); break;
        case 'add': setOperation('+'); break;
        case 'subtract': setOperation('-'); break;
        case 'multiply': setOperation('*'); break;
        case 'divide': setOperation('/'); break;
        case 'calculate': calculate(); break;
    }
};

// Keyboard Support
document.addEventListener('keydown', (e) => {
    let key = e.key;
    
    // Map alternate system keys
    if (key === 'Enter') key = '=';
    if (key === 'Escape') key = 'c';
    if (key === 'Delete') key = 'ce';
    
    // Visual click feedback mapping for keyboard users
    let targetSelector = '';
    if (/[0-9.]/.test(key)) targetSelector = `[data-val="${key}"]`;
    else if (key === '+') targetSelector = '[data-action="add"]';
    else if (key === '-') targetSelector = '[data-action="subtract"]';
    else if (key === '*') targetSelector = '[data-action="multiply"]';
    else if (key === '/') targetSelector = '[data-action="divide"]';
    else if (key === '%') targetSelector = '[data-action="percent"]';
    else if (key === '=' || key === 'Enter') targetSelector = '[data-action="calculate"]';
    else if (key.toLowerCase() === 'c') targetSelector = '[data-action="clear-all"]';
    else if (key.toLowerCase() === 'backspace' || key === 'ce') targetSelector = '[data-action="clear-entry"]';

    if (targetSelector) {
        const btn = document.querySelector(targetSelector);
        if (btn) {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 100);
            btn.click();
        }
    }
});