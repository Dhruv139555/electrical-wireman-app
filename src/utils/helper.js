/**
 * Helper utilities for GST calculations and number to words conversion.
 */

export function convertNumberToWords(amount) {
  const words = {
    0: '', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen',
    17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty',
    60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  const number = Math.floor(amount);
  const paiseVal = Math.round((amount - number) * 100);
  
  if (number === 0) return 'Zero Rupees Only';

  function convertLessThanThousand(num) {
    let tempWord = '';
    if (num >= 100) {
      tempWord += words[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num > 0) {
      if (num < 20) {
        tempWord += words[num];
      } else {
        tempWord += words[Math.floor(num / 10) * 10];
        if (num % 10 > 0) {
          tempWord += ' ' + words[num % 10];
        }
      }
    }
    return tempWord.trim();
  }

  let rupeeWord = '';
  let remaining = number;

  // Crores (1,00,00,000)
  if (remaining >= 10000000) {
    const crores = Math.floor(remaining / 10000000);
    rupeeWord += convertLessThanThousand(crores) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs (1,00,000)
  if (remaining >= 100000) {
    const lakhs = Math.floor(remaining / 100000);
    rupeeWord += convertLessThanThousand(lakhs) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands (1,000)
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    rupeeWord += convertLessThanThousand(thousands) + ' Thousand ';
    remaining %= 1000;
  }

  // Hundreds & units
  if (remaining > 0) {
    rupeeWord += convertLessThanThousand(remaining);
  }

  let finalWord = rupeeWord.trim() + ' Rupees';

  if (paiseVal > 0) {
    finalWord += ' and ' + convertLessThanThousand(paiseVal) + ' Paise';
  }

  return finalWord + ' Only';
}

export function calculateGST({ taxableAmount, isInterState = false, gstRate = 18 }) {
  const totalTax = (taxableAmount * gstRate) / 100;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalTax;
  } else {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  }

  const grandTotal = taxableAmount + totalTax;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  return {
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal: roundedTotal,
    roundOff: Number(roundOff.toFixed(2))
  };
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
