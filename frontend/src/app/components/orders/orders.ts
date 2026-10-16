import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html'
})
export class OrdersComponent {
  orders = input<any[]>([]);
  customers = input<any[]>([]);
  loading = input<boolean>(false);
  saving = input<boolean>(false);

  createOrder = output<void>();
  simulate = output<void>();
  clear = output<void>();
  onEdit = output<any>();
  onDelete = output<any>();

  searchQuery = signal<string>('');

  filteredOrders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.orders();
    if (!q) return list;
    return list.filter(o => 
      String(o.order_id).includes(q) ||
      (o.first_name && o.first_name.toLowerCase().includes(q)) ||
      (o.last_name && o.last_name.toLowerCase().includes(q)) ||
      (o.phone && o.phone.includes(q))
    );
  });

  customerName(order: any): string {
    return order.first_name ? `${order.first_name} ${order.last_name || ''}` : 'ไม่ระบุชื่อ';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }
}