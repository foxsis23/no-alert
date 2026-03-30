import type { WayForPayFormData } from '../types/api';

const WAYFORPAY_URL = 'https://secure.wayforpay.com/pay';

export function submitToWayForPay(formData: WayForPayFormData): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = WAYFORPAY_URL;
  form.style.display = 'none';

  function addField(name: string, value: string) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  addField('merchantAccount', formData.merchantAccount);
  addField('merchantDomainName', formData.merchantDomainName);
  addField('orderReference', formData.orderReference);
  addField('orderDate', String(formData.orderDate));
  addField('amount', formData.amount);
  addField('currency', formData.currency);
  addField('merchantSignature', formData.merchantSignature);
  addField('apiVersion', String(formData.apiVersion));
  addField('language', formData.language);

  for (const name of formData.productName) {
    addField('productName[]', name);
  }
  for (const price of formData.productPrice) {
    addField('productPrice[]', price);
  }
  for (const count of formData.productCount) {
    addField('productCount[]', String(count));
  }

  document.body.appendChild(form);
  form.submit();
}
