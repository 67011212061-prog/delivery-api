import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.html'
})
export class CustomersComponent {
  customers = input<any[]>([]);
  orders = input<any[]>([]);
  loading = input<boolean>(false);

  createCustomer = output<void>();
  onEdit = output<any>();
  onDelete = output<any>();

  searchQuery = signal<string>('');

  filteredCustomers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.customers();
    if (!q) return list;
    return list.filter(c => 
      (c.first_name && c.first_name.toLowerCase().includes(q)) ||
      (c.last_name && c.last_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address_note && c.address_note.toLowerCase().includes(q))
    );
  });

  customerOrderCount(customerId: number): number {
    return this.orders().filter(o => o.customer_id === customerId).length;
  }
}