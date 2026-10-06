// Read quantities from form inputs (strings) and report stock statistics.

const formValues = ['10', '7', '12', '3'];

function toNumbers(values) {
  return values.map(parseInt);
}

function totalStock(values) {
  let total = 0;
  for (const v of values) {
    total += v;
  }
  return total;
}

function sortQuantities(values) {
  return values.sort();
}

function isLowStock(qty) {
  return qty == '' || qty < 5;
}

console.log('Parsed:', toNumbers(formValues));
console.log('Total:', totalStock(formValues));
console.log('Sorted:', sortQuantities([10, 7, 12, 3, 100]));
console.log('Low stock (0)?', isLowStock(0), ' Low stock (8)?', isLowStock(8));
console.log("Low stock ('')?", isLowStock(''));
