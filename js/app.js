:root {
  --bg: #f5f7fb;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --primary: #1d4ed8;
  --primary-dark: #173ea7;
  --secondary: #e0ebff;
  --text: #1f2937;
  --muted: #6b7280;
  --line: #dfe7f1;
  --success: #15803d;
  --success-soft: #ecfdf5;
  --warning: #d97706;
  --danger: #b91c1c;
  --danger-soft: #fef2f2;
  --shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: var(--bg);
  color: var(--text);
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 10;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--muted);
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

.app-shell {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 16px 28px;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 18px;
  margin-bottom: 20px;
}

.section-head {
  margin-bottom: 18px;
}

.filter-box {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-weight: 600;
}

.field input,
.field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface-soft);
  color: var(--text);
}

.checkbox-field {
  justify-content: end;
}

.checkbox-field input {
  width: 18px;
  height: 18px;
  margin: 0;
  align-self: flex-start;
}

.filter-actions {
  margin-top: 16px;
}

.secondary-btn,
.confirm-btn,
.product-card button,
.cart-actions button {
  border: none;
  border-radius: 10px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.secondary-btn,
.confirm-btn {
  padding: 10px 16px;
}

.secondary-btn {
  background: var(--secondary);
  color: var(--primary-dark);
}

.confirm-btn {
  width: 100%;
  background: var(--success);
  color: #fff;
  margin-top: 16px;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.status-message {
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  display: none;
  font-weight: 600;
}

.status-message.visible {
  display: block;
}

.status-message.loading {
  background: #e0f2fe;
  color: #0c4a6e;
}

.status-message.error {
  background: var(--danger-soft);
  color: var(--danger);
}

.status-message.success {
  background: var(--success-soft);
  color: var(--success);
}

.status-message.info {
  background: #eef2ff;
  color: #312e81;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

product-list {
  display: block;
}

.product-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

product-card {
  display: block;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
  padding: 14px;
}

.product-card.disabled {
  opacity: 0.7;
  background: #f9fafb;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.category-pill,
.state-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  padding: 5px 8px;
  font-weight: 700;
}

.category-pill {
  background: #e2e8f0;
  color: #334155;
}

.state-pill.ok {
  background: var(--success-soft);
  color: var(--success);
}

.state-pill.blocked {
  background: var(--danger-soft);
  color: var(--danger);
}

.product-card h3 {
  font-size: 1.1rem;
}

.product-card p {
  color: var(--muted);
  line-height: 1.5;
  min-height: 72px;
}

.price {
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--text);
}

.stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stock {
  display: inline-block;
  padding: 4px 8px;
  background: var(--success-soft);
  color: var(--success);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.product-card button {
  width: 100%;
  padding: 11px 14px;
  background: var(--primary);
  color: #fff;
}

.product-card.disabled button {
  background: #9ca3af;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--surface-soft);
}

.cart-product {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cart-product strong {
  word-break: break-word;
}

.cart-product small {
  color: var(--muted);
}

.cart-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cart-actions button {
  padding: 7px 10px;
  background: var(--secondary);
  color: var(--primary-dark);
}

.cart-actions button[data-action="remove"] {
  background: var(--danger-soft);
  color: var(--danger);
}

.summary-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.total-row {
  font-size: 1.1rem;
  font-weight: 700;
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.empty {
  border: 1px dashed var(--line);
  border-radius: 10px;
  background: #fafafa;
  padding: 18px 14px;
  color: var(--muted);
  text-align: center;
}

.summary-panel {
  display: flex;
  flex-direction: column;
}

.order-box {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--line);
}

.order-box h3 {
  margin-bottom: 8px;
}

.order-box p {
  color: var(--muted);
  line-height: 1.5;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  background: var(--secondary);
  color: var(--primary-dark);
  border-radius: 999px;
  padding: 8px 14px;
}

.summary-label {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #111827;
  color: #fff;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: var(--shadow);
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  max-width: min(420px, calc(100vw - 32px));
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 950px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .filter-box {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-summary {
    align-items: flex-start;
    border-radius: 10px;
  }
}
