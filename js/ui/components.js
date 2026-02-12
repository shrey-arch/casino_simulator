/**
 * UI Components
 * Helper functions to create consistent UI elements.
 */
export const createButton = (text, onClick, className = '') => {
    const btn = document.createElement('button');
    btn.textContent = text;
    if (className) btn.className = className;
    btn.addEventListener('click', (e) => {
        // Simple ripple effect or sound trigger could go here
        onClick(e);
    });
    return btn;
};

export const createCard = (title, description, onClick) => {
    const card = document.createElement('div');
    card.className = 'game-card';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const p = document.createElement('p');
    p.textContent = description;

    card.appendChild(h3);
    card.appendChild(p);

    card.addEventListener('click', onClick);

    return card;
};

export const createModal = (content) => {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-content');

    container.innerHTML = '';
    container.appendChild(content);

    overlay.classList.remove('hidden');

    // Close on outside click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    };
};
