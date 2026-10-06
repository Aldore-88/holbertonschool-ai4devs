// Compute the final price of a shopping cart after discounts and tax.

const TAX_RATE = 0.08;

function applyDiscount(subtotal, code) {
  const discounts = { SAVE10: 0.10, SAVE20: 0.20 };
  const rate = discounts[code] || 0;
  return subtotal * rate;
}

function cartTotal(items, code) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.qty;
  }

  if (subtotal > 100) {
    code = code || 'SAVE10';
  }

  const discounted = applyDiscount(subtotal, code);
  const total = discounted + discounted * TAX_RATE;
  return Math.round(total * 100) / 100;
}

const cart = [
  { name: 'Keyboard', price: 45.0, qty: 1 },
  { name: 'Mouse', price: 25.0, qty: 2 },
  { name: 'Cable', price: 5.0, qty: 1 },
];

console.log(`Total: $${cartTotal(cart, 'SAVE20')}`);
console.log(`Total: $${cartTotal(cart)}`);
console.log(`Total: $${cartTotal([{ name: 'Pen', price: 2.5, qty: 4 }])}`);
